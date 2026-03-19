import assert from "node:assert/strict";
import test from "node:test";

import { buildStrategiesRanking, toStrategyKey } from "./strategies-core.js";

test("gera strategy key a partir da matriz", () => {
  const key = toStrategyKey({ matriz: [14, 15, 42, 44, 52, 63] });
  assert.equal(key, "14-15-42-44-52-63");
});

test("agrupar estrategias por ocorrencia", () => {
  const rows = [
    { sorteioValue: 100, matriz: [14, 15, 42, 44, 52, 63] },
    { sorteioValue: 101, matriz: [14, 15, 42, 44, 52, 63] },
    { sorteioValue: 102, matriz: [16, 24, 35, 41, 52, 63] }
  ];

  const result = buildStrategiesRanking(rows, { top: -1 });

  assert.equal(result.totalDraws, 3);
  assert.equal(result.ranking.length, 2);
  assert.equal(result.ranking[0].strategyKey, "14-15-42-44-52-63");
  assert.equal(result.ranking[0].wins, 2);
  assert.deepEqual(result.ranking[0].draws, [100, 101]);
  assert.equal(result.ranking[0].lastWinDraw, 101);
  assert.equal(result.ranking[0].winRate, 2 / 3);
});

test("desempata por concurso mais recente e depois strategy key", () => {
  const rows = [
    { sorteioValue: 200, matriz: [12, 23, 34, 45, 56, 61] },
    { sorteioValue: 201, matriz: [16, 24, 35, 41, 52, 63] },
    { sorteioValue: 202, matriz: [12, 23, 34, 45, 56, 61] },
    { sorteioValue: 203, matriz: [16, 24, 35, 41, 52, 63] }
  ];

  const result = buildStrategiesRanking(rows, { top: -1 });

  assert.equal(result.ranking[0].strategyKey, "16-24-35-41-52-63");
  assert.equal(result.ranking[0].lastWinDraw, 203);
  assert.equal(result.ranking[1].strategyKey, "12-23-34-45-56-61");
});

test("filtra por strategy key exata e respeita top", () => {
  const rows = [
    { sorteioValue: 1, matriz: [14, 15, 42, 44, 52, 63] },
    { sorteioValue: 2, matriz: [14, 15, 42, 44, 52, 63] },
    { sorteioValue: 3, matriz: [16, 24, 35, 41, 52, 63] }
  ];

  const filtered = buildStrategiesRanking(rows, { top: 10, strategyFilter: "16-24-35-41-52-63" });
  assert.equal(filtered.ranking.length, 1);
  assert.equal(filtered.ranking[0].wins, 1);

  const topOne = buildStrategiesRanking(rows, { top: 1 });
  assert.equal(topOne.ranking.length, 1);
  assert.equal(topOne.ranking[0].strategyKey, "14-15-42-44-52-63");
});
