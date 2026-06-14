# Roles and permissions

Authorization is enforced by PostgreSQL Row Level Security, not only by interface visibility.

## Roles

- `owner_admin`: full business administration, role management and financial control.
- `operations_manager`: scenario operations and settings management.
- `buyer`: create and update planning scenarios; later used for buying trips.
- `pickup_payment_coordinator`: reserved for order payment and release controls.
- `market_lead`: reserved for market allocations and reconciliation approval.
- `seller`: reserved for assigned market stock and sales records.

## Milestone 1 permissions

- All business members can read their business and scenarios.
- Owner/Admin, Operations Manager and Buyer can create and update scenarios.
- Owner/Admin and Operations Manager can delete draft scenarios.
- Owner/Admin manages team roles.
- Owner/Admin and Operations Manager can read audit logs.
- Users can read and update their own profile.
- Inventory media is private and path-scoped to a business UUID.

The first signed-up user is provisioned as Owner/Admin by the `handle_new_user` database trigger. Additional users should be invited and assigned by an Owner/Admin in the Team module planned for Milestone 2.
