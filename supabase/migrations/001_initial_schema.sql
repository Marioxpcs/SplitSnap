-- =============================================================================
-- SplitSnap — Initial Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users
-- Mirrors auth.users but stores app-level profile data.
-- -----------------------------------------------------------------------------
create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  display_name text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

comment on table public.users is 'App-level user profiles linked to Supabase Auth.';

-- Automatically create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- groups
-- -----------------------------------------------------------------------------
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_by  uuid not null references public.users (id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.groups is 'Expense-splitting groups.';

-- -----------------------------------------------------------------------------
-- group_members
-- -----------------------------------------------------------------------------
create table public.group_members (
  group_id   uuid not null references public.groups (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

comment on table public.group_members is 'Many-to-many between groups and users.';

-- Auto-add the creator as a member when a group is created.
create or replace function public.handle_new_group()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id)
  values (new.id, new.created_by);
  return new;
end;
$$;

create trigger on_group_created
  after insert on public.groups
  for each row execute procedure public.handle_new_group();

-- -----------------------------------------------------------------------------
-- expenses
-- -----------------------------------------------------------------------------
create type public.split_type as enum ('equal', 'exact', 'percentage', 'shares');

create table public.expenses (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null references public.groups (id) on delete cascade,
  description       text not null,
  total_amount      numeric(12, 2) not null check (total_amount > 0),
  currency          char(3) not null default 'USD',
  paid_by           uuid not null references public.users (id) on delete restrict,
  split_type        public.split_type not null default 'equal',
  receipt_image_url text,
  category          text,
  created_by        uuid not null references public.users (id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.expenses is 'Individual expenses belonging to a group.';

-- -----------------------------------------------------------------------------
-- expense_splits
-- One row per (expense, user) pair describing how much each member owes.
-- -----------------------------------------------------------------------------
create table public.expense_splits (
  id          uuid primary key default gen_random_uuid(),
  expense_id  uuid not null references public.expenses (id) on delete cascade,
  user_id     uuid not null references public.users (id) on delete cascade,
  amount      numeric(12, 2) not null check (amount >= 0),
  percentage  numeric(5, 2) check (percentage between 0 and 100),
  shares      numeric(10, 2) check (shares >= 0),
  is_paid     boolean not null default false,
  paid_at     timestamptz,
  unique (expense_id, user_id)
);

comment on table public.expense_splits is 'Per-user breakdown of how each expense is split.';

-- -----------------------------------------------------------------------------
-- balances (materialised view kept up-to-date via triggers)
-- Net amount from_user_id owes to_user_id across the whole app.
-- A positive amount means from_user owes to_user.
-- -----------------------------------------------------------------------------
create table public.balances (
  id           uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users (id) on delete cascade,
  to_user_id   uuid not null references public.users (id) on delete cascade,
  group_id     uuid references public.groups (id) on delete cascade,
  amount       numeric(12, 2) not null default 0,
  currency     char(3) not null default 'USD',
  updated_at   timestamptz not null default now()
);

comment on table public.balances is
  'Materialised net balances between pairs of users (optionally per group). '
  'Recomputed by triggers on expense_splits.';

-- Unique index replaces the expression-based primary key (Postgres does not
-- allow expressions like coalesce() directly in a PRIMARY KEY constraint).
create unique index balances_unique_pair
  on public.balances (from_user_id, to_user_id, currency,
    coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- =============================================================================
-- INDEXES
-- =============================================================================

create index on public.group_members (user_id);
create index on public.expenses (group_id);
create index on public.expenses (paid_by);
create index on public.expense_splits (user_id);
create index on public.expense_splits (expense_id);
create index on public.balances (from_user_id);
create index on public.balances (to_user_id);

-- =============================================================================
-- updated_at TRIGGER HELPER
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_groups_updated_at
  before update on public.groups
  for each row execute procedure public.set_updated_at();

create trigger set_expenses_updated_at
  before update on public.expenses
  for each row execute procedure public.set_updated_at();

create trigger set_balances_updated_at
  before update on public.balances
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.users          enable row level security;
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.expenses       enable row level security;
alter table public.expense_splits enable row level security;
alter table public.balances       enable row level security;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
create policy "users: read any profile"
  on public.users for select
  using (true);

create policy "users: update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- groups
-- -----------------------------------------------------------------------------

create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create policy "groups: members can read"
  on public.groups for select
  using (public.is_group_member(id));

create policy "groups: authenticated users can create"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "groups: creator can update"
  on public.groups for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "groups: creator can delete"
  on public.groups for delete
  using (auth.uid() = created_by);

-- -----------------------------------------------------------------------------
-- group_members
-- -----------------------------------------------------------------------------

create policy "group_members: members can read roster"
  on public.group_members for select
  using (public.is_group_member(group_id));

create policy "group_members: creator can add members"
  on public.group_members for insert
  with check (
    exists (
      select 1 from public.groups
      where id = group_id and created_by = auth.uid()
    )
  );

create policy "group_members: creator or self can remove"
  on public.group_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.groups
      where id = group_id and created_by = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- expenses
-- -----------------------------------------------------------------------------

create policy "expenses: group members can read"
  on public.expenses for select
  using (public.is_group_member(group_id));

create policy "expenses: group members can add"
  on public.expenses for insert
  with check (
    public.is_group_member(group_id)
    and auth.uid() = created_by
  );

create policy "expenses: creator can update"
  on public.expenses for update
  using (auth.uid() = created_by)
  with check (public.is_group_member(group_id));

create policy "expenses: creator can delete"
  on public.expenses for delete
  using (auth.uid() = created_by);

-- -----------------------------------------------------------------------------
-- expense_splits
-- -----------------------------------------------------------------------------

create policy "expense_splits: group members can read"
  on public.expense_splits for select
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id)
    )
  );

create policy "expense_splits: expense creator can insert"
  on public.expense_splits for insert
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and e.created_by = auth.uid()
    )
  );

create policy "expense_splits: expense creator can update"
  on public.expense_splits for update
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and e.created_by = auth.uid()
    )
  );

create policy "expense_splits: user can mark own split paid"
  on public.expense_splits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "expense_splits: expense creator can delete splits"
  on public.expense_splits for delete
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and e.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- balances
-- -----------------------------------------------------------------------------

create policy "balances: participants can read"
  on public.balances for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Balances are maintained by server-side functions only — no direct client writes.