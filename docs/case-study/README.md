# Enski — product case study

> A product case study of a digital learning and creator ecosystem, documented from the current repository. This page describes the product direction and implementation evidence available in code; it does not claim unverified business outcomes or completed user research.

## 1. Product overview

Enski explores a connected platform for people who want to learn, creators who package and share knowledge, and affiliates who promote relevant products. Its product proposition is expressed as **Learn. Grow. Earn.**

The experience spans public discovery, learner and creator workspaces, affiliate workflows and operational areas.

## 2. Problem framing

**Problem hypothesis:** learning discovery, creator commerce and promotional workflows can become fragmented when users need separate services for each task.

**Opportunity:** bring relevant learning resources, creator products and adjacent opportunities into one coherent experience, while keeping each role's workspace focused.

This is a hypothesis to validate, not a confirmed research finding. See [the discovery plan](../research/problem-discovery.md).

## 3. Users and jobs to be done

| User group | Job to be done | Experience implication |
|---|---|---|
| Learner | Find a useful resource and make progress | Clear discovery, detail pages and learning access |
| Creator | Package knowledge and manage products | Guided creation, storefront presentation and product status |
| Affiliate | Promote suitable products and understand results | Clear terms, links, attribution and earnings |
| Admin / support | Help users and maintain platform operations | Searchable records, scoped permissions and auditability |

These are proto-personas based on the product's role structure. Validate them with research before treating them as definitive.

## 4. Product scope visible in the repository

The route tree and feature folders show product areas including:
- Public landing, features, pricing, about and content pages.
- Course and creator discovery.
- Learner, creator and affiliate workspaces.
- Checkout and order-status routes.
- Certificate verification.
- Community, Dreamverse and programme experiences.
- Admin and support route groups.

A route or screen existing in the frontend does not prove that its complete service workflow is production-connected. See [the feature inventory](../research/feature-inventory.md) and [known limitations](../quality/known-limitations.md).

## 5. Experience strategy

### Role-based information architecture
Separate learner, creator and affiliate workspaces around their distinct jobs, while maintaining shared brand and interaction patterns.

### Discovery before commitment
Help users understand what a course, ebook, coaching offer or event contains before asking them to take a high-intent action.

### Guided creation
Creator workflows should make required information, progress, validation and preview states visible.

### Trust in financial journeys
Wallet, checkout, commission and payout experiences must distinguish pending, processing, failed and completed states. The server—not optimistic frontend UI—must confirm financial outcomes.

### Complete interaction states
Design and test loading, empty, validation, error, success, offline and permission-denied states.

## 6. Visual system

The codebase defines a visual foundation using Plus Jakarta Sans, cobalt, sky, midnight, lime and soft neutral surfaces. It also defines semantic colour roles, focus treatment, radii, shadows and overlay stacking levels.

See [design system reference](../design/design-system.md). Values in that document are transcribed from `src/styles.css`; use the source file as the implementation source of truth.

## 7. Product decisions and trade-offs

- Role-specific experiences improve relevance but create a need for robust role and permission management.
- A broad learning-and-creator ecosystem creates cross-sell opportunities but can overwhelm navigation; information architecture must keep primary tasks visible.
- Rich visual treatments can strengthen brand recognition but must not reduce readability, performance or accessibility.
- Prototype flows speed up experience iteration but must be clearly separated from real account, payment and data workflows.

See the [decision log](../product/decision-log.md) and [UX decisions](../design/ux-decisions.md).

## 8. Validation plan

The next evidence to collect:
1. Interview learners, creators and affiliates about their current workflows.
2. Test the learner discovery journey on mobile.
3. Test creator product setup and preview.
4. Test affiliate understanding of commission and attribution.
5. Review keyboard access, contrast, screen-reader names and error recovery.
6. Instrument only agreed product events after privacy review.

Do not publish invented participant counts, conversion rates, revenue or satisfaction scores.

## 9. Success measures to define

Potential measures include discovery-to-detail conversion, learner activation, creator product publication completion, affiliate activation and support resolution time. Define event names, calculation rules, baselines and targets before reporting results.

## 10. Delivery and technical readiness

The repository includes a configured Supabase client, but the inspected auth panel currently uses a local demo-profile flow. Production readiness requires real authentication, server-enforced role permissions, trusted payment and payout processing, persistent data contracts and end-to-end tests.

See [authentication architecture](../engineering/authentication.md), [architecture](../engineering/architecture.md) and [testing strategy](../quality/testing-strategy.md).

## 11. Visual evidence

Add reviewed, current screenshots to [the screenshot guide](../screenshots/README.md). Recommended evidence:
- Public homepage / discovery.
- Marketplace and course detail.
- Learner dashboard.
- Creator dashboard and product creation.
- Affiliate overview and promotion detail.
- Wallet / payout states.
- Mobile navigation and one key mobile journey.

Each screenshot should include the viewport, route, role/state shown and a one-sentence explanation of the design decision it demonstrates.

## 12. What this case study demonstrates

The repository documents product framing, role-based experience design, a visual system, UX trade-offs, technical boundaries and a validation plan. It should be expanded with genuine research findings, real screenshots, usability observations and verified implementation outcomes as those become available.
