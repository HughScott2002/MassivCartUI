#MASSIVCARTUI
# MassivCart UI

A Next.js web app for comparing prices across stores, building shopping lists, scanning receipts for Scout Points, and planning routes. Built for the Jamaican market with support for multiple store types (grocery, hardware, pharmacy, fuel, wholesale).

---

## Features

### Authentication
- **Supabase Auth**: Sign in with Google (OAuth) or email/password; sign up with display name.
- **Auth modal**: In-app login/signup with password policy (12+ chars, upper/lower, number, special character, no spaces).
- **Profile**: Header dropdown with “User profile” (opens profile popout) and “Sign out”. Redirect after Google auth uses `window.location.origin` so localhost stays on localhost.

### Profile popout
- Modal (no separate profile page): email, display name, **Member since** from Supabase `users.created_at`.
- Stats from Supabase: **Streak days**, **Points**, **Tier**.
- Demo charts: monthly spending and category breakdown.

### Command bar (AI search)
- **Search**: Text input submits to `/api/command`; results appear in the Store panel. Query-based sorting so matches (e.g. “spaghetti”, “macaroni”) rank higher in demo results.
- **Scan Receipt**: Green pill when the input is empty. Opens a category chooser:
  - **Receipt** / **Prescription** / **Gas Price**: Image upload → compress → `/api/receipt` → address confirmation → review items → confirm → `/api/receipt/confirm` for Scout Points (e.g. +100).
  - **Shopping List**: File upload (`.txt` or `.csv`, one item per line). Each line is searched via `/api/command`; the **cheapest** option is auto-added to My List. No per-item confirmation.
- **Find nearby** / **Add to list**: Pills switch the right panel tab (Store vs My List).
- **Responsive**: On small viewports (e.g. 370×800), the Scan Receipt pill and main bar use smaller padding and text; layout shifts slightly left for fit.

### Store & My List panel
- **Store tab**: Search results with one row per product. Each **store/price** has an “Add” button so the user can choose which store to add (not only the cheapest). Clicking a row/store can fly the map to that location.
- **My List tab**: Items added from search (product + store + price). **Remove** (trash) per item. List total is used in the Weekly Budget section.
- **Route**: Stops derived from My List (by store); map can fit the route.

### Weekly budget (dashboard)
- Inline in the left panel (no separate popup): budget amount input and a **current basket** progress bar (budget vs `cartTotal` from My List).
- **Eye icon**: Toggle to show/hide the budget value.
- **Persistence**: Stored in `localStorage` (`massivcart_weekly_budget`) so it survives refresh and sign-out.
- Styling: bold “Weekly Budget” label, primary background, clear progress bar.

### Map
- **Mapbox GL** via `react-map-gl`: store markers and labels.
- **Theme-aware labels**: Dark mode uses dark background for store names; light mode uses light background for readability.
- **Geolocation**: User location with high-accuracy options (`enableHighAccuracy: true`, `maximumAge: 0`, `timeout: 15000`).
- **POIs**: Stores from provider; selection and fly-to support.

### Mobile
- **Panels**: Left (Dashboard) and right (Store / My List) collapse into **pill buttons** on the right; panels open as overlays (higher z-index). Default state on mobile: panels closed.
- **Backdrop**: Overlay behind open panels for dismissal.

### Development / fallbacks
- **Search**: If `/api/command` cannot reach the backend in **development**, the API route returns **demo results** (`lib/demo-results.ts`) so search and “Add to list” work without the backend. Results are sorted by query match (e.g. “spaghetti” puts Spaghetti at the top).
- **Dashboard**: `/api/dashboard` returns 503 with a clear message when the backend is unreachable instead of throwing.

---

## Tech stack

| Area           | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 16 (App Router, Turbopack)  |
| UI             | React 19, TypeScript                 |
| Styling        | Tailwind CSS 4                      |
| Auth & DB      | Supabase (auth + `users` table)     |
| Map            | Mapbox GL, react-map-gl              |
| Data / cache   | TanStack React Query                 |
| Icons          | Lucide React                        |

---

## Prerequisites

- Node.js 18+
- Bun or npm (lockfiles: `bun.lock` / `package-lock.json`)
- Supabase project (URL + anon key; optional service role for some API routes)
- Mapbox access token (for the map)
- Backend API (optional in dev; see Environment variables)

---

## Environment variables

Create `.env.local` in the project root (do not commit secrets).

| Variable                     | Required | Description |
|-----------------------------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL`   | Yes      | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes   | Supabase anon (public) key |
| `NEXT_PUBLIC_MAPBOX_TOKEN`   | Yes      | Mapbox public access token |
| `BACKEND_URL`                | No*      | Backend API base URL (e.g. `http://localhost:8000` or production API). Default: `http://localhost:8000`. |
| `NEXT_PUBLIC_API_URL`        | No       | If set, client may call backend directly; otherwise uses Next.js `/api/*` proxy. |
| `SUPABASE_SERVICE_ROLE_KEY`   | No**     | Used by some API routes (e.g. stores submit); can fall back to anon key. |

\* Without a running backend, search and dashboard still work in development using demo data and 503 handling.  
\** Only needed for server-side Supabase operations that require elevated privileges.

---

## Installation

```bash
# Install dependencies (use one)
bun install
# or
npm install
```

---

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `bun dev`      | Start dev server (Turbopack)   |
| `npm run dev`  | Same with npm                  |
| `bun run build`| Production build               |
| `bun run start`| Run production server          |
| `bun run lint` | Run ESLint                     |
| `bun run typecheck` | TypeScript check (no emit) |

---

## Project structure (high level)

```
├── app/
│   ├── page.tsx              # Main app: map, header, panels, CommandBar
│   ├── layout.tsx            # Root layout, providers
│   ├── profile/
│   │   └── page.tsx           # Redirects to / (profile is a popout)
│   ├── admin/                # Admin UI (stats, synthetic seed, etc.)
│   └── api/
│       ├── command/route.ts  # Search proxy; dev fallback to demo results
│       ├── dashboard/route.ts# Dashboard proxy; 503 on backend failure
│       ├── receipt/route.ts   # Receipt image upload proxy
│       ├── receipt/confirm/route.ts
│       ├── health/route.ts
│       ├── pois/              # POI/places endpoints
│       ├── stores/             # Store submit
│       └── admin/              # Stats, synthetic-seed, synthetic-status
├── components/
│   ├── command-bar.tsx        # Search, Scan Receipt, Find nearby, list upload
│   ├── shop-details-sheet.tsx # Store results + My List tabs, add/remove
│   ├── shopping-preferences.tsx# Dashboard: savings mode, weekly budget
│   ├── map-background.tsx     # Mapbox map, markers, geolocation
│   ├── header.tsx             # Theme, nav, user menu, profile popout
│   ├── profile-popup.tsx      # Profile modal (member since, points, tier, graphs)
│   ├── auth-modal.tsx         # Login/signup, password policy
│   ├── tutorial-overlay.tsx
│   ├── grid-menu.tsx          # Store type filter
│   └── ...
├── lib/
│   ├── auth-context.tsx      # Supabase auth, requireAuth, tutorial state
│   ├── supabase.ts           # Supabase client
│   ├── types.ts               # SearchResult, ListItem, ReceiptData, etc.
│   ├── demo-results.ts        # Seeded search results for dev
│   ├── api-config.ts          # getServerApiUrl, getClientApiUrl
│   ├── poi-provider.ts
│   └── utils.ts
└── public/
    └── sample-shopping-list.txt  # Example list for “Upload list” (one item per line)
```

---

## Key flows

### Search and add to list
1. User types in the command bar and submits (or uses Find nearby).
2. `page.tsx` calls `onSearchResults` → sets `searchResults` and switches to the Store tab.
3. In the Store tab, each result shows store/price rows; “Add” calls `onAddToList(result, price)` so the user can pick a specific store.
4. My List holds `ListItem[]`; list total is passed as `cartTotal` into the Weekly Budget section.

### Scan Receipt
1. User clicks **Scan Receipt** → category chooser (Receipt, Prescription, Gas Price, Shopping List).
2. **Image path**: User selects image → resize → POST `/api/receipt` → address step → review items → confirm → POST `/api/receipt/confirm` → points awarded, `onPointsAwarded` called.
3. **Shopping List path**: User selects `.txt`/`.csv` → file read → for each non-empty line: POST `/api/command` → take first result’s cheapest price → `onAddToList(result, prices[0])` → toast and switch to My List tab.

### Weekly budget
- Budget value is read/written from/to `localStorage` on change; initial state is hydrated from `localStorage` so it persists across sessions and sign-out.
- Progress bar uses `cartTotal` (My List total) against the budget.

---

## Demo data

- **Search**: In development, when the backend is unreachable, `/api/command` returns `DEMO_RESULTS` from `lib/demo-results.ts`, sorted by query (e.g. “rice”, “spaghetti”, “macaroni”).
- **Sample list**: `public/sample-shopping-list.txt` contains one item per line (e.g. rice, cooking oil, chicken, bread, spaghetti) for testing the Shopping List upload.

---

## Notes

- **lucide-react**: If TypeScript reports missing types, add a declaration (e.g. `declare module "lucide-react";` in a `.d.ts` file).
- **Map**: Ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set; the map component uses `react-map-gl` with Mapbox.
- **Supabase redirect**: Auth is configured to use `redirectTo: window.location.origin` so post-login redirect stays on the current origin (e.g. localhost).

---

## License

Private. All rights reserved.
