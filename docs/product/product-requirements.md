# Product requirements

## Purpose

Capture the product scope represented by the current Enski prototype and identify the behaviours that need validation or production implementation.

## Users and needs

### Learner
- Find relevant courses and digital learning resources.
- Understand what a resource includes before taking action.
- Access learning activity and related events or coaching.
- Understand the status of their activity and transactions.

### Creator
- Present knowledge products clearly.
- Create and manage product information.
- Understand sales, promotion and payout activity.
- Manage a public-facing creator presence.

### Affiliate
- Find products or campaigns available for promotion.
- Understand commission and promotion terms.
- Access links or assets needed to promote.
- Review attributable activity and earnings.

### Admin and support
- Find relevant users and records.
- Review operational activity.
- Handle support workflows with appropriate permissions and auditability.

## Scope represented in the prototype

The codebase contains frontend experiences related to dashboards, discovery, digital products, events, bookings, coupons, landing pages, affiliate management and wallet/payout interfaces. The exact production behaviour of each area must be assessed independently.

## Cross-cutting UX requirements

1. Every important action should provide visible feedback.
2. Forms should explain validation errors beside the relevant fields.
3. Long or asynchronous actions should expose loading and completion states.
4. Empty states should explain what the user can do next.
5. Errors should be actionable and should not silently discard user input.
6. Destructive or financial actions should require clear confirmation.
7. Interfaces should remain usable on narrow mobile screens and with keyboard navigation.
8. User-specific data and privileged actions must be protected by backend authorisation, not only hidden in the UI.

## Non-functional requirements

- Responsive layout and accessible interaction patterns.
- Secure handling of credentials and session tokens.
- Server-side validation for trusted business operations.
- Clear separation between demo data and production data.
- Observability for critical workflows.
- Reliable error and retry behaviour.

## Acceptance criteria template

For each feature, define:
- Actor and permission.
- Preconditions.
- Main success path.
- Validation rules.
- Empty, loading and failure states.
- Data created or changed.
- Analytics events, if applicable.
- Accessibility and responsive checks.
- Security and privacy implications.

Feature-specific acceptance criteria should be added only after the relevant workflow and backend contract are confirmed.
