# Product screenshot guide and visual review

This folder documents real application screenshots supplied for the Enski portfolio review. The captures are mobile-width screenshots (approximately 754–810 px wide by 1536 px tall), not desktop captures. They were reviewed as visual evidence, but the original image files have not yet been committed to this repository.

## Supplied screenshot coverage

| Capture | Experience shown | What it demonstrates |
|---|---|---|
| Creator Studio | Creator dashboard | Welcome panel, product creation, storefront entry and earnings summary |
| Marketplace | Public marketplace | Search, category filters, sorting and bestseller product cards |
| Marketplace continuation | Featured creators and new arrivals | Creator discovery, product merchandising and social proof patterns |
| Affiliate catalogue | Affiliate product discovery | Commission labels, product price, estimated earnings and promotion CTA |
| Affiliate overview | Affiliate dashboard | Available balance, withdrawal entry point and performance metrics |
| Affiliate analytics | Affiliate reporting | Date range, channel breakdown, line chart and total activity |
| Learner dashboard | Learner home | Learning prompt, resource/event/certificate/badge summaries and shortcuts |
| Authentication | Login / role selection | Learner, Creator and Affiliate role selection and Google/email entry points |
| Public homepage | Marketing landing page | Value proposition, primary CTAs and headline metrics |
| Dreamverse | Interactive creator/learner experience | 3D character preview, customisation, moves, reactions and camera controls |

## What the visual evidence supports

- Enski has a recognisable cobalt, lime and white visual identity across public and signed-in experiences.
- The product is designed around distinct learner, creator and affiliate jobs.
- Marketplace discovery includes search, category selection, filtering, sorting, creator profiles and product groupings.
- Creator and affiliate workspaces surface commerce and performance information.
- The experience includes a more playful interactive area through Dreamverse.

These screenshots show interface states, not proof that the underlying services, metrics, payment flows or authentication are production-connected. The login screen includes a Google entry point, but the inspected authentication implementation uses a local demo-profile flow. See [authentication architecture](../engineering/authentication.md).

## Visual review

A detailed critique and prioritised recommendations are in [the visual product review](../design/visual-review.md).

## Capture status and limitations

The screenshots were supplied in this conversation. Several include mobile browser chrome; one creator dashboard capture displays a “No internet connection” browser banner. The screenshot URL text also varies between `tryenski...` and `tryenskicom...`. Before presenting these as a single verified production release, recapture the same flows from the canonical deployed URL with a stable connection and confirm the exact build.

No desktop screenshots, product detail page, full creator product creation flow, payout history, event booking flow or end-to-end mobile journey are included in this batch.

## Next capture checklist

Capture the following at consistent viewports (for example, 1440 × 900 desktop and 390 × 844 mobile):

1. Public homepage.
2. Marketplace with search/filter results.
3. Product detail and checkout confirmation.
4. Learner dashboard and course lesson.
5. Creator dashboard and complete product creation / preview.
6. Affiliate dashboard, referral link and click/conversion detail.
7. Wallet, withdrawal request and payout history.
8. Events / bookings.
9. One mobile journey from entry to a meaningful completed action.

Use demo accounts only. Never include real personal data, payment details, access tokens, private admin records or other sensitive information.

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
- Crop browser chrome consistently.
- Use realistic but fictional demo data.
- Avoid cursor overlays and accidental open menus unless they are the subject.
- Optimise images without making text unreadable.
- Add meaningful alt text.
- Re-capture after material UI changes.
