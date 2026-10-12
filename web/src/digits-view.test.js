import assert from "node:assert/strict";
import test from "node:test";
import { buildDigitsTableRows, buildDigitsSummary } from "./digits-view.js";

test("tabela mantém zero no final e oferece todos os concursos em expansão nativa", () => {
  const html = buildDigitsTableRows([{ label: "123450", count: 64, frequency: 64 / 698, lastDraw: 3042, draws: [1, 38, 3042] }]);
  assert.match(html, /123450/);
  assert.match(html, /9,17%/);
  assert.match(html, /<details/);
  assert.match(html, /Ver concursos/);
  assert.match(html, /1, 38, 3042/);
});

test("resumo distingue total de grupos dos resultados de busca", () => {
  const text = buildDigitsSummary({ totalTypeDraws: 698, totalGroups: 130, matchedGroups: 1 }, "6x6");
  assert.match(text, /698 sorteios do tipo 6x6/);
  assert.match(text, /130 conjuntos/);
  assert.match(text, /1 resultado/);
});
