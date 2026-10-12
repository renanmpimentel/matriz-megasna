# Data Sync and Footer Accuracy Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure scheduled Mega-Sena data updates reach GitHub Pages and make the footer report the deployed data timestamp accurately.

**Architecture:** The scheduled workflow will commit the updated data and explicitly dispatch the existing Pages workflow on `main` with the built-in `GITHUB_TOKEN`. The deployment workflow remains the single publisher and checks out the latest branch state. The frontend will load draws and optional metadata through a tested data loader and build the footer text through a pure formatter.

**Tech Stack:** Node.js 22, Vite 7, native `node:test`, GitHub Actions, GitHub Pages.

**Design:** `docs/superpowers/specs/2026-10-12-data-sync-and-footer-design.md`

---

## Chunk 1: Frontend data status

### Task 1: Add metadata URL and accurate footer formatter

**Files:**
- Modify: `web/src/data-url.js`
- Modify: `web/src/data-url.test.js`
- Create: `web/src/data-status.js`
- Create: `web/src/data-status.test.js`

- [ ] **Step 1: Write failing URL and status-label tests**

Add a test requiring `getDrawsMetaUrl("/matriz-megasna/")` to return `/matriz-megasna/data/meta.json`.

Add focused tests for `buildDataStatusLabel`:

```js
test("mostra a data real dos dados e a data do ultimo jogo", () => {
  const result = buildDataStatusLabel(
    { updatedAt: "2026-10-12T13:41:56.000Z", latestDrawDate: "08/10/2026" },
    () => "12/10/2026, 10:41:56"
  );

  assert.equal(
    result,
    "Dados atualizados em: 12/10/2026, 10:41:56 | Data do ultimo jogo: 08/10/2026"
  );
});
```

Also assert explicit fallback text for missing/invalid `updatedAt` and omission of the last-game suffix when no draw date exists.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `cd web && npm test -- src/data-url.test.js src/data-status.test.js`

Expected: FAIL because `getDrawsMetaUrl` and `data-status.js` do not exist.

- [ ] **Step 3: Implement the minimal URL helper and pure formatter**

Use the same base normalization already used for draw data. The formatter must validate `updatedAt` with `Date`, use an injectable formatter for deterministic tests, and never substitute the current browser time when metadata is unavailable.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `cd web && npm test -- src/data-url.test.js src/data-status.test.js`

Expected: all focused tests PASS.

- [ ] **Step 5: Commit the unit**

```bash
git add web/src/data-url.js web/src/data-url.test.js web/src/data-status.js web/src/data-status.test.js
git commit -m "fix: report real draw data update time"
```

### Task 2: Load metadata without making draw loading fragile

**Files:**
- Create: `web/src/draw-data-loader.js`
- Create: `web/src/draw-data-loader.test.js`
- Modify: `web/src/main.js`

- [ ] **Step 1: Write failing loader tests**

Specify `loadDrawData(baseUrl, fetchImpl)` with tests proving:

- successful draw and metadata responses return `{ draws, metadata }`;
- a rejected or non-OK metadata request returns `metadata: null` while preserving draws;
- a failed draw request rejects, because the table cannot render without its primary data.

- [ ] **Step 2: Run the loader test and verify RED**

Run: `cd web && npm test -- src/draw-data-loader.test.js`

Expected: FAIL because `draw-data-loader.js` does not exist.

- [ ] **Step 3: Implement the minimal loader**

Use `getDrawsDataUrl` and `getDrawsMetaUrl`. Guard the complete metadata promise chain, including JSON parsing, with a `catch(() => null)`. Validate the draw response and JSON independently.

- [ ] **Step 4: Run the loader test and verify GREEN**

Run: `cd web && npm test -- src/draw-data-loader.test.js`

Expected: all loader tests PASS.

- [ ] **Step 5: Integrate the loader and formatter in `main.js`**

Replace the direct draw fetch and `new Date().toLocaleString("pt-BR")` footer value with:

```js
const { draws, metadata } = await loadDrawData(import.meta.env.BASE_URL);
const latestDraw = [...draws].sort((a, b) => Number(a.draw) - Number(b.draw)).at(-1);
lastUpdatedElement.textContent = buildDataStatusLabel({
  updatedAt: metadata?.updatedAt,
  latestDrawDate: latestDraw?.date
});
```

- [ ] **Step 6: Run all frontend tests**

Run: `cd web && npm test`

Expected: all tests PASS.

- [ ] **Step 7: Commit the integration**

```bash
git add web/src/draw-data-loader.js web/src/draw-data-loader.test.js web/src/main.js
git commit -m "fix: load deployment metadata independently"
```

---

## Chunk 2: Scheduled publication

### Task 3: Make the daily workflow dispatch publication after updating data

**Files:**
- Create: `web/src/workflow-contract.test.js`
- Modify: `.github/workflows/daily-megasena-sync.yml`
- Update via sync command: `web/public/data/meta.json`
- Potentially update via sync command: `web/public/data/sorteios.json`

- [ ] **Step 1: Write a failing workflow contract test**

Read `.github/workflows/daily-megasena-sync.yml` as text and assert that it contains:

- `actions: write` permission;
- a data-change output based on `sorteios.json`;
- `git add web/public/data/sorteios.json web/public/data/meta.json`;
- a conditional `gh workflow run deploy-gh-pages.yml --ref main` step after the commit-and-push step;
- `GH_TOKEN: ${{ github.token }}` on the dispatch step;
- no Pages build or deployment duplication in the daily workflow.

- [ ] **Step 2: Run the contract test and verify RED**

Run: `cd web && npm test -- src/workflow-contract.test.js`

Expected: FAIL because the workflow does not yet dispatch deployment or stage metadata.

- [ ] **Step 3: Implement workflow change detection, metadata commit, and deploy dispatch**

Keep the existing daily synchronization concurrency and validation build. Add the following exact wiring:

```yaml
permissions:
  actions: write
  contents: write

# after npm run sync:data
- name: Detect data changes
  id: data_changes
  shell: bash
  run: |
    if git diff --quiet -- web/public/data/sorteios.json; then
      echo "changed=false" >> "$GITHUB_OUTPUT"
    else
      echo "changed=true" >> "$GITHUB_OUTPUT"
    fi

- name: Commit updated data
  if: steps.data_changes.outputs.changed == 'true'
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
    git add web/public/data/sorteios.json web/public/data/meta.json
    git commit -m "chore: update Mega-Sena draws"
    git push

- name: Deploy updated data
  if: steps.data_changes.outputs.changed == 'true'
  env:
    GH_TOKEN: ${{ github.token }}
  run: gh workflow run deploy-gh-pages.yml --ref main
```

The change flag is driven only by `sorteios.json`, so metadata-only timestamp churn does not create daily commits. The dispatch is a separate step after `git push`, so a push failure prevents deployment and the deploy workflow always checks out the committed branch state.

- [ ] **Step 4: Run the workflow contract test and verify GREEN**

Run: `cd web && npm test -- src/workflow-contract.test.js`

Expected: workflow contract test PASS.

- [ ] **Step 5: Refresh the local metadata through the real sync command**

Run: `cd web && npm run sync:data`

Expected: the command succeeds; `meta.json` records the successful current synchronization. If a new draw exists, `sorteios.json` is also updated by the same source-of-truth script.

- [ ] **Step 6: Inspect generated data before staging**

Confirm the metadata is valid JSON, its `latestDraw` matches the final draw number in `sorteios.json`, and no unrelated file changed.

- [ ] **Step 7: Commit the workflow and generated metadata**

```bash
git add .github/workflows/daily-megasena-sync.yml web/src/workflow-contract.test.js web/public/data/meta.json web/public/data/sorteios.json
git commit -m "fix: deploy scheduled draw updates"
```

---

## Chunk 3: Full verification

### Task 4: Run the complete quality and build gate

**Files:**
- Verify only; no planned production changes.

- [ ] **Step 1: Run lint**

Run: `cd web && npm run lint`

Expected: exit code 0.

- [ ] **Step 2: Run typecheck**

Run: `cd web && npm run typecheck`

Expected: exit code 0.

- [ ] **Step 3: Run the full test suite**

Run: `cd web && npm test`

Expected: all tests PASS with zero failures.

- [ ] **Step 4: Run the static production build**

Run: `cd web && npm run build:static`

Expected: Vite builds `web/dist` successfully.

- [ ] **Step 5: Review the final diff and repository status**

Confirm only the approved documentation, frontend status/loading modules, tests, workflow, and generated data files changed. Preserve the user's untracked `tabela mega.docx`.
