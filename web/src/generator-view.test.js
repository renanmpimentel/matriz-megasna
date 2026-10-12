import assert from "node:assert/strict";
import test from "node:test";
import { buildGeneratorPanel, buildGeneratorRows, buildGeneratorResultSummary, buildFrequentSumOptions } from "./generator-view.js";

test("painel permite calcular total, editar intervalo e escolher entre somas frequentes empatadas", () => {
  const html = buildGeneratorPanel();
  for (const id of ["generator-min-sum", "generator-max-sum", "generator-frequent-sum"]) {
    assert.match(html, new RegExp(`for="${id}"`));
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /Calcular total/);
  assert.match(html, /Restaurar intervalo histórico/);
  assert.match(html, /id="generator-total"/);
  assert.match(html, /mesmo valor nos dois campos/);
  const options = buildFrequentSumOptions([{ sum: 145, count: 3 }, { sum: 198, count: 3 }]);
  assert.match(options, /value="145">145 — 3 ocorrências/);
  assert.match(options, /value="198">198 — 3 ocorrências/);
  assert.doesNotMatch(buildFrequentSumOptions([]), /undefined|NaN/);
});

test("painel oferece campos rotulados, limites da quantidade e ações acessíveis", () => {
  const html = buildGeneratorPanel();
  for (const id of ["generator-digits", "generator-quantity"]) {
    assert.match(html, new RegExp(`for="${id}"`));
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /value="123450"/);
  assert.match(html, /min="1" max="100" step="1" value="10"/);
  assert.match(html, /Gerar matrizes/);
  assert.match(html, /Cancelar/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /O intervalo histórico é um filtro de seleção, não uma previsão de resultado/);
});

test("linhas separam matriz de dezenas, mostram soma e todos os concursos", () => {
  const html = buildGeneratorRows([
    { numbers: [4, 5, 30, 33, 41, 52], matriz: [15, 16, 41, 44, 52, 63], sum: 165, contests: [1, 38] },
    { numbers: [1, 2, 3, 4, 5, 10], matriz: [12, 13, 14, 15, 16, 21], sum: 25, contests: [] }
  ]);
  assert.equal((html.match(/data-generated-game=/g) ?? []).length, 2);
  assert.match(html, /04 05 30 33 41 52/);
  assert.match(html, /15 16 41 44 52 63/);
  assert.match(html, />165<\/td>/);
  assert.match(html, /Concursos 1, 38/);
  assert.match(html, /Não encontrado na base/);
  assert.equal(buildGeneratorRows([]), "");
});

test("resumo informa total válido, quantidade gerada, insuficiência e vazio", () => {
  assert.match(buildGeneratorResultSummary({ games: Array(10), totalValid: 123456 }, 10), /123\.456/);
  assert.match(buildGeneratorResultSummary({ games: Array(10), totalValid: 123456 }, 10), /10 jogos gerados/);
  assert.match(buildGeneratorResultSummary({ games: Array(2), totalValid: 2 }, 10), /apenas 2 combinações/);
  assert.match(buildGeneratorResultSummary({ games: [], totalValid: 0 }, 10), /Nenhuma combinação/);
});
