# Prompting evidence — how AI was directed during the Enski build

## Why this document exists

The Enski prototype was built with Lovable through prompt-led iteration, supported by brainstorming and product analysis with ChatGPT. This document explains the method without claiming that examples below are exact historical transcripts.

To demonstrate the real work, add original prompts and dated screenshots of the resulting iterations when available. Do not label reconstructed examples as verbatim prompts.

## The prompting method

A useful product-building prompt carries eight pieces of context:

1. Product and feature context.
2. Specific user and their goal.
3. Problem or friction to solve.
4. Business rule or desired outcome.
5. User journey and expected end state.
6. UX and visual direction.
7. Functional behaviour and edge states.
8. Constraints and acceptance criteria.

## Example: affiliate dashboard

**Weak instruction**

> Make the affiliate dashboard look modern.

**Structured product instruction — illustrative example, not a verbatim historical prompt**

> Improve the affiliate dashboard for a user who needs to understand promotion performance and decide what to do next. Make available balance, pending commission, total earnings, clicks, referrals and attributed conversions easy to distinguish. Explain what each metric means and avoid presenting pending commission as withdrawable money. Provide a useful first-time state when there is no activity, with a clear next action to browse products. Keep labels readable on mobile, preserve existing routes and working behaviour, and do not invent analytics or payout outcomes. Include loading, empty and error states. Verify the result at mobile and desktop widths.

## Review before prompting

| Review question | What the prompt should make explicit |
|---|---|
| Who is using this? | An affiliate, not a generic dashboard visitor |
| What do they need? | Decide what to promote and understand results |
| What does the business need? | Trustworthy promotion and commission workflows |
| What can go wrong? | No activity, delayed attribution, pending commission |
| What must the UI communicate? | Definitions, terms, status and next action |
| How will the result be checked? | Readability, correct states, route preservation and responsive behaviour |

## Keep a real prompt log

For each significant iteration, add an entry using this template:

| Field | Record |
|---|---|
| Date / iteration | |
| Screen or workflow | |
| User and problem | |
| Initial prompt | Paste exact prompt |
| What Lovable generated | Link screenshot or commit |
| What was wrong or missing | Record observed issues, not assumptions |
| Follow-up prompt | Paste exact refinement |
| What changed | Link updated screenshot or commit |
| Verification | What was manually tested |
| Remaining gaps | What is still incomplete |

## What this demonstrates

The skill is not writing long prompts. It is translating product understanding into precise instructions, reviewing AI output critically, iterating against the user problem and checking the implementation. ChatGPT supports reasoning and brainstorming; Lovable accelerates prototyping; product judgement remains responsible for decisions and verification.
