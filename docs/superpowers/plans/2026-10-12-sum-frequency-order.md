# Sum frequency presentation and ordering Implementation Plan

> Execute the approved local-only change using test-driven-development and verification-before-completion.

**Goal:** Improve readability of the existing sum-frequency table and offer four explicit ordering choices, without redesigning the surrounding page.

**Architecture:** Keep aggregation and ordering in digits-core.js, accessible table markup in digits-view.js, and selected order plus delegated change handling in main.js. Preserve the selected order during the session; changing it never changes the selected draws or totals. Default UI order is count descending, ties by sum ascending. Retain the core helper's numeric ascending default for compatibility.

**Tech Stack:** Vanilla JavaScript, Tailwind, Vite, node:test.

## Approved design

Keep two columns, alternating rows and existing green headers. Increase readable spacing, use a labeled native select (Mais ocorrências, Menos ocorrências, Maior soma, Menor soma), and keep total draws visible in a sticky footer. Emphasize maximum counts only if a sum repeats; include text so emphasis does not rely on color. Keep the table bounded and keyboard-scrollable. No production deployment.

## Tasks

- [x] Add failing tests in web/src/digits-core.test.js for four numeric orders, tie behavior, no mutation and invalid-order fallback; run `rtk npm test` in web.
- [x] Add failing tests in web/src/digits-view.test.js for the default, four labeled options, selected ordering and most-frequent emphasis.
- [x] Extend buildSumFrequency in web/src/digits-core.js; implement presentation and selected order in web/src/digits-view.js; connect change handler in web/src/main.js and preserve focus after rendering.
- [x] Run `rtk npm test`, `rtk npm run lint`, `rtk npm run typecheck`, `rtk npm run build:static`, and `rtk proxy git diff --check`.
- [x] Browser-check all orders against independently counted detail rows, group switching, keyboard focus, totals, and layout at desktop/narrow widths; inspect a screenshot.
- [x] Hand off local URL; do not publish or merge.

## Verification

58 tests pass; lint, typecheck and build exit 0. Browser comparisons verified all four orders for 49 sums / 64 draws in 123450, then 20 sums / 25 draws in 134560. Keyboard ordering retains focus; footer remains visible while scrolling. No browser errors. Screenshots: `/tmp/digit-sum-sort-desktop.png` and `/tmp/digit-sum-sort-narrow.png`. Existing outer table still scrolls horizontally on narrow screens; desktop is the approved primary target.
