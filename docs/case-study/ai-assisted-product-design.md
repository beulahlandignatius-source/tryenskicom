# How Enski was redesigned with AI-assisted product thinking

## Why this page exists

Enski was built and iterated through a prompt-led, AI-assisted workflow using Lovable for implementation and ChatGPT for brainstorming and structured thinking. The work was not intended to be a one-line request that generated a website and stopped there. The product was studied as a connected system, ideas were explored, prompts were refined, and the interface was iterated.

This page explains the approach and the decisions a reviewer should look for. It does not claim that AI replaced product judgement, design review, engineering verification or user research.

## The role of the product thinker

The important skill in AI-assisted building is not simply knowing what to type into a prompt box. It is deciding what problem is worth solving, whose problem it is, what the business needs, what the user needs, what the product should do, and how to check whether the generated solution makes sense.

The workflow can be understood as six connected activities:

1. **Understand the product.** Study the existing platform, its purpose, audiences, feature areas, journeys, business model and constraints.
2. **Identify friction and opportunity.** Separate visual inconsistencies from information-architecture problems, confusing workflows, missing states and unclear value.
3. **Frame the user and business need.** Describe the user, their goal, the context, the pain point and the outcome the business needs to support.
4. **Make a design decision.** Decide what should change and why before asking the AI to change it.
5. **Prompt, inspect and refine.** Give Lovable scoped instructions, review the output against the intended experience, then correct what is missing or wrong.
6. **Verify beyond the screen.** Check responsive behaviour, interaction states, data dependencies, accessibility, permissions and whether the workflow actually works.

## The product lens: understand the ecosystem before redesigning screens

Enski is not just a dashboard or a course website. The current product direction connects three key participant groups:

| Participant | User goal | Product/business value |
|---|---|---|
| Learner | Discover useful resources and make learning progress | More meaningful discovery, access and continued engagement |
| Creator | Package knowledge, present products and earn from them | More creator supply and product transactions |
| Affiliate | Find products to promote and understand performance | Wider product distribution and attributable sales |

The product also includes operational roles that need appropriate oversight and permissions.

A product-minded redesign should ask:
- What is each role trying to accomplish?
- What information do they need before taking action?
- What could make them hesitate or lose trust?
- What is the next logical step in the journey?
- How does this workflow support the platform's business model?
- What data, policy or backend capability is required for the experience to be truthful?

These questions are the bridge between business understanding, user experience and product requirements.

## From the first version to the upgraded experience

The current Lovable implementation is described by the project owner as an upgrade of an earlier Enski version hosted at https://staging.tryenski.com.

The earlier staging website could not be reliably retrieved during preparation of this document. Therefore, this page does **not** invent a list of specific V1 defects or claim a verified screen-by-screen comparison.

The comparison should be completed using dated V1 and current-version screenshots, route evidence and, where possible, feedback from people who used the earlier version. Review the earlier experience against these dimensions:

| Audit dimension | Questions to ask of V1 | Evidence to capture in the upgrade |
|---|---|---|
| Product clarity | Could visitors explain what Enski does and who it is for? | Clear value proposition and distinct learner/creator entry points |
| Information architecture | Could each role find its primary tasks? | Role-specific navigation and focused workspaces |
| Marketplace discovery | Could learners search, filter, compare and preview resources? | Search, category filters, sorting and curated product sections |
| Creator workflow | Could creators understand how to add and present a product? | Visible create-product entry point, storefront and product-management journey |
| Affiliate workflow | Could affiliates understand what to promote and what they earn? | Product commission information and performance overview |
| Learner continuity | Could learners find what they own and continue learning? | Learner home, resources, events, certificates and badges |
| Visual consistency | Did screens feel like one product? | Shared colour, typography, spacing, card and navigation patterns |
| Responsive usability | Were important tasks clear on mobile? | Tested mobile layouts, readable labels and touch-friendly controls |
| Trust and feedback | Were empty, error, offline, pending and success states clear? | Explicit state design and accurate status messaging |

The screenshots in the repository document the current experience. Add matched V1 screenshots beside current screenshots to turn this audit framework into a defensible before-and-after story.

## How the prompting approach should work

### 1. Give Lovable product context before asking for UI

A useful prompt establishes:
- Product: what Enski is and how the wider ecosystem works.
- User: which role and what context they are in.
- Task: what the user is trying to complete.
- Business rule: what must be true for the action to be valid.
- Design intent: hierarchy, clarity, consistency and interaction principles.
- Constraints: existing routes, components, brand tokens, data contracts and technical limitations.
- Acceptance criteria: what must be visible and how the result will be checked.

### 2. Use design principles, not only visual adjectives

Instead of only saying “make it modern and beautiful”, specify the experience:
- Establish one clear primary action per section.
- Group information by the user's task.
- Make hierarchy visible through type, spacing and contrast.
- Keep controls consistent and recognisable.
- Design all relevant states, not only the ideal state.
- Preserve accessibility, responsiveness and content readability.
- Reuse the existing design system unless there is a reason to change it.

This helps direct the builder toward considered interface design rather than superficial decoration.

### 3. Prompt in small, reviewable scopes

A disciplined sequence is:
1. Ask the AI to inspect the existing page and describe its structure and problems before editing.
2. Agree on the user problem and desired outcome.
3. Ask for a proposed information hierarchy and component plan.
4. Implement one page or workflow at a time.
5. Review the result on mobile and desktop.
6. Test every visible control and important state.
7. Fix issues without unintentionally changing unrelated parts of the product.
8. Record the decision and any remaining limitation.

### 4. Separate design work from functional work

A page can look complete while its buttons, forms, data or permissions are not connected. Use separate acceptance checks:

**Design acceptance**
- Clear hierarchy and readable content.
- Consistent spacing, typography, colours and components.
- Responsive layout.
- Accessible labels, focus and contrast.
- Empty, loading, error and success states.

**Functional acceptance**
- Controls perform the promised action.
- Form validation is correct.
- Data is saved and retrieved from the intended source.
- Role access is enforced by trusted backend rules.
- Financial and account states reflect server-confirmed outcomes.
- Errors can be recovered from.

Never treat a polished Lovable preview as proof that the backend is production-ready.

## Prompt pattern: ask for thinking before implementation

Use this as a reusable prompt structure. Replace the bracketed details for each page or workflow.

> Act as a senior product designer working closely with a product manager. Do not start coding immediately.
>
> **Product context:** [Explain the Enski ecosystem and relevant business model.]
>
> **User and context:** [Learner, Creator, Affiliate or operational user; describe when and why they use this page.]
>
> **User goal:** [What they need to accomplish.]
>
> **Current friction:** [Observed issue, with screenshot or route evidence. Do not invent problems.]
>
> **Business need:** [What the platform needs this journey to enable.]
>
> **Task:** First inspect the existing implementation. Explain the information hierarchy, likely friction, missing states, responsive concerns and dependencies. Propose a solution and acceptance criteria. Wait for approval before making broad changes.
>
> **Design direction:** Apply clear visual hierarchy, strong typography, purposeful whitespace, accessible contrast, consistent components and mobile-first responsive behaviour. Follow the existing Enski design tokens and use the supplied reference only for relevant principles, not as a page to copy.
>
> **Constraints:** Preserve unrelated routes and working functionality. Do not create fake metrics, fake success states, invented backend integrations or placeholder controls that appear functional.
>
> **After approval:** Implement only [the named page/workflow]. Then report what changed, which interactions work, what still needs backend support and how it was checked.

## How to demonstrate senior-level judgement

A senior-level case study does not claim seniority through adjectives. It demonstrates the quality of the decisions.

Show:
- **Product strategy:** how the platform's audiences, value exchange and business model shaped scope.
- **User-centred thinking:** the user goal, friction and expected outcome behind each major screen.
- **Prioritisation:** why a problem mattered, its impact and why it was addressed before another issue.
- **Systems thinking:** how marketplace, creator, learner and affiliate journeys connect.
- **Design leadership:** how patterns, components and responsive rules remain consistent across roles.
- **AI fluency:** how prompts were structured, scoped, reviewed and improved rather than blindly accepted.
- **Technical judgement:** what the prototype can do, what is simulated and what needs real services.
- **Learning mindset:** what should be tested next and what evidence would change the decision.

## What is known, inferred and still needs evidence

**Known from the project and supplied material**
- The current repository documents a learner, creator and affiliate product structure.
- The current screenshots show the marketplace, Creator Studio, affiliate dashboard, learner dashboard, authentication UI and Dreamverse.
- The project owner describes the current implementation as a Lovable-built upgrade of an earlier Enski version, using prompts and ChatGPT brainstorming.
- The inspected authentication UI uses a local demo-profile flow rather than verified real account authentication.

**Product interpretation**
- The three role experiences form a connected marketplace ecosystem.
- Role-specific dashboards are intended to make each participant's primary tasks easier to find.
- The visual system is intended to make the separate experiences feel like one product.

**Evidence still needed**
- V1 screenshots or a reliably accessible V1 build for a factual before-and-after critique.
- The actual prompt history or selected prompt examples to show the iteration process accurately.
- User interviews or usability sessions to validate user needs and design outcomes.
- Verified production evidence for authentication, payments, payouts, analytics and role permissions.
- Measured outcomes before making claims about conversion, engagement or business impact.

## Suggested portfolio presentation

Present the story in this order:

1. **The product:** what Enski is and the ecosystem it connects.
2. **The starting point:** V1 screenshots and observed problems.
3. **The thinking:** user roles, business model, journeys, assumptions and prioritised opportunities.
4. **The AI workflow:** selected prompts, AI output, critique and refinements.
5. **The design:** before-and-after screens and the reasoning behind key decisions.
6. **The system:** how the learner, creator and affiliate journeys connect.
7. **The implementation:** what Lovable generated and what was verified in the code.
8. **The honest reflection:** limitations, open questions and the next validation steps.

The strongest message is not “AI built my website.” It is: **I used product thinking to understand the system, design the experience, direct AI-assisted implementation and critically evaluate the result.**
