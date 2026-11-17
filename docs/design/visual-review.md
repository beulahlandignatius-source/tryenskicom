# Enski — visual product review

## Review scope

This review is based on the ten mobile screenshots supplied for the portfolio documentation. They show the public homepage, authentication role selection, marketplace, creator workspace, affiliate catalogue and dashboard, learner dashboard, analytics and Dreamverse. This is a visual and product-structure review, not a usability test or a verification of backend functionality.

## What is working well

### 1. A coherent visual identity

The cobalt/deep-blue foundation, lime accent, rounded surfaces and repeated card patterns make the product recognisable across public and role-specific screens. The same visual language carries from marketplace discovery into dashboards.

### 2. Clear role-based product structure

Learner, Creator and Affiliate are presented as distinct experiences. The screenshots communicate different primary jobs:
- Learners discover resources and continue learning.
- Creators create and present products, then monitor earnings.
- Affiliates find products to promote and monitor referral performance.

This is a strong foundation for explaining the product's information architecture.

### 3. Marketplace discovery has useful layers

The marketplace combines search, content types, categories, filters, sorting and curated sections. Featured creators add a people-led discovery path rather than forcing every visitor to browse only product cards.

### 4. Dashboards surface relevant actions

The creator dashboard prioritises product creation and storefront access. The affiliate dashboard puts promotion and performance metrics in view. The learner dashboard provides shortcuts to resources, events, certificates and badges.

### 5. Dreamverse adds product differentiation

The 3D character preview and customisation controls make Dreamverse visually distinct from the marketplace and dashboard experience. It gives the case study a product-design problem beyond conventional dashboard layouts.

## Highest-priority improvements

| Priority | Observation | Recommended action |
|---|---|---|
| P0 | The supplied creator screenshot includes a browser “No internet connection” banner. | Recapture on a stable connection and document offline behaviour separately as a designed state. |
| P0 | The public homepage displays large platform metrics and activity/payout-style callouts. | Verify each claim against real, current data or label it clearly as demo content. |
| P0 | The login screen presents Google and email options, while inspected code uses local demo-profile sign-in. | Connect real authentication before describing these controls as production-ready. |
| P1 | Some creator metric labels and product titles are visibly truncated on mobile. | Improve responsive wrapping, card density and information hierarchy; test at common phone widths. |
| P1 | The affiliate dashboard shows several zero-state metrics. | Add explanatory empty states, definitions and next-step guidance for new affiliates. |
| P1 | Money-related screens show balances and withdrawal actions. | Distinguish pending, available, paid and withdrawn funds; explain eligibility, fees and payout status. |
| P1 | Marketplace cards rely on image, title and creator information. | Ensure price, format, preview, key outcome and purchase action are easy to compare. |
| P2 | Dreamverse relies on visual controls such as drag-to-rotate and expandable interaction groups. | Provide accessible alternatives, clear control labels, reduced-motion support and device-performance fallbacks. |
| P2 | Screenshots are all mobile-width and some retain browser chrome. | Add a consistent desktop/mobile screenshot set and show complete user journeys. |

## Product management interpretation

The product's strongest portfolio story is the coordination of three connected sides of a creator-learning marketplace:

1. **Supply:** creators package knowledge into courses, ebooks and services.
2. **Discovery and consumption:** learners browse, preview, access and continue learning.
3. **Distribution:** affiliates promote creator products and track referral outcomes.

The role-specific dashboards are not separate products; they are different workspaces around the same marketplace ecosystem. This is the central product architecture worth explaining to reviewers.

## Design leadership opportunities

A senior-level case study should show not only the polished screens but also the decisions and trade-offs behind them:

- Why these three roles were selected and how their permissions differ.
- How marketplace discovery balances curated sections, search and filtering.
- How the product reduces friction between discovery, purchase and learning.
- How creator and affiliate earnings are explained without creating false confidence.
- How responsive layouts handle dense dashboard information.
- How loading, empty, offline, error and success states are designed.
- Which design patterns are shared and which need role-specific treatment.

## Validation plan

The screenshots do not contain user-research findings. The following are proposed validation activities, not completed research:

- Ask learners to find a relevant course, understand its details and locate their next lesson.
- Ask creators to publish or preview a digital product and explain how they expect to receive earnings.
- Ask affiliates to find a product, understand the commission and locate their referral performance.
- Test navigation labels, mobile card readability, search/filter comprehension and withdrawal terminology.
- Test keyboard access, contrast, focus visibility, touch target size and reduced-motion behaviour.

Record task completion, time on task, errors, points of hesitation and participant comments. Use findings to prioritise revisions.

## Recommended portfolio narrative

Frame the work as a product-design and product-management case study:

**Challenge:** Learning, creator commerce and product promotion can be fragmented across separate tools.

**Product direction:** Explore one connected platform with role-specific workspaces for learners, creators and affiliates.

**Design response:** Build a coherent marketplace and dashboard system, with discovery, creation, monetisation and learning journeys.

**Trade-offs and constraints:** Some service-dependent experiences remain prototype-level; authentication and money movement must be treated carefully and not presented as live without verification.

**Next proof:** Show validated user journeys, design-system decisions, accessibility checks, responsive behaviour and implementation evidence.

## Evidence limitations

This review is based on screenshots and a limited code review. It does not establish that payments, withdrawals, analytics, Google sign-in, course delivery or Dreamverse persistence are fully connected to production services. Keep implementation status explicit in the README and case study.
