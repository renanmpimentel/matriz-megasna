import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getGeneratorContext, validateGeneratorQuantity, validateGeneratorRange, getFrequentSums, generateGames } from "./generator-core.js";
import { buildMatrix } from "./matrix-core.js";
import { toDigitsKey } from "./digits-core.js";

const row = (sorteioValue, numbers) => ({ sorteioValue, numbers, type: `${toDigitsKey({ numbers }).length}x${toDigitsKey({ numbers }).length}` });
const base = { key: "012345", minSum: 69, maxSum: 249, quantity: 10, historyDraws: [] };

test("intervalo editável aceita limites físicos inclusivos e uma soma exata", () => {
  assert.deepEqual(validateGeneratorRange(21, 345), { minSum: 21, maxSum: 345, error: "" });
  assert.deepEqual(validateGeneratorRange(" 145 ", "145"), { minSum: 145, maxSum: 145, error: "" });
  assert.deepEqual(validateGeneratorRange(30, 320), { minSum: 30, maxSum: 320, error: "" });
});

test("intervalo editável rejeita limites inválidos e invertidos", () => {
  for (const invalid of [null, undefined, true, false, [], [21], "", " ", NaN, Infinity, "abc", 21.5, "21.5", 20, 346]) {
    for (const [min, max] of [[invalid, 345], [21, invalid]]) {
      const range = validateGeneratorRange(min, max);
      assert.ok(range.error, `${String(min)}..${String(max)}`);
      assert.equal(range.minSum, null);
      assert.equal(range.maxSum, null);
    }
  }
  assert.ok(validateGeneratorRange(100, 99).error);
});

test("somas mais frequentes incluem todos os empates em ordem numérica e derivam das dezenas", () => {
  const historyDraws = [
    row(1, [1, 2, 3, 4, 5, 54]), row(2, ["01", "02", "03", "04", "05", "10"]),
    row(3, [1, 2, 3, 4, 5, 54]), row(4, [1, 2, 3, 4, 5, 10]), row(5, [1, 2, 3, 4, 5, 11]),
  ];
  historyDraws[0].sum = 999;
  const snapshot = structuredClone(historyDraws);
  assert.deepEqual(getFrequentSums(historyDraws), [{ sum: 25, count: 2 }, { sum: 69, count: 2 }]);
  assert.deepEqual(historyDraws, snapshot);
  assert.deepEqual(getFrequentSums([]), []);
  assert.deepEqual(getFrequentSums([historyDraws[0]]), [{ sum: 69, count: 1 }]);
});

test("contexto normaliza dígitos e deriva intervalo das dezenas, não de soma pré-calculada", () => {
  const rows = [row(2, [1, 2, 3, 4, 5, 54]), row(1, [1, 2, 3, 4, 5, 10]), row(3, [1, 2, 3, 4, 5, 60])];
  rows[0].sum = 999;
  const snapshot = structuredClone(rows);
  const context = getGeneratorContext(rows, "1 2 3 4 5 0");
  assert.deepEqual(context, { key: "012345", error: "", minSum: 25, maxSum: 69, historyCount: 2, historyDraws: [rows[1], rows[0]] });
  assert.deepEqual(rows, snapshot);
});

test("contexto rejeita entrada vazia ou inválida e conjunto sem histórico", () => {
  for (const input of ["", "  ", "12345", "112345", "1234567", "12x450", "123450"]) {
    const context = getGeneratorContext([], input);
    assert.ok(context.error, input);
    assert.equal(context.minSum, null);
    assert.equal(context.maxSum, null);
    assert.equal(context.historyCount, 0);
    assert.deepEqual(context.historyDraws, []);
  }
});

test("base até concurso 3069 confirma 64 sorteios e intervalo 69 a 249", () => {
  const draws = JSON.parse(readFileSync(new URL("../public/data/sorteios.json", import.meta.url), "utf8"));
  const context = getGeneratorContext(draws.filter(draw => draw.draw <= 3069).map(draw => row(Number(draw.draw), draw.numbers)), "123450");
  assert.equal(context.error, "");
  assert.equal(context.historyCount, 64);
  assert.equal(context.minSum, 69);
  assert.equal(context.maxSum, 249);
});

test("quantidade aceita somente inteiros de 1 a 100", () => {
  for (const value of [1, 10, 100, "10", " 10 "]) assert.deepEqual(validateGeneratorQuantity(value), { quantity: Number(value), error: "" });
  for (const value of ["", " ", 0, 101, -1, 1.5, "1.5", "abc", null, undefined, NaN, Infinity, true, []]) {
    const result = validateGeneratorQuantity(value);
    assert.ok(result.error, String(value));
    assert.equal(result.quantity, null);
  }
});

test("geração respeita limites inclusivos e entrega todas quando quantidade excede disponíveis", () => {
  for (const [sum, expected] of [[25, [1, 2, 3, 4, 5, 10]], [315, [50, 51, 52, 53, 54, 55]]]) {
    const result = generateGames({ ...base, minSum: sum, maxSum: sum });
    assert.equal(result.totalValid, 1);
    assert.deepEqual(result.games, [{ numbers: expected, matriz: buildMatrix(expected), sum, contests: [] }]);
  }
  assert.deepEqual(generateGames({ ...base, minSum: 0, maxSum: 1 }), { games: [], totalValid: 0 });
});

test("histórico reconhece dezenas independentemente da ordem e lista todos os concursos", () => {
  const historyDraws = [row(50, [10, 5, 4, 3, 2, 1]), row(2, [1, 2, 3, 4, 5, 10])];
  const snapshot = structuredClone(historyDraws);
  assert.deepEqual(generateGames({ ...base, minSum: 25, maxSum: 25, historyDraws }).games[0].contests, [2, 50]);
  assert.deepEqual(historyDraws, snapshot);
});

test("lote usa seis dezenas únicas, todos e somente os dígitos e soma na faixa", () => {
  const input = { ...base, quantity: 100 };
  const snapshot = structuredClone(input);
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const result = generateGames(input, random);
  assert.ok(result.totalValid > 100);
  assert.equal(result.games.length, 100);
  assert.equal(new Set(result.games.map(game => game.numbers.join(","))).size, 100);
  for (const game of result.games) {
    assert.equal(game.numbers.length, 6);
    assert.equal(new Set(game.numbers).size, 6);
    assert.ok(game.numbers.every(number => number >= 1 && number <= 60));
    assert.deepEqual(game.numbers, [...game.numbers].sort((a, b) => a - b));
    assert.equal(toDigitsKey(game), base.key);
    assert.equal(game.sum, game.numbers.reduce((a, b) => a + b, 0));
    assert.ok(game.sum >= base.minSum && game.sum <= base.maxSum);
    assert.deepEqual(game.matriz, buildMatrix(game.numbers));
  }
  assert.deepEqual(result.games, [...result.games].sort((a, b) => a.sum - b.sum || a.numbers.reduce((order, n, index) => order || n - b.numbers[index], 0)));
  assert.deepEqual(input, snapshot);
});

test("reservatório substitui ou conserva entradas conforme sorteio, sem alterar contagem", () => {
  const settings = { ...base, minSum: 25, maxSum: 26, quantity: 1 };
  const first = generateGames(settings, () => 0.999999);
  const last = generateGames(settings, () => 0);
  assert.equal(first.totalValid, 2);
  assert.equal(last.totalValid, 2);
  assert.deepEqual(first.games[0].numbers, [1, 2, 3, 4, 5, 10]);
  assert.deepEqual(last.games[0].numbers, [1, 2, 3, 4, 5, 11]);
});

test("API de geração rejeita parâmetros inválidos", () => {
  for (const change of [{ key: "" }, { key: "001234" }, { key: "abcdef" }, { quantity: 0 }, { quantity: 101 }, { minSum: -1 }, { minSum: NaN }, { maxSum: Infinity }, { minSum: 100, maxSum: 99 }, { minSum: 1.5 }]) {
    assert.throws(() => generateGames({ ...base, ...change }));
  }
});
