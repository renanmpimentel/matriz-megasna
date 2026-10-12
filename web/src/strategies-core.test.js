import assert from "node:assert/strict";
import test from "node:test";

import { buildStrategiesRanking, buildTypeFrequency, toStrategyKey } from "./strategies-core.js";

test("frequência total soma sorteios de cada tipo, inclusive matrizes repetidas", () => {
  const rows = [
    { type: "7x7", matriz: [1, 2, 3, 4, 5, 6] },
    { type: "7x7", matriz: [1, 2, 3, 4, 5, 6] },
    { type: "8x8" },
    { type: "6x6" }
  ];
  assert.deepEqual(buildTypeFrequency(rows), {
    totalDraws: 4,
    entries: [
      { type: "6x6", count: 1, frequency: 0.25 },
      { type: "7x7", count: 2, frequency: 0.5 },
      { type: "8x8", count: 1, frequency: 0.25 }
    ]
  });
});

test("frequência total sem sorteios não inventa tipos", () => {
  assert.deepEqual(buildTypeFrequency([]), { totalDraws: 0, entries: [] });
});

test("frequência total inclui todos os tipos em ordem numérica e cobre toda a base", () => {
  const rows = ["10x10", "6x6", "4x4", "9x9", "5x5", "8x8", "7x7", "6x6"].map(type => ({ type }));
  const result = buildTypeFrequency(rows);
  assert.deepEqual(result.entries.map(entry => entry.type), ["4x4", "5x5", "6x6", "7x7", "8x8", "9x9", "10x10"]);
  assert.equal(result.entries.reduce((sum, entry) => sum + entry.count, 0), rows.length);
  assert.equal(result.entries.reduce((sum, entry) => sum + entry.frequency, 0), 1);
});

const matrixA = [14, 15, 42, 44, 52, 63];
const matrixB = [16, 24, 35, 41, 52, 63];
const typedRows = [
  { sorteioValue: 1, matriz: matrixA, type: "6x6" },
  { sorteioValue: 2, matriz: matrixA, type: "6x6" },
  { sorteioValue: 3, matriz: matrixB, type: "6x6" },
  { sorteioValue: 4, matriz: matrixA, type: "7x7" }
];

test("separa a frequência da matriz por tipo e mantém a frequência geral", () => {
  const result = buildStrategiesRanking(typedRows);
  assert.equal(result.totalStrategies, 3);
  const leader = result.ranking[0];
  assert.equal(leader.type, "6x6");
  assert.equal(leader.wins, 2);
  assert.equal(leader.totalTypeDraws, 3);
  assert.equal(leader.typeRate, 2 / 3);
  assert.equal(leader.winRate, 2 / 4);
  assert.deepEqual(leader.draws, [1, 2]);
  const otherType = result.ranking.find((entry) => entry.type === "7x7");
  assert.equal(otherType.typeRate, 1);
  assert.deepEqual(otherType.draws, [4]);
});

test("filtro exato e Top N não reduzem o denominador do tipo", () => {
  const result = buildStrategiesRanking(typedRows, {
    typeFilter: "6x6", strategyFilter: matrixA.join("-"), top: 1
  });
  assert.equal(result.totalDraws, 4);
  assert.equal(result.selectedTypeDraws, 3);
  assert.equal(result.ranking.length, 1);
  assert.equal(result.ranking[0].typeRate, 2 / 3);
  assert.equal(result.ranking[0].winRate, 0.5);
  const limited = buildStrategiesRanking(typedRows, { typeFilter: "6x6", top: 1 });
  assert.equal(limited.totalStrategies, 2);
  assert.equal(limited.ranking.length, 1);
});

test("tipos ausentes e dados vazios não geram frequências inválidas", () => {
  for (const rows of [[], typedRows]) {
    const result = buildStrategiesRanking(rows, { typeFilter: "10x10" });
    assert.deepEqual(result.ranking, []);
    assert.equal(result.selectedTypeDraws, 0);
    assert.equal(result.totalStrategies, 0);
  }
});

test("as frequências somam 100% dentro de cada tipo com todas as matrizes", () => {
  for (const typeFilter of ["6x6", "7x7"]) {
    const result = buildStrategiesRanking(typedRows, { typeFilter, top: -1 });
    assert.equal(result.ranking.reduce((sum, entry) => sum + entry.typeRate, 0), 1);
    assert.equal(result.ranking.reduce((sum, entry) => sum + entry.wins, 0), result.selectedTypeDraws);
  }
});

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
