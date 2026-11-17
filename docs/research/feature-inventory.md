# Feature and route inventory

This inventory is based on the route files and directory structure visible in `src/routes`. It is a navigation map, not a test report or confirmation that every workflow is connected to a backend.

## Public and discovery routes

| Route file / group | Product area |
|---|---|
| `index.tsx` | Home |
| `features.tsx` | Features overview |
| `pricing.tsx` | Pricing |
| `about.tsx` | About |
| `courses.tsx`, `courses_.$slug.tsx` | Course discovery and detail |
| `creators.$slug.tsx` | Creator profile |
| `store.$handle.tsx` | Creator storefront |
| `dreamverse.tsx`, `dreamverse_.$slug.tsx` | Dreamverse |
| `community.tsx` | Community |
| `blog.index.tsx`, `blog.$slug.tsx`, `blog.write.tsx` | Blog |
| `faq.tsx` | FAQ |

## Account and transaction routes

| Route file / group | Product area |
|---|---|
| `auth.tsx` | Authentication UI |
| `onboarding.tsx`, `welcome.tsx` | Onboarding / welcome |
| `checkout.index.tsx` | Checkout entry |
| `checkout.status.$reference.tsx` | Checkout status |
| `orders.$reference.tsx` | Order details |
| `certificate.$token.tsx` | Certificate view |
| `verify.tsx` | Verification |

## Role and operations areas

The route tree also contains dedicated `learner`, `creator`, `affiliate`, `admin` and `support` route groups. Review the files inside each group before documenting individual screens or claiming feature completeness.

## How to extend this inventory

For each route, add:
- Exact URL pattern.
- Intended user role.
- Main user task.
- Key states (loading, empty, error, success, denied, offline).
- Data dependency and service owner.
- Whether it is demo-only, partially integrated or production-backed.
- Test evidence and last verified date.

Do not infer a route's access control or backend status from its filename.
