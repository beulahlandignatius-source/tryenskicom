# Enski

**Learn. Grow. Earn.**

Enski is a digital learning and creator-platform prototype exploring how learners, creators and affiliates can discover learning resources, share knowledge and access opportunities in one connected experience.

> **Project status:** Frontend prototype. This repository documents the current implementation honestly: some experiences are interactive, while authentication and other service-dependent workflows are simulated or not connected to production services. See [known limitations](docs/quality/known-limitations.md).

[Open the live prototype](https://eenski.lovable.app)

---

## Product at a glance

Enski brings together three connected value areas:

- **Learn:** discover courses, ebooks, digital resources and learning opportunities.
- **Grow:** explore coaching, events, bookings and ways to develop practical skills.
- **Earn:** give creators ways to present and sell knowledge products, and let affiliates participate in promotion.

The product experience is organised around distinct user needs, including learners, creators and affiliates, with administrative and support workflows also represented in the application.

## The problem space

Learning and creator opportunities are often spread across separate services: learners search in one place, find mentors somewhere else, and creators manage products and promotion through different tools. This creates fragmented journeys.

Enski explores a more connected experience. The product hypothesis is that bringing discovery, learning, creator tools and promotion into one coherent platform can reduce context switching and make the next useful action easier to find.

This is a product hypothesis, not a claim based on completed formal user research. See [discovery notes](docs/research/problem-discovery.md).

## Product experience

| Experience | What it is designed to support |
|---|---|
| Learner | Discover learning resources, access learning experiences and manage learner activity |
| Creator | Present and manage knowledge products and creator-facing activity |
| Affiliate | Discover promotional opportunities and track affiliate activity |
| Admin / support | Support operational oversight and platform management |

See [user journeys](docs/product/user-journeys.md) for the intended flows and [product requirements](docs/product/product-requirements.md) for scope.

## Feature areas

The repository contains interface work for areas including:

- Learner, creator and affiliate dashboards
- Course and digital-product discovery
- Digital product and course experiences
- Coaching, events, bookings and coupons
- Landing-page and promotional workflows
- Wallet and payout interfaces
- Shared navigation, identity and interface components

Feature presence in the frontend does not necessarily mean a production backend integration exists. The implementation status is tracked in [known limitations](docs/quality/known-limitations.md).

## Design approach

The design direction is based on a few practical principles:

1. **Start with the user's task.** Each role should see the information and actions relevant to its goals.
2. **Make complex workflows understandable.** Break multi-step tasks into clear stages with useful feedback.
3. **Design for real states.** Include loading, empty, error, success, offline and responsive states—not only the ideal screen.
4. **Reuse patterns.** Shared components and design tokens should make the experience consistent.
5. **Be clear about trust.** Explain money movement, account access and important actions in plain language.

Read the [design principles](docs/design/design-principles.md) and [UX decision log](docs/design/ux-decisions.md).

## Product management approach

The product documentation captures the problem framing, target users, requirements, prioritisation assumptions, decisions and roadmap. It distinguishes confirmed implementation facts from hypotheses that still need validation.

- [Product brief and vision](docs/product/product-brief.md)
- [Product requirements](docs/product/product-requirements.md)
- [Personas and user needs](docs/product/personas.md)
- [Prioritisation](docs/product/prioritisation.md)
- [Decision log](docs/product/decision-log.md)
- [Roadmap](docs/product/roadmap.md)

## Product case study and visual evidence

- [Read the Enski product case study](docs/case-study/README.md)
- [Explore the AI-assisted product thinking and prompt-led workflow](docs/case-study/ai-assisted-product-thinking.md)
- [See the prompting method and iteration log template](docs/case-study/prompting-evidence.md)
- [Review the implementation status and production-readiness gaps](docs/engineering/implementation-status.md)
- [Explore the design system](docs/design/design-system.md)
- [Review the route and feature inventory](docs/research/feature-inventory.md)
- [See the screenshot capture guide](docs/screenshots/README.md)

Screenshots should be current captures of the deployed application, with consistent crops, viewport labels and captions. Do not present planned or simulated functionality as live.

Suggested walkthroughs:
- Learner: discover a resource → view details → continue learning
- Creator: open creator workspace → prepare a product → review its presentation
- Affiliate: open affiliate area → review available promotions → inspect performance
- Operations: review an administrative workflow

## Technology

The current package manifest identifies the following stack:

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS 4
- Supabase JavaScript client (configured in the codebase; this alone does not mean the current login UI uses Supabase Auth)
- Vitest and Testing Library dependencies for testing

The project was developed using Lovable and is maintained in GitHub. See [architecture notes](docs/engineering/architecture.md).

## Run locally

Requirements: a recent Node.js release and npm.

```bash
git clone https://github.com/beulahlandignatius-source/tryenskicom.git
cd tryenskicom
npm install
npm run dev
```

Useful scripts:

```bash
npm run dev       # start the local development server
npm run build     # create a production build
npm run preview   # preview the production build
npm run lint      # run ESLint
npm test          # run the Vitest suite
```

If environment variables are required by a local feature, use the names documented in the relevant integration and provide values through your local environment. Never commit real credentials, access tokens or service-role keys.

## Quality and delivery

Quality should be assessed across functionality, accessibility, responsive behaviour, error handling and role-specific journeys. The [quality strategy](docs/quality/testing-strategy.md) describes the proposed checks. Test coverage and build status should only be reported after the commands have actually been run.

## Current limitations

This is not being represented as a production-ready platform. In particular, the current authentication screens use a local demo-profile flow; they do not create or verify real user accounts. The configured Supabase client and its preview storage helper should not be confused with a completed authentication integration.

See [authentication architecture](docs/engineering/authentication.md) and [known limitations](docs/quality/known-limitations.md) for the implementation details and next steps.

## Repository map

```text
docs/
├── design/       Design principles and UX decisions
├── engineering/  Architecture, authentication and implementation status
├── product/      Product brief, requirements, journeys and roadmap
├── quality/      Testing strategy and known limitations
└── research/     Discovery questions and validation plan
```

## Contributing and feedback

Useful feedback is specific: identify the user, the task they were trying to complete, what happened, what they expected, and the device or viewport used. For product feedback, include the relevant journey and impact rather than only a screenshot of the visual issue.

---

**Enski — Learn. Grow. Earn.**
