# Architecture overview

## Current application stack

Based on the repository package manifest, the project uses:
- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS 4
- Supabase JavaScript client dependency
- Vitest and Testing Library dependencies

## Architectural reading

The application is a frontend-led prototype. The repository includes route-level experiences, shared interface components and feature-specific UI. Supabase client configuration exists under `src/integrations/supabase/`, but the presence of a configured SDK does not establish that all application workflows use a live backend.

## Important boundaries

- **Presentation:** pages, components, forms and interaction states.
- **Client-side state:** local UI state and prototype/demo profile state.
- **Integration boundary:** configured Supabase client and any future service calls.
- **Authoritative backend:** must own account verification, role permissions, financial operations and protected data access in a production system.

## Production architecture questions

Before production launch, document:
- Which service owns user identity and profiles?
- What is the authoritative source for each role?
- Which tables and policies protect private data?
- Which service confirms purchases, commissions and payouts?
- How are webhook events verified and made idempotent?
- What is logged for security and operational support?
- How are secrets managed across local, preview and production environments?

## Change discipline

Keep business rules out of purely presentational components where practical. Centralise shared types and validation, keep integration calls behind clear service boundaries, and test important state transitions.
