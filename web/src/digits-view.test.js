import assert from "node:assert/strict";
import test from "node:test";
import { buildDigitsTableRows, buildDigitsSummary } from "./digits-view.js";

const entry = { key: "012345", label: "123450", count: 64, frequency: 64 / 698, lastDraw: 3042, draws: [1, 38, 3042] };

test("ordenação explícita começa pelas mais frequentes e mantém opção e linhas sincronizadas", () => {
  const draws = [69, 165, 165, 249].map((sum, index) => ({ sum, sorteioValue: index + 1, matriz: [], numbers: [] }));
  const options = { expandedKey: entry.key, type: "6x6", draws };
  const html = buildDigitsTableRows([entry], options);
  assert.match(html, /<label[^>]*for="digits-sum-order"[^>]*>Ordenar por<\/label>/);
  assert.match(html, /<select[^>]*id="digits-sum-order"/);
  assert.match(html, /<option value="count-desc" selected>Mais ocorrências<\/option>/);
  for (const label of ["Menos ocorrências", "Maior soma", "Menor soma"]) assert.ok(html.includes(label));
  assert.deepEqual([...html.matchAll(/data-sum-frequency="(\d+)"/g)].map(match => Number(match[1])), [165, 69, 249]);
  assert.match(html, /Mais frequente/);
  for (const [sumOrder, expected] of Object.entries({ "count-desc": [165, 69, 249], "count-asc": [69, 249, 165], "sum-desc": [249, 165, 69], "sum-asc": [69, 165, 249] })) {
    const sorted = buildDigitsTableRows([entry], { ...options, sumOrder });
    assert.deepEqual([...sorted.matchAll(/data-sum-frequency="(\d+)"/g)].map(match => Number(match[1])), expected);
    assert.match(sorted, new RegExp(`<option value="${sumOrder}" selected>`));
    assert.match(sorted, /Total de sorteios<\/th><td[^>]*>4<\/td>/);
    assert.equal((sorted.match(/data-digit-draw=/g) ?? []).length, 4);
  }
  const unique = buildDigitsTableRows([entry], { ...options, draws: draws.slice(0, 2) });
  assert.doesNotMatch(unique, /Mais frequente/);
});

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
  const detailTable = html.match(/<table[^>]*aria-label="Matrizes[^>]*>[\s\S]*?<\/table>/)[0];
  assert.equal((detailTable.match(/scope="col"/g) ?? []).length, 14);
  const detailRows = [...detailTable.matchAll(/<tr data-digit-draw="(\d+)"[\s\S]*?<\/tr>/g)];
  for (const [index, match] of detailRows.entries()) {
    assert.match(match[0], new RegExp(`>${draws[index].sum}</td>\\s*</tr>`));
    assert.equal(draws[index].sum, draws[index].numbers.reduce((total, number) => total + Number(number), 0));
  }
  assert.match(html, />04<\/td>/);
  assert.match(html, />05<\/td>/);
  assert.equal((html.match(/data-digit-draw=/g) ?? []).length, 2);
  assert.equal((html.match(/<table/g) ?? []).length, 2);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 2);
  assert.match(html, /9,17%/);
});

test("resumo distingue total de grupos dos resultados de busca", () => {
  const text = buildDigitsSummary({ totalTypeDraws: 698, totalGroups: 130, matchedGroups: 1 }, "6x6");
  assert.match(text, /698 sorteios do tipo 6x6/);
  assert.match(text, /130 conjuntos/);
  assert.match(text, /1 resultado/);
});

test("detalhamento informa menor e maior soma apenas do conjunto aberto", () => {
  const draws = [249, 165, 117, 249].map((sum, index) => ({ sorteioValue: index + 1, sum, matriz: [], numbers: [] }));
  const html = buildDigitsTableRows([entry, { ...entry, key: "123456" }], { expandedKey: entry.key, type: "6x6", draws });
  assert.match(html, /Menor soma: <strong>117<\/strong>/);
  assert.match(html, /Maior soma: <strong>249<\/strong>/);
  assert.equal((html.match(/data-digit-sums/g) ?? []).length, 1);
  assert.doesNotMatch(buildDigitsTableRows([entry]), /Menor soma|Maior soma/);
});

test("ocorrência única mostra a mesma soma nos dois extremos e vazio não mostra Infinity", () => {
  const html = buildDigitsTableRows([entry], { expandedKey: entry.key, type: "6x6", draws: [{ sorteioValue: 1, sum: 165, matriz: [], numbers: [] }] });
  assert.match(html, /Menor soma: <strong>165<\/strong>/);
  assert.match(html, /Maior soma: <strong>165<\/strong>/);
  const empty = buildDigitsTableRows([entry], { expandedKey: entry.key, type: "6x6", draws: [] });
  assert.doesNotMatch(empty, /Infinity|NaN|Menor soma|Maior soma/);
});

test("tabela de somas separada mostra uma linha por soma e total dos sorteios do grupo", () => {
  const draws = [69, 165, 69].map((sum, index) => ({ sum, sorteioValue: index + 1, matriz: [], numbers: [] }));
  const html = buildDigitsTableRows([entry], { expandedKey: entry.key, type: "6x6", draws });
  assert.match(html, /Frequência das somas/);
  assert.match(html, /data-digit-sum-frequency/);
  const rows = [...html.matchAll(/<tr data-sum-frequency="(\d+)"[\s\S]*?<\/tr>/g)];
  assert.equal(rows.length, 2);
  assert.equal(rows[0][1], "69");
  assert.match(rows[0][0], />2<\/td>/);
  assert.match(rows[1][0], />1<\/td>/);
  assert.match(html, /Total de sorteios<\/th><td[^>]*>3<\/td>/);
  assert.doesNotMatch(buildDigitsTableRows([entry]), /data-digit-sum-frequency/);
});
