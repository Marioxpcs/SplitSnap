import { create } from 'zustand';
import type { User, Group, Expense, Balance } from '../types';

// ---------------------------------------------------------------------------
// Auth slice
// ---------------------------------------------------------------------------

type AuthState = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));

// ---------------------------------------------------------------------------
// Groups slice
// ---------------------------------------------------------------------------

type GroupsState = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  removeGroup: (id: string) => void;
};

export const useGroupsStore = create<GroupsState>((set) => ({
  groups: [],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) =>
    set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (id, patch) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    })),
  removeGroup: (id) =>
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),
}));

// ---------------------------------------------------------------------------
// Expenses slice
// ---------------------------------------------------------------------------

type ExpensesState = {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
};

export const useExpensesStore = create<ExpensesState>((set) => ({
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id, patch) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    })),
  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),
}));

// ---------------------------------------------------------------------------
// Balances slice
// ---------------------------------------------------------------------------

type BalancesState = {
  balances: Balance[];
  setBalances: (balances: Balance[]) => void;
};

export const useBalancesStore = create<BalancesState>((set) => ({
  balances: [],
  setBalances: (balances) => set({ balances }),
}));
