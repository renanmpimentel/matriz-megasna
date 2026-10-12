import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { buildTypeCadence } from "./strategies-core.js";
import { buildCadenceOverview, buildCadenceDetails } from "./strategies-view.js";

const rows = ["7x7", "6x6", "6x6", "7x7", "7x7", "6x6", "7x7", "7x7"]
  .map((type, index) => ({ type, sorteioValue: index + 1 }));

test("cadência ordena sem mutar e separa intervalos completos da espera atual", () => {
  const input = [...rows].reverse();
  const before = structuredClone(input);
  const result = buildTypeCadence(input);
  assert.equal(result.status, "ready");
  assert.deepEqual(input, before);
  assert.deepEqual(result.entries.map(entry => entry.type), ["6x6", "7x7"]);
  const six = result.entries[0];
  assert.equal(six.count, 3);
  assert.equal(six.oneEvery, 8 / 3);
  assert.equal(six.meanGap, 2);
  assert.equal(six.maxGap, 3);
  assert.equal(six.lastDraw, 6);
  assert.equal(six.sinceLast, 2);
  assert.equal(six.intervalCount, 2);
  assert.deepEqual(six.distribution, [
    { gap: 1, count: 1, frequency: 0.5 },
    { gap: 2, count: 0, frequency: 0 },
    { gap: 3, count: 1, frequency: 0.5 }
  ]);
  const seven = result.entries[1];
  assert.equal(seven.sinceLast, 0);
  assert.equal(seven.distribution.find(item => item.gap === 1).count, 2);
  for (const entry of result.entries) {
    assert.equal(entry.intervalCount, entry.count - 1);
    assert.equal(entry.distribution.reduce((sum, item) => sum + item.count, 0), entry.intervalCount);
  }
});

test("histórico vazio e ocorrência única não produzem intervalos fictícios", () => {
  assert.deepEqual(buildTypeCadence([]), { status: "empty", totalDraws: 0, entries: [] });
  const result = buildTypeCadence([{ sorteioValue: 1, type: "6x6" }]);
  assert.equal(result.entries[0].oneEvery, 1);
  assert.equal(result.entries[0].meanGap, null);
  assert.equal(result.entries[0].maxGap, null);
  assert.deepEqual(result.entries[0].distribution, []);
  assert.match(buildCadenceDetails(result.entries[0]), /Ainda não há intervalo completo/);
  assert.match(buildCadenceOverview(buildTypeCadence([])), /Nenhum sorteio/);
});

test("concursos ausentes, duplicados ou inválidos impedem exibir cadência", () => {
  for (const ids of [[1, 3], [1, 1], [2, 3], [0, 1], [1, NaN], [1, 2.5]]) {
    const result = buildTypeCadence(ids.map(sorteioValue => ({ sorteioValue, type: "6x6" })));
    assert.equal(result.status, "invalid");
    assert.deepEqual(result.entries, []);
    assert.match(buildCadenceOverview(result), /Histórico inconsistente/);
    assert.doesNotMatch(buildCadenceOverview(result), /1 a cada/);
  }
});

test("apresentação identifica bases, formata médias e inclui intervalos zero", () => {
  const result = buildTypeCadence(rows);
  const overview = buildCadenceOverview(result);
  assert.match(overview, /1 a cada 2,7 concursos/);
  assert.match(overview, /6x6/);
  const detail = buildCadenceDetails(result.entries[0]);
  assert.match(detail, /2,0 concursos/);
  assert.match(detail, /2 intervalos completos/);
  assert.match(detail, /Após 2 concursos/);
  assert.match(detail, /0 vezes/);
  assert.match(detail, /50,00%/);
  assert.doesNotMatch(detail, /NaN|Infinity/);
});

test("base atual: 6x6 tem intervalos consistentes com o histórico", () => {
  const draws = JSON.parse(readFileSync(new URL("../public/data/sorteios.json", import.meta.url), "utf8"));
  // Fixar o recorte torna a regressão estável quando novos concursos forem sincronizados.
  const historical = draws.filter(draw => Number(draw.draw) <= 3069).map(draw => {
    const size = new Set(draw.numbers.map(n => String(n).padStart(2, "0")).join("")).size;
    return { sorteioValue: Number(draw.draw), type: `${size}x${size}` };
  });
  const result = buildTypeCadence(historical);
  assert.equal(result.status, "ready");
  assert.equal(result.totalDraws, 3069);
  const six = result.entries.find(entry => entry.type === "6x6");
  assert.equal(six.count, 698);
  assert.equal(six.intervalCount, 697);
  assert.equal(six.maxGap, 23);
  assert.equal(six.lastDraw, 3061);
  assert.equal(six.sinceLast, 8);
  assert.equal(six.distribution[0].count, 155);
  assert.equal(six.oneEvery.toFixed(1), "4.4");
});
