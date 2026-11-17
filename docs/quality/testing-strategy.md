# Quality and testing strategy

## Goal

Verify that core journeys are understandable, accessible, responsive and safe—not merely that pages render.

## Test layers

### Component tests
- Required-field and format validation.
- Password confirmation and strength feedback.
- Search input and filter behaviour.
- Dialog open, close and confirmation states.
- Loading, empty, error and success feedback.

### Journey tests
- Learner discovers and opens a resource.
- Creator enters and reviews product details.
- Affiliate inspects promotion terms and activity.
- Unauthenticated visitor is not granted protected production data.
- Role permissions cannot be bypassed by changing client-side state.

### Responsive checks
- Narrow Android viewport.
- Common mobile viewport.
- Tablet.
- Desktop.
- Long labels, large text and keyboard-only navigation.

### Accessibility checks
- Semantic headings and landmarks.
- Labels and accessible names for controls.
- Keyboard navigation and visible focus.
- Contrast and non-colour status indicators.
- Reduced-motion behaviour.
- Dialog focus management.

### Integration and security checks
- Authentication error and expired-session handling.
- Row Level Security for user-owned records.
- Role escalation and cross-user access attempts.
- Payment webhook signature verification and idempotency before live payments.
- No secrets or service-role keys in client bundles or Git history.

## Commands

The package manifest defines:

```bash
npm run lint
npm test
npm run build
```

Run these commands in the project environment and record actual results before claiming that checks pass. This documentation change has not run the application test suite.
