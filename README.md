<img width="1280" height="640" alt="MASSIV CART AI — Crowdsourced Grocery Price Intelligence for Jamaica" src="https://github.com/user-attachments/assets/e22ddae2-8e3a-4766-8a0c-6e6ba21ecd5a" />

<p align="center">
  <strong>The frontend for Massiv Cart AI — a map-first grocery price comparison app for Jamaica.</strong><br/>
  Search products → compare store prices → build your list → plan your route.
</p>

<p align="center">
  <a href="#quick-start"><img src="https://img.shields.io/badge/-Quick_Start-00d26a?style=for-the-badge" alt="Quick Start" /></a>&nbsp;
  <a href="#features"><img src="https://img.shields.io/badge/-Features-00d26a?style=for-the-badge" alt="Features" /></a>&nbsp;
  <a href="#architecture"><img src="https://img.shields.io/badge/-Architecture-00d26a?style=for-the-badge" alt="Architecture" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Supabase-Auth_|_DB-3ecf8e?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Mapbox_GL-Map_UI-000000?logo=mapbox&logoColor=white" alt="Mapbox GL" />
  <img src="https://img.shields.io/badge/TanStack-React_Query-FF4154?logo=reactquery&logoColor=white" alt="TanStack React Query" />
  <img src="https://img.shields.io/badge/Turbopack-Dev_Server-000000?logo=vercel&logoColor=white" alt="Turbopack" />
</p>

---

## What Is This?

This is the **Next.js frontend** for [Massiv Cart AI](https://github.com/HughScott2002/MassivCartUI) — a crowdsourced grocery price intelligence platform for Jamaica. Users search products, compare real-time prices across stores, build shopping lists with budget tracking, scan receipts for rewards, and plan multi-stop routes on an interactive map.

The UI is designed as a **single-page map application** with a glassmorphism design system, dark/light theming, and an AI-powered command bar where the AI response *is* the UI updating — no chat bubbles, no waiting screens.

---

## Features

### AI Command Bar
- **Natural language search** — type a product name, results populate the store panel instantly via `/api/command`.
- **Scan Receipt** — green pill trigger opens a category chooser (Receipt, Prescription, Gas Price, Shopping List). Image uploads are compressed client-side, parsed by Claude Vision on the backend, then confirmed for Scout Points.
- **Shopping List upload** — drop a `.txt` or `.csv` file. Each line is searched and the cheapest option per item is auto-added to My List.
- **Quick actions** — "Find nearby" and "Add to list" pills switch panel context without navigation.
- **Query-aware ranking** — search results sort by relevance so exact matches (e.g. "spaghetti") always surface first.

### Store & My List Panel
- **Store tab** — one row per product, expandable to show every store + price. "Add" buttons on each store row so users choose *where* to buy, not just what.
- **My List tab** — aggregated shopping list with per-item remove, running total feeding the budget tracker.
- **Route planning** — stops derived from unique stores in My List; map fits the route automatically.

### Weekly Budget Dashboard
- Inline budget input with a progress bar comparing basket total against the set budget.
- Eye icon toggle to show/hide the budget value (privacy in public).
- Persisted in `localStorage` — survives refresh, sign-out, and re-login.

### Interactive Map
- **Mapbox GL** via `react-map-gl` with store markers, labels, and fly-to on selection.
- **Theme-aware** — marker labels adapt background color for dark/light mode readability.
- **High-accuracy geolocation** — `enableHighAccuracy: true`, `maximumAge: 0`, `timeout: 15000`.

### Authentication
- **Supabase Auth** — Google OAuth and email/password with strict password policy (12+ chars, upper/lower, number, special character, no spaces).
- **Profile popout** — modal with email, display name, member since date, streak days, points, tier, and demo spending charts. No separate profile page.
- **Origin-aware redirects** — `window.location.origin` ensures localhost stays on localhost after OAuth.

### Mobile-First Responsive
- Dashboard and Store/List panels collapse into pill buttons on small viewports.
- Panels open as overlays with backdrop dismissal.
- Command bar adapts padding and text size for narrow screens (tested at 370×800).

### Developer Experience
- **Demo fallback** — when the backend is unreachable in development, `/api/command` returns seeded demo results from `lib/demo-results.ts` so the full search → add-to-list flow works without any backend running.
- **Graceful degradation** — `/api/dashboard` returns 503 with a clear message instead of throwing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App Router                   │
├──────────────┬──────────────┬───────────────────────────┤
│  Command Bar │  Map (Mapbox)│  Store / My List Panel    │
│  AI Search   │  Markers     │  Budget Dashboard         │
│  Receipt Scan│  Geolocation │  Route Planning           │
├──────────────┴──────────────┴───────────────────────────┤
│                   API Routes (/api/*)                     │
│  /command  /receipt  /dashboard  /pois  /stores  /admin  │
├──────────────────────────────────────────────────────────┤
│          Supabase (Auth + DB)    │    Backend API         │
│          Mapbox GL               │    (Receipt parsing,   │
│          localStorage            │     product catalog)   │
└──────────────────────────────────┴───────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- Supabase project (URL + anon key)
- Mapbox access token

### 1. Clone & install

```bash
git clone https://github.com/HughScott2002/MassivCartUI.git
cd MassivCartUI
bun install    # or: npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Optional — backend API (defaults to http://localhost:8000)
BACKEND_URL=http://localhost:8000

# Optional — client-side direct API access
# NEXT_PUBLIC_API_URL=https://api.massivcart.com

# Optional — elevated Supabase access for server-side routes
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **No backend? No problem.** In development, search and dashboard degrade gracefully with demo data.

### 3. Run

```bash
bun dev    # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Run production server |
| `bun run lint` | ESLint |
| `bun run typecheck` | TypeScript check (no emit) |

---

## Project Structure

```
MassivCartUI/
├── app/
│   ├── page.tsx                    # Main SPA — map, header, panels, command bar
│   ├── layout.tsx                  # Root layout, providers
│   ├── profile/page.tsx            # Redirects to / (profile is a popout)
│   ├── admin/                      # Admin UI — stats, synthetic seed
│   └── api/
│       ├── command/route.ts        # Search proxy + dev demo fallback
│       ├── dashboard/route.ts      # Dashboard proxy + 503 handling
│       ├── receipt/route.ts        # Receipt image upload proxy
│       ├── receipt/confirm/route.ts
│       ├── health/route.ts
│       ├── pois/                   # POI / places endpoints
│       ├── stores/                 # Store submission
│       └── admin/                  # Stats, synthetic seed/status
├── components/
│   ├── command-bar.tsx             # AI search, scan receipt, quick actions
│   ├── shop-details-sheet.tsx      # Store results + My List tabs
│   ├── shopping-preferences.tsx    # Budget dashboard
│   ├── map-background.tsx          # Mapbox map, markers, geolocation
│   ├── header.tsx                  # Theme toggle, nav, user menu
│   ├── profile-popup.tsx           # Profile modal with stats + charts
│   ├── auth-modal.tsx              # Login / signup with password policy
│   ├── tutorial-overlay.tsx        # First-run onboarding
│   └── grid-menu.tsx              # Store type filter
├── lib/
│   ├── auth-context.tsx            # Supabase auth provider + tutorial state
│   ├── supabase.ts                 # Supabase client
│   ├── types.ts                    # SearchResult, ListItem, ReceiptData, etc.
│   ├── demo-results.ts            # Seeded results for dev mode
│   ├── api-config.ts              # getServerApiUrl, getClientApiUrl
│   └── utils.ts
└── public/
    └── sample-shopping-list.txt    # Example list for upload testing
```

---

## Key Flows

### Search → Add to List
1. User types in the command bar → `POST /api/command`
2. Results populate the Store panel, sorted by query relevance
3. Each result expands to show per-store pricing with individual "Add" buttons
4. Added items flow into My List → basket total updates → budget progress bar reacts

### Scan Receipt → Scout Points
1. Tap "Scan Receipt" → choose category (Receipt / Prescription / Gas Price / Shopping List)
2. **Image path:** select photo → client-side compression → `POST /api/receipt` → confirm address → review extracted items → `POST /api/receipt/confirm` → points awarded
3. **List path:** upload `.txt`/`.csv` → each line searched → cheapest match auto-added to My List

### Budget Tracking
- Budget value reads from / writes to `localStorage` (`massivcart_weekly_budget`)
- Progress bar = `cartTotal` (My List sum) vs. budget
- Persists across sessions — no account required

---

## Design System

| Token | Value | Role |
|---|---|---|
| `--primary` | `#00d26a` | Primary actions, active states, focus rings |
| `--accent` | `#00d26a` | Accent highlights |
| `--destructive` | `#ef4444` | Errors, warnings, over-budget indicators |
| `--background` | `#1a1a2e` / `#ffffff` | Page background (dark / light) |
| `--card` | `rgba(20,20,40,0.85)` | Card surfaces (glassmorphism) |
| `--muted-foreground` | `#9ca3af` | Subdued text, labels |
| `--border` | `rgba(255,255,255,0.1)` | Dividers, outlines |

---

## Notes

- **lucide-react** — if TypeScript reports missing types, add `declare module "lucide-react";` in a `.d.ts` file.
- **Mapbox** — ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set or the map component will not render.
- **Supabase redirect** — auth uses `redirectTo: window.location.origin` so post-login redirect stays on the current origin.

---

## License

This project is licensed under the **MIT No Commercial License (MIT-NC)** — free to view, study, and fork for personal and educational use. Commercial use is not permitted. See [LICENSE](LICENSE) for details.

© 2026 Massiv Cart
