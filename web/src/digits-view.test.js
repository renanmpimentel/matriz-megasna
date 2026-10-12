import assert from "node:assert/strict";
import test from "node:test";
import { buildDigitsTableRows, buildDigitsSummary } from "./digits-view.js";

const entry = { key: "012345", label: "123450", count: 64, frequency: 64 / 698, lastDraw: 3042, draws: [1, 38, 3042] };

test("dígitos e ação são botões acessíveis que controlam a mesma expansão", () => {
  const html = buildDigitsTableRows([entry]);
  assert.match(html, /123450/);
  assert.match(html, /9,17%/);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-controls="digits-details-012345"/g) ?? []).length, 2);
  assert.match(html, /Ver sorteios/);
  assert.doesNotMatch(html, /<table/);
});

test("expansão mostra 14 colunas, incluindo a soma das dezenas de cada sorteio", () => {
  const draws = [
    { sorteioValue: 1, matriz: [15, 16, 41, 44, 52, 63], numbers: ["04", "05", "30", "33", "41", "52"], sum: 165 },
    { sorteioValue: 38, matriz: [21, 53, 54, 56, 65, 66], numbers: [10, 42, 43, 45, 54, 55], sum: 249 }
  ];
  const html = buildDigitsTableRows([entry, { ...entry, key: "123456", label: "123456" }], { expandedKey: "012345", type: "6x6", draws });
  assert.match(html, /colspan="5"/);
  assert.match(html, /Sorteios do conjunto 123450/);
  assert.match(html, /Tipo 6x6 · 64 ocorrências/);
  assert.match(html, /Recolher sorteios/);
  assert.match(html, /Matriz 6/);
  assert.match(html, /Número 6/);
  assert.match(html, />Soma<\/th>/);
  const detailTable = html.match(/<table[\s\S]*?<\/table>/)[0];
  assert.equal((detailTable.match(/scope="col"/g) ?? []).length, 14);
  const detailRows = [...detailTable.matchAll(/<tr data-digit-draw="(\d+)"[\s\S]*?<\/tr>/g)];
  for (const [index, match] of detailRows.entries()) {
    assert.match(match[0], new RegExp(`>${draws[index].sum}</td>\\s*</tr>`));
    assert.equal(draws[index].sum, draws[index].numbers.reduce((total, number) => total + Number(number), 0));
  }
  assert.match(html, />04<\/td>/);
  assert.match(html, />05<\/td>/);
  assert.equal((html.match(/data-digit-draw=/g) ?? []).length, 2);
  assert.equal((html.match(/<table/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 2);
  assert.match(html, /9,17%/);
});

test("resumo distingue total de grupos dos resultados de busca", () => {
  const text = buildDigitsSummary({ totalTypeDraws: 698, totalGroups: 130, matchedGroups: 1 }, "6x6");
  assert.match(text, /698 sorteios do tipo 6x6/);
  assert.match(text, /130 conjuntos/);
  assert.match(text, /1 resultado/);
});
