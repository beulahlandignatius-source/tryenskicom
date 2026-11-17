# Product screenshot guide

This folder is for real screenshots captured from the current Enski application. Do not substitute marketing artwork, generated mockups or screenshots of unrelated environments for product UI evidence.

## Capture status

The live URL supplied for this task is:

https://tryenskicom.lovable.app

An attempt to retrieve the page from the available web and runtime environment did not return the site content. No screenshot has therefore been fabricated or represented as a live capture. The repository does contain brand and demo product imagery, but those assets are not full application screenshots.

## Capture checklist

Capture the following at a consistent desktop viewport (for example, 1440 × 900) and a mobile viewport (for example, 390 × 844):

1. Public homepage.
2. Course or marketplace discovery.
3. Course or product detail.
4. Learner dashboard.
5. Creator dashboard.
6. Creator product creation / preview.
7. Affiliate overview and affiliate detail.
8. Wallet and payout history.
9. Events or bookings.
10. One mobile journey from entry to a meaningful action.

Use demo accounts only. Never include real personal data, email addresses, payment details, access tokens, private admin records or other sensitive information.

## File naming

Use descriptive names, lowercase and hyphenated:

```text
docs/screenshots/
├── desktop-home.png
├── desktop-marketplace.png
├── desktop-product-detail.png
├── desktop-learner-dashboard.png
├── desktop-creator-dashboard.png
├── desktop-creator-product-flow.png
├── desktop-affiliate-dashboard.png
├── desktop-wallet-payouts.png
├── mobile-home.png
└── mobile-learner-journey.png
```

## Screenshot metadata

For every screenshot, add a caption with:
- Route or page.
- Viewport size.
- User role and demo state.
- What the screenshot demonstrates.
- Whether the state is simulated or backed by a live service.

## Quality rules

- Capture the current deployed build, not an outdated local build.
- Use consistent viewport dimensions and browser zoom.
- Keep the full relevant page area visible; crop browser chrome consistently.
- Use realistic but fictional demo data.
- Avoid cursor overlays and accidental open menus unless they are the subject.
- Optimise images for repository size without making text unreadable.
- Add alt text in the README.
- Re-capture after material UI changes.

## Add screenshots

Save approved captures in this directory, then add a gallery to the root README and link each image to its full-size file.
