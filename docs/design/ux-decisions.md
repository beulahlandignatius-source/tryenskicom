# UX decisions and review notes

This document captures the reasoning to preserve during design iteration. It is a decision framework, not a claim that every item has been usability-tested.

## Role-specific navigation

**Intent:** Help each user reach the tasks relevant to their role without exposing unrelated complexity.

**Review:** Check navigation labels with users, test direct links, and ensure route visibility matches backend permissions.

## Search and discovery

**Intent:** Help users narrow a large set of learning resources or promotional opportunities.

**Review:** Search should have useful empty, loading and no-results states. Filters should be understandable, combinable where appropriate, and removable without losing context.

## Creator workflows

**Intent:** Reduce uncertainty during product setup and publishing.

**Review:** Group related fields, explain required assets, preserve drafts where supported, provide validation near the field, and show a preview before publication.

## Wallet and payouts

**Intent:** Make money movement understandable and trustworthy.

**Review:** Distinguish available, pending, processing, failed and paid amounts. Explain currency, payout destination, fees and timing. Do not show a success state until the server confirms the operation.

## Events and bookings

**Intent:** Make availability, event details and booking outcomes clear.

**Review:** Provide meaningful search and filtering, clear date/time information, booking status and recovery when an action fails.

## Evidence still needed

- Moderated usability sessions across learner, creator and affiliate journeys.
- Mobile testing on common Android devices and slower networks.
- Accessibility review with keyboard and screen-reader checks.
- Analytics or support evidence to identify high-friction tasks.
