# SplitSnap

AI-powered receipt splitting app for iOS and Android. Snap a photo of any receipt, let the AI parse it, assign items to people, and send payment requests — all in under 30 seconds.

Built with Expo / React Native + TypeScript.

---

## Features

- **Receipt scanning** — camera or photo library, powered by Google Cloud Vision OCR
- **AI parsing** — raw OCR text → structured line items, subtotal, tax, tip, and total via Claude API
- **Split assignment** — tag items to individuals or split evenly across a group
- **Balance ledger** — persistent group balances tracked in real time via Supabase
- **Payment requests** — pre-filled Venmo / PayPal deeplinks for frictionless settlement
- **Auth** — email/password sign up and sign in via Supabase Auth

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Expo (SDK 54) + React Native |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Backend / DB | Supabase (Postgres + RLS) |
| Auth | Supabase Auth |
| OCR | Google Cloud Vision API |
| AI Parsing | Anthropic Claude API (Haiku) |

---

## Project Structure

```
SplitSnap/
├── app/                        # Expo Router routes
│   ├── _layout.tsx             # Root layout + auth guard
│   ├── index.tsx               # Redirect → /(tabs)
│   ├── auth.tsx                # Auth route
│   ├── split.tsx               # Split modal route
│   └── (tabs)/
│       ├── _layout.tsx         # Bottom tab navigator
│       ├── index.tsx           # Home tab
│       ├── groups.tsx          # Groups tab
│       ├── scan.tsx            # Scan tab
│       └── history.tsx         # History tab
├── screens/                    # Screen components
│   ├── AuthScreen.tsx
│   ├── HomeScreen.tsx
│   ├── GroupsScreen.tsx
│   ├── ScanScreen.tsx
│   ├── SplitScreen.tsx
│   └── HistoryScreen.tsx
├── lib/
│   ├── supabase.ts             # Supabase client + auth helpers
│   ├── visionApi.ts            # Google Cloud Vision integration
│   └── receiptParser.ts        # Claude API receipt parsing
├── store/
│   └── index.ts                # Zustand stores (auth, groups, expenses, balances)
├── types/
│   └── index.ts                # Shared TypeScript types
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Supabase account — [supabase.com](https://supabase.com)
- Google Cloud account with Vision API enabled — [console.cloud.google.com](https://console.cloud.google.com)
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/yourusername/splitsnap.git
cd splitsnap
npm install
```

### Environment Setup

Add your API keys directly into the following files (move to `.env` before any public deployment):

| File | Variable | Where to get it |
|---|---|---|
| `lib/visionApi.ts` | `GOOGLE_VISION_API_KEY` | GCP Console → Credentials → API Key |
| `lib/receiptParser.ts` | `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `lib/supabase.ts` | `SUPABASE_URL` + `SUPABASE_ANON_KEY` | Supabase project → Settings → API |

### Database Setup

1. Create a new Supabase project
2. Open the SQL editor
3. Paste and run the contents of `supabase/migrations/001_initial_schema.sql`

### Run

```bash
npx expo start --clear
```

Scan the QR code with Expo Go.

---

## Receipt Parsing Pipeline

```
Phone camera / photo library
        ↓
expo-image-picker (base64)
        ↓
Google Cloud Vision API (DOCUMENT_TEXT_DETECTION)
        ↓
raw OCR text string
        ↓
Anthropic Claude API (Haiku)
        ↓
ReceiptData { items, subtotal, tax, tip, total }
        ↓
SplitScreen — item assignment UI
```

---

## Database Schema

- `users` — profiles linked to Supabase Auth
- `groups` — expense splitting groups
- `group_members` — group ↔ user membership
- `expenses` — individual bills with split type
- `expense_splits` — per-user breakdown of each expense
- `balances` — materialised net balances between user pairs

Row Level Security is enabled on all tables. Users can only read and write data they are a participant in.

---

## Roadmap

- [ ] Item-level split assignment UI
- [ ] Venmo / PayPal deeplink settlement
- [ ] Push notifications for payment requests
- [ ] Group invite via link or contact
- [ ] Offline support + sync
- [ ] `.env` migration for API keys

---

## License

MIT
