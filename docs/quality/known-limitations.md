# Known limitations and implementation status

This page intentionally separates frontend presence from production readiness. Status should be updated only after code inspection and verification.

| Area | Current understanding | Production requirement |
|---|---|---|
| Authentication UI | Demo/local profile flow in inspected auth components | Real account creation, verification, login, reset and logout |
| Supabase client | Client is configured in the repository | Verify environment setup and wire required flows to trusted services |
| Preview auth storage | Supports session sharing in supported preview contexts | Do not treat it as authentication or authorisation |
| Role dashboards | Frontend role-aware prototype experiences exist | Server-verified roles and resource-level permissions |
| Marketplace and products | Frontend discovery and product experiences exist | Persistent catalogue, inventory/status rules and trusted purchase flow |
| Wallet and payouts | Frontend wallet/payout interfaces exist | Confirmed payment provider integration, ledger, reconciliation and payout controls |
| Events and bookings | Frontend experience exists | Availability source, booking persistence, cancellation and notification rules |
| Affiliate management | Frontend affiliate experience exists | Attribution rules, commission calculation and auditable reporting |
| Analytics | No performance claims are made here | Event taxonomy, privacy review and reliable instrumentation |
| Usability research | Documentation includes hypotheses and proposed tests | Conduct and document actual research |

## Important security note

A frontend-only role switch or local profile is not a security boundary. Do not use the current demo authentication flow to protect real user data, staff operations, purchases or financial actions.

## Updating this page

For each status change, record:
- The implementation link or commit.
- The environment tested.
- The test performed.
- The observed result.
- Remaining limitations.
