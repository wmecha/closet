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
- Adjustable minimum, average and maximum buying prices per category.
- Revised 50-piece starter assumptions: KES 100-200 buying range, KES 150 average cost, mostly KES 500 online pricing with KES 800-1,000 special pieces.
- Seller minimum-return planning: business revenue uses the fixed amount due back per item while sellers may retain any price above it as their markup.
- Startup/acquisition expense allocation and equal-per-item landed cost.
- Markup/margin pricing, five price-rounding methods and category price guidance.
- Revenue, profit, break-even, return-on-capital and cash-recovery calculations.
- Conservative, Expected and Optimistic derived views.
- Custom sensitivity analysis.
- Up-to-four scenario comparison.
- Print-friendly report, scenario/category/checklist CSV and WhatsApp summary.
- Honest “Coming next” screens for deferred modules.

## SHAWN Apparel storefront

A public, editorial e-commerce storefront for SHAWN Apparel, built on the SHAWN design system (warm neutral palette, Marcellus serif, Jost sans, the Lens mark). It sells limited drops of one of one pieces: each item is a single unit, and once it is sold it becomes unavailable immediately.

- **Public pages**: Home (`/`), the current drop (`/shop`), product detail (`/product/[slug]`), cart (`/cart`), checkout (`/checkout`), payment success and failure (`/payment/success`, `/payment/failed`), about (`/about`), contact and WhatsApp support (`/contact`), and the terms, privacy, and returns policies.
- **Drop based catalogue**: drops have a status of draft, active, or archived. Only the active drop is public. Products carry images, size, condition, measurements, price, description, and availability.
- **One of one purchasing**: quantity is always a single unit. Adding to the bag re-checks availability, and checkout reserves each piece server side for 15 minutes inside an atomic, row-locked transaction so two shoppers can never buy the same piece.
- **Paystack payments in KES**: checkout creates an `awaiting_payment` order, reserves the pieces, and starts a Paystack transaction. Payment is confirmed server side by transaction verification and by a signed webhook. Only then is the order marked paid and the piece sold. Failed or abandoned payments release the hold and never mark a piece sold. Confirmations are idempotent, so the callback and the webhook are safe together. All prices and totals are in Kenyan Shillings, shown as `KSh 1,500`.
- **Admin**: a protected area at `/admin` (reuses the existing operator login) to create, activate, and archive drops; add, hide, and mark products sold; view orders and update fulfilment; and configure the delivery fee and support contacts.

The storefront renders as a preview with built in sample data when Supabase is not configured. Checkout and payments require Supabase and Paystack credentials.

### Storefront environment

In addition to the Supabase URL and publishable key, set:

```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY=sk_test_or_live_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_or_live_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The service role key and the Paystack secret key are server side only. Never expose them to the browser or place them in a `NEXT_PUBLIC_` variable.

### Paystack setup

1. Create a Paystack account and, in **Settings → Preferences**, set your default currency to Kenyan Shillings (KES).
2. Copy the secret and public keys from **Settings → API Keys & Webhooks** into `.env.local`.
3. Add a webhook pointing to `https://YOUR_DOMAIN/api/paystack/webhook`. The route verifies the `x-paystack-signature` before trusting any event.
4. Run the migrations (`npm run db:push` or `npm run db:reset`) so the `drops`, `products`, `orders`, `order_items`, and `store_settings` tables and the inventory functions (`begin_checkout`, `mark_order_paid`, `release_order`, `expire_reservations`) are created.
5. Optionally configure a scheduled call to `select public.expire_reservations();` (for example a Supabase cron job every few minutes) to sweep lapsed reservations back to available.

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
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=YOUR_PAYSTACK_PUBLIC_KEY
```

Run `npm run db:push` against the production Supabase project before first use. Never add service-role or Paystack secret keys to browser-visible (`NEXT_PUBLIC_`) environment variables. Point your Paystack webhook at `https://YOUR_DOMAIN/api/paystack/webhook`.

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
