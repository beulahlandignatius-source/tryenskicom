# Enski design system reference

This reference is based on the tokens and conventions found in `src/styles.css` and `src/components/AGENTS.md`. The CSS source remains authoritative; this page explains the system for designers and contributors.

## Typography

- Primary typeface: **Plus Jakarta Sans Variable**.
- Fallback stack: Plus Jakarta Sans, UI sans-serif, system UI, sans-serif.
- Use a consistent type scale and sentence-case UI copy.
- Use the separate decorative font only where the product's existing design intentionally calls for it; do not use decorative type for dense interface text.

## Brand palette

| Token | Value / reference | Intended role |
|---|---|---|
| `--cobalt` | `#1A42A6` | Primary brand and action colour |
| `--cobalt-glow` | `#2656C4` | Highlight / gradient |
| `--cobalt-hover` | `#163A94` | Hover state |
| `--cobalt-press` | `#112D74` | Pressed state |
| `--midnight` | `#0A1F55` | Deep brand / high-emphasis text |
| `--sky` | `#3D8EF0` | Supporting brand colour |
| `--sky-light` | `#7CC2F7` | Light sky accent |
| `--ice` | `#E6F0FE` | Soft blue surface |
| `--lime` | `#C2F24A` | Accent and emphasis |
| `--lime-hover` | `#ADE02F` | Accent hover |
| `--soft` | `#F4F7FC` | Soft neutral surface |
| `--line` | `#DCE6F8` | Border / divider |
| `--slate` | `#2A3F80` | Secondary text / supporting tone |
| `--white` | White | Base surface |

The CSS also defines semantic colours for success, warning, destructive actions and charts. Use semantic tokens rather than selecting arbitrary colours for status.

### Contrast note

The component guidance explicitly says small sky-blue labels on light surfaces should use `text-sky-text`, not the lighter `text-sky`, to preserve readability. Verify contrast for every foreground/background combination when introducing new components.

## Semantic colour roles

- Primary action: `--primary` / `--primary-foreground`.
- Page surface: `--background` / `--foreground`.
- Cards: `--card` / `--card-foreground`.
- Muted surface and text: `--muted` / `--muted-foreground`.
- Borders and fields: `--border` / `--input`.
- Keyboard focus: `--ring` and the shared focus-ring treatment.
- Destructive, warning and success: use the dedicated semantic tokens.

Prefer semantic tokens in components so light and dark themes remain coherent.

## Shape and elevation

Defined radius conventions include:
- Base radius: `1rem` in the primary root token.
- Tag: `8px`.
- Field: `14px`.
- Card: `24px`.

The stylesheet also defines shared soft/lift shadows and card/floating elevation. Reuse existing tokens rather than inventing a different shadow language per feature.

## Motion and layering

The stylesheet defines a documented z-index scale for sticky bars, floating panels, overlays, pickers, immersive viewers, status indicators, offline states, progress bars and splash screens. Reuse these layers; avoid arbitrary z-index values that create stacking conflicts.

Motion should communicate state or guide attention. Respect reduced-motion preferences and avoid decorative motion that interferes with task completion.

## Component and content conventions

From `src/components/AGENTS.md`:
- Use sentence case for page titles, buttons, chips and dropdown options.
- Keep side-menu labels consistent with their established imported title-case convention.
- Give dropdowns and picker triggers accessible spoken names.
- Ensure card-level links expose visible focus on the card.
- Use consistent workspace eyebrow styling where that pattern is used.
- Keep product-facing copy focused on the user's task, not implementation details.

## Accessibility checklist

- Text and controls meet WCAG contrast expectations.
- Every control has an accessible name.
- Keyboard focus is visible and not obscured.
- Dialogs and menus manage focus correctly.
- Status is not communicated by colour alone.
- Motion has a reduced-motion alternative.
- Touch targets and text remain usable on mobile.

## Source of truth

- Tokens: `src/styles.css`
- Component conventions: `src/components/AGENTS.md`

When tokens change, update this document in the same pull request.
