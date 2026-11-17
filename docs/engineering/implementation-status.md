# Enski — implementation status and evidence

This status sheet is intentionally conservative. A visible screen, button or configured SDK is not sufficient evidence that a complete production workflow exists.

## Status definitions

- **Visible in prototype:** supported by supplied screenshots or inspected frontend route/component.
- **Demo / simulated:** frontend interaction uses local state, timeout or sample data rather than a verified backend transaction.
- **Configured, usage unverified:** an SDK or integration is configured, but the inspected workflow does not demonstrate its use.
- **Not verified:** evidence inspected so far is insufficient to classify the workflow.
- **Production verified:** use only after end-to-end testing against the deployed service, including failure cases.

## Current evidence matrix

| Area | Evidence reviewed | Conservative status | What is needed for production confidence |
|---|---|---|---|
| Public homepage | Supplied screenshot and route inventory | Visible in prototype | Verify content claims and responsive behaviour |
| Marketplace discovery | Supplied screenshot and route inventory | Visible in prototype | Test search, filters, sorting, product data and purchase path |
| Learner workspace | Supplied screenshot and route inventory | Visible in prototype | Verify persistent learning progress and resource access |
| Creator workspace | Supplied screenshot and route inventory | Visible in prototype | Verify product creation, publishing, orders and earnings data |
| Affiliate workspace | Supplied screenshots and route inventory | Visible in prototype | Verify referral attribution, commission rules and reporting |
| Wallet and payouts | Prior code/product review and visible interface context | Not production verified | Server-side ledger, payout provider, reconciliation and auditable statuses |
| Dreamverse | Supplied screenshot | Visible in prototype | Test controls, persistence, performance and accessibility |
| Email/password login | AuthPanel and demo profile code | Demo / simulated | Implement and test Supabase Auth calls and session lifecycle |
| Registration | AuthPanel code | Demo / simulated | Implement sign-up, email confirmation and profile creation |
| Password reset | AuthPanel code | Demo / simulated | Implement reset request, callback and password update |
| Google sign-in | UI option shown in screenshot | Not verified | Configure OAuth provider and test callback/session flow |
| Supabase client | Supabase client configuration | Configured, usage unverified for current auth UI | Verify actual service calls, environment configuration and RLS |
| Role access | DashboardFrame and local demo profile code | Frontend demo guard observed | Enforce role and resource permissions on server/database |

## Authentication evidence

The inspected auth panel uses local demo-profile sign-in. The Supabase client is configured with persistent session storage and automatic token refresh, but the inspected login form does not call Supabase Auth sign-in, sign-up or password-reset methods. Therefore the client configuration must not be described as proof of working production authentication.

See [authentication architecture](authentication.md) and the source files:
- `src/components/site/auth/AuthPanel.tsx`
- `src/integrations/supabase/client.ts`
- `src/lib/demo/profile.ts`
- `src/components/shared/DashboardFrame.tsx`

## Release-readiness checklist

- [ ] Authentication and account recovery work end to end.
- [ ] Server-side role and resource permissions are tested.
- [ ] Payment and payout state is confirmed by trusted backend responses.
- [ ] Earnings, commission and analytics definitions are documented.
- [ ] Important forms have validation and recoverable errors.
- [ ] Empty, loading, success, error and offline states are covered.
- [ ] Mobile and desktop journeys are tested.
- [ ] Keyboard, screen-reader, focus and contrast checks are completed.
- [ ] Automated tests cover critical journeys.
- [ ] Production environment variables and deployment configuration are reviewed.

Update this matrix only when new code inspection or test evidence supports a status change.
