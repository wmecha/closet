# Cognexa Thrift Operations

Standalone operations software for a curated ladies' thrift-fashion business in Meru, Kenya. The first release is deliberately focused on one decision: how much stock to buy, at what landed cost, and with what downside risk.

## Architecture

- **Next.js 16 App Router + React 19** for the web application and protected routes.
- **Supabase Auth, PostgreSQL, Storage and RLS** for identity, persistence and authorization.
- **Feature-first application code** under `features/planner`.
- **Pure integer financial functions** under `lib/calculations`; money is stored as whole Kenyan shillings and percentage inputs are whole percentages.
- **React Hook Form + Zod** for planner state and validation.
- **Recharts** for live channel and recovery visualizations.
- **Vitest** for calculation coverage and **Playwright** for the critical planner workflow.
- **Local planning mode** uses browser storage when Supabase is not configured. It is useful for immediate evaluation, but production must use Supabase and RLS.

```text
app/                         Routes, auth callback and protected app shell
components/                  Application shell and shadcn/ui source
features/planner/            Planner forms, persistence, exports and views
lib/calculations/            Pure financial calculation engine
lib/supabase/                Browser/server clients and session proxy
supabase/migrations/         PostgreSQL schema, triggers and RLS
tests/unit/                  Financial calculation tests
tests/e2e/                   Critical planner workflow
docs/                        Formula, database, roles and deployment notes
```

## Completed: Milestone 1

- Email/password signup, login, logout route and password reset.
- First-user Owner/Admin workspace bootstrap.
- Protected application routes and Supabase Row Level Security.
- Scenario create, edit, duplicate, archive and draft deletion.
- Automatic draft preservation and explicit save.
- Budget-driven and quantity-driven category planning.
- Startup/acquisition expense allocation and equal-per-item landed cost.
- Markup/margin pricing, five price-rounding methods and category price guidance.
- Revenue, profit, break-even, return-on-capital and cash-recovery calculations.
- Conservative, Expected and Optimistic derived views.
- Custom sensitivity analysis.
- Up-to-four scenario comparison.
- Print-friendly report, scenario/category/checklist CSV and WhatsApp summary.
- Honest “Coming next” screens for deferred modules.

## Local setup

Requirements: Node.js 20.9 or newer, npm, Git, and Docker Desktop if running Supabase locally.

```powershell
npm install
Copy-Item .env.example .env.local
```

For an immediate planner preview without authentication, set:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

Then run:

```powershell
npm run dev
```

Open `http://localhost:3000`. Local preview scenarios are stored in browser local storage.

## Supabase setup

### Hosted project

1. Create a Supabase project.
2. Copy the project URL and publishable key from **Project Settings → API**.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.
4. Set `NEXT_PUBLIC_DEMO_MODE=false`.
5. Link and push the database:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

6. In Supabase Auth URL configuration, set the site URL and allow:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_DOMAIN/auth/callback`

The migration creates profiles, businesses, roles, settings, scenarios, normalized expenses/categories, audit logs, private storage, triggers and RLS. The first signed-up user automatically receives the `owner_admin` role in a new workspace.

### Local Supabase

```powershell
npm run db:start
npm run db:reset
```

Copy the local API URL and publishable key printed by `supabase status` into `.env.local`, then set `NEXT_PUBLIC_DEMO_MODE=false`.

## Verification

```powershell
npm run lint
npx tsc --noEmit
npm test
npm run test:e2e
npm run build
```

## Deployment

Deploy the repository to Vercel and add these environment variables to Preview and Production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_DEMO_MODE=false
```

Run `npm run db:push` against the production Supabase project before first use. Never add service-role keys to browser-visible environment variables.

## Documentation

- [Financial formulas](docs/financial-formulas.md)
- [Database design](docs/database.md)
- [Roles and permissions](docs/roles-permissions.md)
- [Deployment and operations](docs/deployment.md)

## Deferred

Milestone 2 buying trips, mobile Quick Buy and reconciliation; Milestone 3 inventory, drops, orders, payments and pickup; Milestone 4 market assignments, seller accountability and operational reports. Their navigation entries are visible only as clear “Coming next” states.

## Known limitations

- Percentages are currently entered as whole percentages.
- Landed-cost allocation uses equal allocation per item; proportional and category-specific strategies are prepared as calculation-engine extension points.
- Print-to-PDF relies on the browser print dialog.
- Local planning mode is intentionally unauthenticated and must not be used as the production security model.
- Live Supabase migration and auth verification require project credentials or a running local Docker-based Supabase stack.
