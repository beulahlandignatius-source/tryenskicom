# Enski — from product understanding to AI-assisted, prompt-led prototyping

## Why this case study matters

Enski is an upgrade of an earlier product experience, not a design exercise started from a blank page. The work documented here explores how to understand an existing product, identify experience gaps, rethink the user journeys and use AI-assisted tools to move quickly from product reasoning to an interactive prototype.

The implementation was built through Lovable using prompts, iterative brainstorming with ChatGPT and hands-on review of the product. The important contribution is not simply that prompts generated screens. It is the product thinking used to decide what to ask for, what to change, what to preserve and what to inspect after each iteration.

## Project framing

**Product:** Enski  
**Product space:** Digital learning, creator commerce and affiliate promotion  
**Experience groups:** Learners, creators, affiliates, and operational users  
**Build approach:** Prompt-led, AI-assisted prototyping in Lovable, supported by ChatGPT brainstorming and product analysis  
**Starting point:** An earlier Enski experience at https://staging.tryenski.com  
**Current prototype:** The updated experience documented in this repository and the supplied screenshots

This is a product case study of the design and prototyping process. It does not claim that every feature is production-connected or that formal user research has been completed.

## 1. Start with the product, not the prompt

Before asking an AI builder to change a screen, establish what the product is, who it serves and how the business works.

The working product model is a connected ecosystem:

- **Learners** discover and access courses, ebooks, events and other learning opportunities.
- **Creators** package knowledge into products, present them through storefronts and manage their creator activity.
- **Affiliates** discover products to promote and need clear commission terms and performance feedback.
- **Operations teams** support users and maintain platform workflows.

The key product-management question is: how do these roles create value for one another inside one ecosystem?

A learner needs relevant discovery and a clear path from interest to learning. A creator needs a clear path from product setup to presentation and sales. An affiliate needs to understand what can be promoted, what they earn and how outcomes are attributed. The design must make these connected journeys understandable without making every role use the same dashboard.

## 2. Treat the earlier version as evidence, not something to dismiss

The earlier staging product is the baseline for a proper before-and-after review. A senior product designer or PM should not call the old design “bad” without showing the actual screen, the user problem and the evidence.

For each earlier screen, use this review structure:

| Review lens | Questions to ask |
|---|---|
| User clarity | Can the intended user understand what this page is for? |
| Task completion | Is the main action obvious, and can the user complete it? |
| Information hierarchy | Does the page show the most important information first? |
| Navigation | Can users predict where a link or action will take them? |
| Business logic | Does the interface reflect the actual creator, learner or affiliate workflow? |
| Trust | Are pricing, commissions, balances, permissions and outcomes explained? |
| Feedback | Are loading, empty, error, success and offline states clear? |
| Responsive design | Does the experience remain readable and usable on mobile? |
| Consistency | Do similar actions and components behave in similar ways? |
| Accessibility | Are contrast, labels, focus, touch targets and motion considered? |

### Important source limitation

The staging URL was provided as the original version to compare. At the time this document was written, the live page could not be retrieved by the available page inspection, and the supplied screenshots show the newer experience rather than a complete old/new pair. Therefore this document does **not** invent specific defects in the old staging interface.

To complete a defensible comparison, add dated screenshots or a screen recording of the old version and map each observed issue to the relevant updated screen. Use the table below:

| Earlier screen | Observed issue (evidence required) | User/business impact | Updated decision | How to validate |
|---|---|---|---|---|
| [Add route/screen] | [Describe only what is visible or observed] | [Who is affected and how] | [What changed in the new design] | [Task test or metric] |

## 3. The product-thinking loop behind the prompts

The process should be documented as a repeatable loop, not as one giant prompt.

### Step 1 — Understand
Study the existing product, routes, user roles, feature set, content, business model and important workflows. Identify what is already working and what is unclear.

**Questions**
- Who uses this part of Enski?
- What are they trying to achieve?
- What happens immediately before and after this screen?
- What does the business need to happen?
- Which rules must the interface communicate?

### Step 2 — Frame the problem
Write the problem in user language before proposing a UI solution.

Example:
> An affiliate needs to compare products and understand the commission they may earn before choosing what to promote.

This is stronger than:
> The affiliate page needs nicer cards.

### Step 3 — Map the journey
Describe the start, decision points, actions, system feedback and end state. Include unsuccessful paths and first-time-user states.

Example:
> Open affiliate dashboard → browse products → inspect product and commission terms → choose to promote → receive or copy referral link → share → review clicks and attributed conversions.

### Step 4 — Set constraints
Tell Lovable what must remain true:
- Preserve existing product routes and working functionality unless explicitly changing them.
- Use the established Enski brand and design tokens.
- Design for mobile and desktop.
- Include loading, empty, error, success and offline states.
- Use realistic content, but mark demo data as demo data.
- Do not invent backend integrations or claim that simulated controls are live.
- Follow the component and interaction patterns already established in the codebase.

### Step 5 — Prompt as a product designer
Give the builder context, user, problem, journey, requirements, constraints and acceptance criteria. Do not ask only for a visually attractive page.

### Step 6 — Review the output
Inspect the actual page at relevant viewport sizes. Check content, spacing, hierarchy, interaction, edge cases, route behaviour and accessibility. Compare the result against the original problem, not just the prompt.

### Step 7 — Iterate deliberately
Identify the most important gap, revise the prompt and test again. Avoid changing unrelated parts of the application in one iteration.

### Step 8 — Verify
Check the implementation in the browser and code. Confirm whether the workflow is real, simulated or incomplete. Record what passed, what failed and what remains.

## 4. Prompt structure used for Lovable

Use this structure to make prompts show product reasoning:

```text
PRODUCT CONTEXT
Explain the Enski product, the user role and where this screen fits in the wider journey.

USER
Name the specific user and their goal.

PROBLEM
Describe the friction or unmet need. Do not start with a visual solution.

BUSINESS CONTEXT
Explain the business outcome and any rules the UI must communicate.

USER JOURNEY
Describe the steps, decisions, feedback and expected end state.

DESIGN DIRECTION
Describe hierarchy, layout, visual tone, components and responsive behaviour.

FUNCTIONAL REQUIREMENTS
List what each control must do, including validation and state changes.

EDGE STATES
Specify loading, empty, error, success, offline, permission and first-time states.

CONSTRAINTS
State what must be preserved, what must not be changed and what is out of scope.

ACCEPTANCE CRITERIA
Write observable checks that determine whether the implementation is complete.
```

## 5. Example: turning a vague prompt into a product prompt

**Vague prompt**

“Make the affiliate dashboard look modern and beautiful.”

**Product-led prompt**

“Improve the Enski affiliate dashboard for an affiliate who wants to understand their earnings and decide what to do next. Prioritise available balance, pending commission, total earned, clicks, referrals and attributed conversions, but distinguish each metric clearly. Explain what counts as a click, referral and conversion. Make the primary next action clear when the affiliate has no referrals or sales yet. Include useful empty, loading and error states. On mobile, keep labels readable and prevent cards or chart tooltips from covering important information. Preserve the existing route and working functionality. Do not fabricate performance data or imply that a payout has completed unless the backend confirms it. Verify the page at mobile and desktop widths.”

The second prompt communicates a user, goal, business logic, information hierarchy, edge cases, constraints and acceptance criteria. That is the difference between prompting for decoration and prompting for a product experience.

## 6. What the updated experience is trying to improve

The supplied current screenshots show a more explicit role-based product structure and a stronger visual system:

- The homepage gives learners and creators distinct entry points.
- The marketplace supports search, content categories, filtering, sorting and creator discovery.
- The learner dashboard brings resources, events, certificates, badges and discovery actions together.
- Creator Studio brings product creation, storefront access and earnings into one workspace.
- Affiliate screens connect product discovery and commission information with performance metrics.
- Dreamverse introduces a distinct interactive 3D character experience.

These are visible design and information-architecture decisions. Whether they solve user problems must still be validated with users and real workflow tests.

## 7. Product and business thinking behind the experience

A product manager should connect every major design decision to a user need and a business mechanism.

| Product area | User need | Business mechanism | Design responsibility |
|---|---|---|---|
| Marketplace | Find relevant learning products | Product discovery and purchase | Search, filtering, comparison and clear product detail |
| Learner workspace | Access and continue learning | Engagement and repeat use | Progress, next lesson and useful empty states |
| Creator workspace | Publish and manage knowledge products | Creator supply and sales | Guided setup, preview, status and transparent earnings |
| Affiliate workspace | Choose products and understand results | Product distribution and attributed sales | Commission terms, referral tracking and clear metrics |
| Wallet and payouts | Know where money is and what happens next | Trust and financial operations | Accurate states, currency, timing and server-confirmed outcomes |
| Dreamverse | Explore and personalise an engaging experience | Differentiation and engagement | Clear controls, accessibility and performance |

## 8. What makes this senior-level work

Senior-level product work is not measured by how many screens were generated or how long a prompt is. It is demonstrated by the quality of decisions:

1. **Systems thinking:** understanding how learner, creator and affiliate journeys connect.
2. **Business understanding:** recognising how discovery, supply, distribution, conversion and trust affect the platform.
3. **User-centred framing:** identifying a user problem before choosing a UI solution.
4. **Prioritisation:** separating critical workflow issues from visual polish.
5. **Design judgement:** choosing hierarchy, patterns and interactions for a reason.
6. **AI direction:** giving the builder context and constraints, then critically reviewing its output.
7. **Technical awareness:** understanding what the frontend does and does not prove about authentication, permissions, payments and data.
8. **Validation mindset:** defining how to test whether a change improved the experience.
9. **Communication:** documenting trade-offs, assumptions, evidence and next steps.

## 9. Evidence to add before publishing the final portfolio story

- Screenshots of the earlier staging experience, with route and capture date.
- Matching screenshots of the updated experience at the same viewport.
- Actual prompts and selected iterations from the Lovable/ChatGPT workflow.
- A few examples of an initial AI output, the critique and the revised output.
- A journey map for learner, creator and affiliate.
- A small decision log explaining what changed and why.
- Usability observations from real participants, if conducted.
- A technical status table separating working, simulated and planned functionality.

Do not invent user quotes, research results, conversion improvements, revenue impact or performance claims. If no measurement exists, state what should be measured next.

## 10. Suggested portfolio presentation

Use this sequence:

1. **The product:** what Enski is and how its ecosystem works.
2. **The starting point:** the earlier experience and evidence-based critique.
3. **The problem:** user and business friction, clearly separated from assumptions.
4. **The product strategy:** role structure, journeys and priorities.
5. **The AI-assisted process:** how ChatGPT brainstorming and Lovable prompts supported exploration and implementation.
6. **The design decisions:** annotated before-and-after screens.
7. **The result:** the updated prototype and its visible experience areas.
8. **The reality check:** what works, what is simulated and what remains.
9. **The next validation:** how the product should be tested and improved.

The central story is not “AI built my website.” It is: **I used product understanding, structured reasoning and deliberate prompting to direct an AI builder toward a more coherent product experience—and I can explain the decisions, constraints and validation still required.**
