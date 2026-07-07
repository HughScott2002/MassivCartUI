<img width="1280" height="320" alt="MASSIV CART AI = Realtime price intelligence for almost anything near you" src="https://github.com/user-attachments/assets/19383b63-9c9a-44eb-a9a8-cbfc17d5ccb8" />


<p align="center">
  <strong>Realtime price intelligence for almost anything near you.</strong><br/>
  Find the cheapest deal → upload a receipt to earn Scout Points → let AI do the shopping math.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🚧_VISION_TOOLCHAIN-UNDER_MAINTENANCE-f59e0b?style=for-the-badge" alt="Vision toolchain under maintenance" />
</p>
<p align="center">
  <sub><strong>Receipt scanning is temporarily down</strong> — I'm reworking the vision pipeline right now. Everything else works.</sub>
</p>

<p align="center">
  <a href="#quick-start"><img src="https://img.shields.io/badge/-Quick_Start-00d26a?style=for-the-badge" alt="Quick Start" /></a>&nbsp;
  <a href="#features"><img src="https://img.shields.io/badge/-Features-00d26a?style=for-the-badge" alt="Features" /></a>&nbsp;
  <a href="#architecture"><img src="https://img.shields.io/badge/-Architecture-00d26a?style=for-the-badge" alt="Architecture" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?logo=nextdotjs" alt="Next.js 16.1.6" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Supabase-Auth_|_Postgres-3ecf8e?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Mapbox_GL-3.x-000000?logo=mapbox&logoColor=white" alt="Mapbox GL" />
  <img src="https://img.shields.io/badge/TanStack_Query-5.x-FF4154?logo=reactquery&logoColor=white" alt="TanStack Query 5" />
</p>

---

## What Is This?

**Massiv Cart AI** is a Jamaican grocery price intelligence app. Type "cheapest cooking oil near me" into the command bar, the AI parses your intent, and the map flies to the cheapest store. Upload a photo of your receipt to earn Scout Points. Drop a `.txt` shopping list and get prices auto-filled from every store near you.

---

## Features

| # | Feature | How it works |
|---|---------|-------------|
| 1 | **AI Command Bar** | Natural-language search ("cheapest rice near me") → NLP via Claude → ranked price cards |
| 2 | **Scan Receipt** | Photo → browser-resized (max 1280 px, 0.82 quality) → `POST /api/receipt` → Claude Vision OCR → inline review → `POST /api/receipt/confirm` → **+100 Scout Points** |
| 3 | **Shopping List Upload** | Upload a `.txt` / `.csv` (one item per line) → each line searched via `/api/command` → cheapest price auto-added to My List |
| 4 | **Store / My List Panel** | Two-tab right panel — **Store** shows price cards for the selected map pin; **My List** tracks items added from search results, with a live total |
| 5 | **Weekly Budget Tracker** | Set a weekly budget (stored in `localStorage` under `massivcart_weekly_budget`); cart total is the sum of prices in My List |
| 6 | **Live Map** | Mapbox GL (react-map-gl v8) centered on Kingston, JM; store pins categorised as grocery, pharmacy, wholesale, hardware, or fuel; map flies to cheapest store on search |
| 7 | **Auth** | Supabase email/password + Google OAuth; unauthenticated users are prompted before search or scan |
| 8 | **Dashboard & Scout Points** | Points, tier (Shopper → Smart Shopper → Price Scout → Community Champ → Elite), streak, savings mode selector |
| 9 | **Dark / Light Theme** | System-default dark; toggle in header via next-themes |
| 10 | **Mobile Responsive** | Panels collapse on screens < 640 px; command bar pinned to bottom |

---

## Architecture

```
Browser (this repo — Next.js 16.1.6, port 3000)
  ├── Mapbox GL map (react-map-gl v8, imports: react-map-gl/mapbox)
  ├── Supabase Auth (email/password + Google OAuth)
  ├── TanStack React Query v5 (data fetching + cache invalidation)
  └── next.config.mjs rewrites → proxy /api/* to Express:8000

Next.js API Routes (server-side, same origin)
  ├── GET  /api/pois                       ← reads data/stores-cache.json
  ├── GET  /api/pois/supabase              ← live store pins from Supabase
  ├── GET  /api/pois/places-cache          ← raw Google Places cache
  ├── POST /api/command                    ← proxies → Express /api/command
  ├── GET  /api/dashboard                  ← proxies → Express /api/dashboard
  ├── POST /api/receipt                    ← proxies → Express /api/receipt
  ├── POST /api/receipt/confirm            ← proxies → Express /api/receipt/confirm
  ├── GET  /api/health                     ← proxies → Express /health
  ├── POST /api/stores/submit              ← direct Supabase insert (service role)
  ├── POST /api/admin/synthetic-seed       ← proxies → Express (+ PLACES_SYNC_SECRET header)
  ├── POST /api/admin/synthetic-seed/all   ← proxies → Express
  └── GET  /api/admin/stats                ← proxies → Express /api/stats

Express API (MassivCartAPI — port 8000)
  └── see MassivCartAPI repo for full route reference
```

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI Runtime** | React | ^19.2.4 |
| **Language** | TypeScript | ^5.9.3 |
| **Styling** | Tailwind CSS v4 + tw-animate-css | ^4.1.18 |
| **Component primitives** | radix-ui + shadcn | radix-ui ^1.4.3 |
| **Icons** | lucide-react | ^0.577.0 |
| **Map** | mapbox-gl + react-map-gl | ^3.20.0 / ^8.1.0 |
| **Auth + DB** | @supabase/supabase-js | ^2.99.1 |
| **Data fetching** | @tanstack/react-query | ^5.90.21 |
| **Fonts** | Figtree (sans) + Geist Mono | via next/font/google |
| **Analytics** | @vercel/analytics | ^2.0.1 |
| **Dev bundler** | Turbopack | built into Next.js 16 |

---

## Design System

CSS variables are defined in `app/globals.css`. Key values:

| Variable | Light | Dark |
|---|---|---|
| `--background` | `#ffffff` | `#1a1a2e` |
| `--primary` | `#00d26a` | `#00d26a` |
| `--secondary` | `#e8f5ee` | `#16213e` |
| `--card` | `rgba(255,255,255,0.85)` | `rgba(20,20,40,0.85)` |
| `--destructive` | `#ef4444` | `#ff6b6b` |
| `--radius` | `0.75rem` | `0.75rem` |

---

## Project Structure

```
MassivCartUI/
├── app/
│   ├── admin/
│   │   ├── AdminClient.tsx         # Admin page client component
│   │   └── page.tsx                # Admin page (synthetic seeder UI)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── stats/route.ts      # GET  /api/admin/stats
│   │   │   ├── synthetic-seed/
│   │   │   │   ├── all/route.ts    # POST /api/admin/synthetic-seed/all
│   │   │   │   └── route.ts        # POST /api/admin/synthetic-seed
│   │   │   └── synthetic-status/route.ts
│   │   ├── command/route.ts        # POST /api/command  (proxy → Express)
│   │   ├── dashboard/route.ts      # GET  /api/dashboard (proxy → Express)
│   │   ├── health/route.ts         # GET  /api/health    (proxy → Express)
│   │   ├── pois/
│   │   │   ├── places-cache/route.ts
│   │   │   ├── route.ts            # GET  /api/pois (reads stores-cache.json)
│   │   │   └── supabase/route.ts   # GET  /api/pois/supabase
│   │   ├── receipt/
│   │   │   ├── confirm/route.ts    # POST /api/receipt/confirm (proxy → Express)
│   │   │   └── route.ts            # POST /api/receipt (proxy → Express)
│   │   └── stores/
│   │       └── submit/route.ts     # POST /api/stores/submit (direct Supabase)
│   ├── profile/page.tsx            # Redirects → /
│   ├── globals.css                 # Tailwind v4 + CSS variables
│   ├── layout.tsx                  # Root layout — Figtree font, ThemeProvider, QueryProvider, AuthProvider
│   └── page.tsx                    # Main page — map + panels + command bar
├── components/
│   ├── ui/button.tsx               # shadcn button primitive
│   ├── add-store-modal.tsx
│   ├── auth-modal.tsx              # Supabase email/password + Google OAuth
│   ├── budget-popup.tsx
│   ├── command-bar.tsx             # AI command bar + scan receipt + list upload
│   ├── grid-menu.tsx
│   ├── header.tsx                  # Top bar — theme toggle, locate, category filter
│   ├── map-background.tsx          # Mapbox GL map with store pins
│   ├── notification-bell.tsx
│   ├── profile-popup.tsx
│   ├── providers.tsx
│   ├── query-provider.tsx          # TanStack React Query provider
│   ├── receipt-review-sheet.tsx
│   ├── shop-details-sheet.tsx      # Store / My List two-tab panel
│   ├── shopping-preferences.tsx    # Dashboard — points, tier, savings mode, weekly budget
│   ├── theme-provider.tsx
│   └── tutorial-overlay.tsx
├── data/
│   └── stores-cache.json           # Google Places store data (populated by MassivCartAPI)
├── lib/
│   ├── api-config.ts               # getServerApiUrl() / getClientApiUrl() helpers
│   ├── auth-context.tsx            # AuthProvider — session, signIn, signUp, Google OAuth
│   ├── demo-results.ts             # Fallback search results for offline/demo mode
│   ├── poi-provider.ts             # POI types and helpers
│   ├── supabase.ts                 # Supabase browser client
│   ├── types.ts                    # SearchResult, ListItem, ReceiptData, etc.
│   └── utils.ts                    # cn() and shared utilities
├── public/
│   └── sample-shopping-list.txt    # Example list file for the upload feature
├── next.config.mjs                 # Rewrites: /api/pois + /api/admin/* → Next.js; all other /api/* → Express
├── package.json
├── bun.lock
├── postcss.config.mjs
└── tsconfig.json
```

---

## Quick Start

### Dependencies

Everything the dev environment needs, and what each piece is for:

| Dependency | Required? | What it's for |
|---|---|---|
| [MassivCartAPI](https://github.com/HughScott2002/MassivCartAPI) running locally | **Yes** | The Express backend *and* the local Supabase stack (database + sign-in) — `make up` in that repo starts both |
| [Mapbox access token](https://console.mapbox.com/) | **Yes** for the map | The store map view. Free account; use a public `pk.` token. Everything else renders without it |
| [Nix](https://nixos.org/download) with flakes | Recommended | Provides the exact Bun and Node 22 versions (see below) |
| Node.js 22+ and [Bun](https://bun.sh) | Only without Nix | Manual alternative to the Nix shell |

Sign-in (email/password) and all data come from the local Supabase stack
started by MassivCartAPI — no cloud Supabase account needed. The Google
sign-in button is the one exception: it needs real OAuth credentials and
stays non-functional locally.

#### What is Nix, and why is it here?

[Nix](https://nixos.org/download) is a package manager that reads this
repo's `flake.nix` and drops you into a shell with the **exact same
toolchain versions on every machine** (pinned in `flake.lock`) — nothing
installed globally, nothing to uninstall later. Usage:

```bash
nix develop    # enter the dev shell (first run downloads the toolchain)
exit           # leave it — your system is untouched
```

If you use [direnv](https://direnv.net), `direnv allow` once makes the
shell load automatically every time you `cd` in. Flakes may need enabling
on a fresh Nix install — add `experimental-features = nix-command flakes`
to `~/.config/nix/nix.conf` (the [Determinate installer](https://determinate.systems/nix-installer/)
ships with this on).

Don't want Nix? Install Node 22+ and Bun yourself and every command below
works the same.

### 1. Clone & enter the dev shell

```bash
git clone https://github.com/HughScott2002/MassivCartUI.git
cd MassivCartUI
nix develop        # provides bun + node 22; auto-runs bun install
```

### 2. Configure

Copy `.env.example` to `.env.local`. The Supabase defaults point at the
**local stack** started by `make up` in MassivCartAPI (deterministic local
development keys — no cloud account needed). Sign-up and email/password
sign-in work against it out of the box; the Google sign-in button requires
real OAuth credentials and stays non-functional locally.

Fill in the rest as needed:

```env
# Mapbox (browser-safe) — required for the map view
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox-access-token>

# Optional: direct client-side API URL (leave blank to use Next.js proxy)
NEXT_PUBLIC_API_URL=

# Admin secret — must match PLACES_SYNC_SECRET in MassivCartAPI
PLACES_SYNC_SECRET=<random-hex>
```

Using **cloud Supabase** instead? Swap `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` for your project's values.

### 3. Run

```bash
bun run dev     # Turbopack dev server at http://localhost:3000
```

### 4. Build for production

```bash
bun run build
bun run start
```

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with Turbopack (`next dev --turbopack`) |
| `bun run build` | Production build (`next build`) |
| `bun run start` | Start production server (`next start`) |
| `bun run lint` | Run ESLint |
| `bun run format` | Prettier — format all `.ts` / `.tsx` files |
| `bun run typecheck` | TypeScript type check without emitting (`tsc --noEmit`) |

---

## Key Flows

### Search flow

```
User types "cheapest rice" in CommandBar
→ POST /api/command { message, intent: "find", savingsMode, userLat, userLng }
→ Next.js proxy → Express POST /api/command
→ Claude parses intent → searchProducts()
→ Results returned → map flies to cheapest store
```

### Receipt scan flow

```
User taps "Scan Receipt" → selects category (Receipt / Prescription / Gas Price / Shopping List)
→ Camera opens → browser resizes image (max 1280 px, quality 0.82, canvas-based)
→ POST /api/receipt (multipart, image field)
→ Next.js proxy → Express POST /api/receipt → Claude Vision OCR
→ ReceiptData returned → inline review / edit
→ User confirms store address → POST /api/receipt/confirm
→ Next.js proxy → Express → persist + award 100 pts
→ "+100 pts" float animation, React Query cache invalidated
```

### Shopping list upload flow

```
User selects "Shopping List" category → picks .txt or .csv file (one item per line)
→ Each line → POST /api/command { message: line, intent: "find" }
→ Cheapest result auto-added to My List
→ Tab switches to My List when done
```

### Budget tracking

```
Weekly budget stored in localStorage (key: massivcart_weekly_budget)
Cart total = sum of prices for all items in My List
Progress bar shown in left panel (ShoppingPreferences component)
```

---

## Environment Variables

| Variable | Side | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Yes | Supabase anon (public) key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Browser | Yes | Mapbox access token |
| `BACKEND_URL` | Server only | Yes | Express API base URL (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_API_URL` | Browser | No | Direct client API URL; leave blank to use Next.js proxy |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | No | Service role key for `/api/stores/submit` (bypasses RLS) |
| `PLACES_SYNC_SECRET` | Server only | No | Admin secret forwarded to Express on seeder routes |

> Never expose `SUPABASE_SERVICE_ROLE_KEY` or `PLACES_SYNC_SECRET` to the browser. They are used only in Next.js API route handlers.

---

## Related Repos

| Repo | Description |
|---|---|
| **MassivCartUI** (this repo) | Next.js 16 frontend — map, command bar, receipt upload, budget tracker |
| **[MassivCartAPI](https://github.com/HughScott2002/MassivCartAPI)** | Express 5 backend — Claude AI, receipt OCR, Upstash Redis, Supabase |

---

## Built With

**Massiv Cart AI** was built in 24 hours at the [Intellibus Hackathon](https://intellibus.com) (March 2026).

---

## Contributors

| Contributor | Links |
|---|---|
| **Hugh Scott** — creator | [GitHub](https://github.com/HughScott2002) · [LinkedIn](https://www.linkedin.com/in/hugh-scott-3912421a5) · [Website](https://hughscott.dev) · [X](https://x.com/hughscottjr) |
| **Mark Hinds** | [GitHub](https://github.com/pro-m16) · [LinkedIn](https://www.linkedin.com/in/mark-hinds-013367204) |
| **Barrington Patterson** | [GitHub](https://github.com/barry-g1076) · [LinkedIn](https://www.linkedin.com/in/barrington-patterson-7b86aa22a) · [Portfolio](https://barrington-portfolio.vercel.app) |

---

## License

This project is licensed under the **MIT No Commercial License (MIT-NC)** — free to view, study, and fork for personal and educational use. Commercial use is not permitted. See [LICENSE](LICENSE) for details.

© 2026 Massiv Cart
