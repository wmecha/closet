# Database design

The initial migration is `supabase/migrations/20260614153000_initial_milestone_one.sql`.

## Milestone 1 tables

- `businesses`: tenant boundary and base currency.
- `profiles`: application profile linked one-to-one with `auth.users`.
- `user_roles`: many-to-many user/business roles.
- `business_settings`: configurable display name, currency, stock prefix and timezone.
- `stock_scenarios`: scenario header, workflow status and versioned JSON snapshot.
- `scenario_expenses`: normalized expense rows.
- `scenario_categories`: normalized category assumptions with database constraints.
- `scenario_templates`: editable seed assumptions.
- `audit_logs`: append-only important scenario changes.

The application writes one validated scenario snapshot. A database trigger synchronizes expense and category child rows in the same transaction. This keeps client saves atomic while retaining normalized rows for reporting and future buying-trip linkage.

## Integrity

- UUID primary keys and foreign keys.
- Whole-shilling non-negative integer constraints.
- Quantity and percentage constraints.
- Channel percentages must total 100%.
- Damaged plus unsold percentages cannot exceed 100%.
- Category minimum, average and maximum buying prices are stored in the scenario JSON snapshot; the normalized category row retains the average while the full snapshot preserves the adjustable range.
- Duplicate active scenario names are blocked per business.
- Draft-only scenario deletion policy; approved records should be archived.
- `updated_at` triggers and scenario audit triggers.

## Future schema

Buying trips, inventory, drops, orders, payments, market assignments, commissions, reconciliations and stock movements are intentionally deferred until their workflows are implemented. They should reference `businesses`, approved `stock_scenarios` and the existing audit model.
