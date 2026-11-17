# Enski — product journeys

These diagrams describe the intended product model based on the current route structure and supplied interface screenshots. They are journey hypotheses, not proof that every step is implemented or connected to production services.

## Ecosystem overview

```mermaid
flowchart LR
  C[Creator] -->|publishes| P[Courses, ebooks and services]
  P --> M[Enski marketplace]
  M -->|discover and purchase| L[Learner]
  M -->|selects to promote| A[Affiliate]
  A -->|shares referral link| Prospects[Potential learners]
  Prospects -->|discover and purchase| M
  M -->|orders and activity| Ops[Support and operations]
```

## Learner journey

```mermaid
flowchart TD
  A[Visit Enski] --> B[Browse or search marketplace]
  B --> C[Filter and compare resources]
  C --> D[Open product detail]
  D --> E{Ready to buy?}
  E -->|Not yet| F[Save or continue exploring]
  F --> B
  E -->|Yes| G[Checkout]
  G --> H{Payment confirmed?}
  H -->|No| I[Show pending or failed state]
  H -->|Yes| J[Access learning resource]
  J --> K[Continue learning and track progress]
```

## Creator journey

```mermaid
flowchart TD
  A[Open Creator workspace] --> B[Create product]
  B --> C[Add content, details and price]
  C --> D[Preview storefront presentation]
  D --> E{Ready to publish?}
  E -->|No| C
  E -->|Yes| F[Publish product]
  F --> G[Product appears in storefront and discovery]
  G --> H[Review orders and earnings]
  H --> I[Review payout eligibility and request payout]
  I --> J[Show server-confirmed payout status]
```

## Affiliate journey

```mermaid
flowchart TD
  A[Open Affiliate workspace] --> B[Browse products]
  B --> C[Inspect price and commission terms]
  C --> D{Choose to promote?}
  D -->|No| B
  D -->|Yes| E[Access referral link]
  E --> F[Share link]
  F --> G[Review clicks and referrals]
  G --> H[Review attributed conversions]
  H --> I[Understand pending vs approved commission]
  I --> J[Review withdrawable balance and payout status]
```

## Cross-journey requirements

- Keep role-specific tasks clear while using a shared visual and navigation language.
- Show users what happens next after every important action.
- Treat checkout, commission and payout states as server-confirmed facts.
- Explain metric definitions and eligibility rules in context.
- Design empty, loading, error, success, offline and permission-denied states.
- Test complete mobile and desktop journeys, not isolated screens only.

## Validation

Test each journey with representative users. Record task success, confusion, errors, time on task and qualitative feedback. Update these diagrams when evidence or business rules change.
