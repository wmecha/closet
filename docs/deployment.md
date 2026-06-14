# Deployment and operations

## Vercel

1. Import the Git repository into Vercel.
2. Use the default Next.js build command: `npm run build`.
3. Add the public Supabase variables listed in `.env.example`.
4. Keep `NEXT_PUBLIC_DEMO_MODE=false`.
5. Deploy and add the production callback URL to Supabase Auth.

## Supabase

1. Link the correct project with `npx supabase link --project-ref ...`.
2. Review migration status with `npx supabase migration list`.
3. Apply migrations with `npm run db:push`.
4. Verify Auth email settings and configure production SMTP before inviting staff.
5. Confirm RLS is enabled on every exposed business table.

## Release checks

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Run Playwright against a preview environment or in local demo mode for the planner workflow.

## Operational cautions

- Do not expose a Supabase service-role key to Next.js client code.
- Do not enable demo mode in production.
- Archive approved scenarios instead of deleting financial planning records.
- Back up the Supabase project before destructive schema changes.
- Configure production SMTP; the default hosted email service is not intended for business-scale delivery.
