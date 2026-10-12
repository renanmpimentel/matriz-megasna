import assert from "node:assert/strict";
import test from "node:test";

import { buildStrategiesTableRows, buildTypeFrequencyChart, normalizeStrategiesOptions } from "./strategies-view.js";

test("gráfico mostra totais e percentuais brasileiros na mesma escala", () => {
  const html = buildTypeFrequencyChart({ totalDraws: 4000, entries: [
    { type: "7x7", count: 1250, frequency: 0.3125 },
    { type: "8x8", count: 1000, frequency: 0.25 }
  ] });
  assert.match(html, /4\.000 sorteios/);
  assert.match(html, /7x7/);
  assert.match(html, /8x8/);
  assert.match(html, /1\.250 sorteios/);
  assert.match(html, /31,25%/);
  assert.match(html, /width: 31\.25%/);
  assert.match(html, /width: 25%/);
  assert.match(html, /100%/);
  assert.match(html, /filtros abaixo não alteram/);
});

test("gráfico sem histórico explica a ausência de dados", () => {
  const html = buildTypeFrequencyChart({ totalDraws: 0, entries: [
    { type: "7x7", count: 0, frequency: 0 },
    { type: "8x8", count: 0, frequency: 0 }
  ] });
  assert.match(html, /Nenhum sorteio disponível/);
  assert.doesNotMatch(html, /NaN|Infinity/);
});

test("normaliza opcoes de estrategia", () => {
  const options = normalizeStrategiesOptions({ top: "50", strategyFilter: " 14-15-42-44-52-63 " });
  assert.deepEqual(options, { top: 50, strategyFilter: "14-15-42-44-52-63", typeFilter: "" });

  const fallback = normalizeStrategiesOptions({ top: "999" });
  assert.equal(fallback.top, 10);
});

test("gera linhas de tabela de estrategias", () => {
  const rows = buildStrategiesTableRows([
    {
      strategyKey: "14-15-42-44-52-63",
      wins: 2,
      winRate: 0.5,
      type: "6x6",
      totalTypeDraws: 5,
      typeRate: 0.4,
      draws: [10, 15],
      lastWinDraw: 15
    }
  ]);

  assert.equal(rows.length, 1);
  assert.match(rows[0], /14-15-42-44-52-63/);
  assert.match(rows[0], /50\.00%/);
  assert.match(rows[0], /40\.00%/);
  assert.match(rows[0], /6x6/);
  assert.match(rows[0], /10, 15/);
});

test("normaliza filtro por tipo", () => {
  assert.equal(normalizeStrategiesOptions({ typeFilter: " 7x7 " }).typeFilter, "7x7");
});
