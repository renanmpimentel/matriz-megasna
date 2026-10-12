import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowPath = new URL("../../.github/workflows/daily-megasena-sync.yml", import.meta.url);
const workflow = await readFile(workflowPath, "utf8");

function step(name) {
  const marker = `      - name: ${name}`;
  const start = workflow.indexOf(marker);
  assert.notEqual(start, -1, `step not found: ${name}`);

  const next = workflow.indexOf("\n      - name:", start + marker.length);
  return workflow.slice(start, next === -1 ? workflow.length : next);
}

test("preserves the daily sync and validation contract", () => {
  assert.match(workflow, /schedule:\s*\n\s*- cron: "0 10 \* \* \*"/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /group: daily-megasena-sync/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(step("Sync latest draws"), /run: npm run sync:data/);
  assert.match(step("Validate app build"), /run: npm run build:static/);
});

test("grants write permissions needed to commit and dispatch", () => {
  assert.match(workflow, /permissions:\s*\n\s+contents: write\s*\n\s+actions: write/);
});

test("detects draw data changes after sync and reports both outcomes", () => {
  const syncStart = workflow.indexOf("      - name: Sync latest draws");
  const detectionStart = workflow.indexOf("      - name: Detect data changes");
  const detection = step("Detect data changes");

  assert.ok(detectionStart > syncStart, "change detection must run after sync");
  assert.match(detection, /id: data_changes/);
  assert.match(detection, /git diff --quiet -- web\/public\/data\/sorteios\.json/);
  assert.doesNotMatch(detection, /meta\.json/);
  assert.match(detection, /changed=false.*GITHUB_OUTPUT/s);
  assert.match(detection, /changed=true.*GITHUB_OUTPUT/s);
});

test("commits both generated files only when draw data changed", () => {
  const commit = step("Commit updated data");

  assert.match(commit, /if: steps\.data_changes\.outputs\.changed == 'true'/);
  assert.match(
    commit,
    /git add web\/public\/data\/sorteios\.json web\/public\/data\/meta\.json/,
  );
  assert.doesNotMatch(commit, /git diff --quiet/);
  assert.match(commit, /git push/);
});

test("dispatches the existing Pages workflow after pushing the new data", () => {
  const commitStart = workflow.indexOf("      - name: Commit updated data");
  const dispatchStart = workflow.indexOf("      - name: Dispatch Pages deploy");
  const dispatch = step("Dispatch Pages deploy");

  assert.ok(dispatchStart > commitStart, "deploy dispatch must run after the commit and push step");
  assert.match(dispatch, /if: steps\.data_changes\.outputs\.changed == 'true'/);
  assert.match(dispatch, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(dispatch, /run: gh workflow run deploy-gh-pages\.yml --ref main/);
});

test("does not duplicate Pages build or deployment actions", () => {
  assert.doesNotMatch(workflow, /actions\/configure-pages/);
  assert.doesNotMatch(workflow, /actions\/upload-pages-artifact/);
  assert.doesNotMatch(workflow, /actions\/deploy-pages/);
});
