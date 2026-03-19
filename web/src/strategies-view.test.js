import assert from "node:assert/strict";
import test from "node:test";

import { buildStrategiesTableRows, normalizeStrategiesOptions } from "./strategies-view.js";

test("normaliza opcoes de estrategia", () => {
  const options = normalizeStrategiesOptions({ top: "50", strategyFilter: " 14-15-42-44-52-63 " });
  assert.deepEqual(options, { top: 50, strategyFilter: "14-15-42-44-52-63" });

  const fallback = normalizeStrategiesOptions({ top: "999" });
  assert.equal(fallback.top, 10);
});

test("gera linhas de tabela de estrategias", () => {
  const rows = buildStrategiesTableRows([
    {
      strategyKey: "14-15-42-44-52-63",
      wins: 2,
      winRate: 0.5,
      draws: [10, 15],
      lastWinDraw: 15
    }
  ]);

  assert.equal(rows.length, 1);
  assert.match(rows[0], /14-15-42-44-52-63/);
  assert.match(rows[0], /50\.00%/);
  assert.match(rows[0], /10, 15/);
});
