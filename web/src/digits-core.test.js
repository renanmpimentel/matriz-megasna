import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { toDigitsKey, normalizeDigitsSearch, buildDigitsRanking, selectDigitsDraws } from "./digits-core.js";

test("detalhamento seleciona o conjunto e tipo exatos sem mutar nem eliminar repetições", () => {
  const a = { sorteioValue: 2, type: "6x6", numbers: ["04", "05", "30", "33", "41", "52"], matriz: [15, 16, 41, 44, 52, 63] };
  const b = { ...a, sorteioValue: 1 };
  const differentType = { ...a, type: "7x7", sorteioValue: 3 };
  const other = { ...a, numbers: [11, 22, 33, 44, 55, 66], sorteioValue: 4 };
  const input = [a, differentType, other, b];
  const before = structuredClone(input);
  const result = selectDigitsDraws(input, { type: "6x6", key: "123450" });
  assert.deepEqual(result, [b, a]);
  assert.deepEqual(result[0].matriz, [15, 16, 41, 44, 52, 63]);
  assert.equal(result[0].numbers[0], "04");
  assert.deepEqual(input, before);
  assert.deepEqual(selectDigitsDraws(input, { type: "6x6", key: "" }), []);
  assert.deepEqual(selectDigitsDraws(input, { type: "6x6", key: "112345" }), []);
  assert.deepEqual(selectDigitsDraws([], { type: "6x6", key: "012345" }), []);
});

const row = (id, numbers) => {
  const key = [...new Set(numbers.map(n => String(n).padStart(2, "0")).join(""))].sort().join("");
  return { sorteioValue: id, numbers, type: `${key.length}x${key.length}` };
};
const example = [4, 5, 30, 33, 41, 52];

test("chave preserva zero das dezenas e ignora ordem e repetição", () => {
  assert.equal(toDigitsKey(row(1, example)), "012345");
  assert.equal(toDigitsKey(row(1, [...example].reverse())), "012345");
  assert.equal(toDigitsKey(row(2, [11, 22, 33, 44, 55, 66])), "123456");
});

test("busca normaliza ordem e espaços, mas rejeita conjuntos inválidos", () => {
  for (const text of ["123450", "012345", "5 4 3 2 1 0"]) {
    assert.deepEqual(normalizeDigitsSearch(text, "6x6"), { key: "012345", error: "" });
  }
  assert.deepEqual(normalizeDigitsSearch("  ", "6x6"), { key: "", error: "" });
  for (const text of ["12345a", "112345", "12345", "1234567", "12-3450", "<script>"]) {
    assert.ok(normalizeDigitsSearch(text, "6x6").error);
  }
});

test("agrupamento exato separa tipos, ordena concursos e mantém denominador", () => {
  const rows = [row(8, example), row(2, example), row(9, [11, 22, 33, 44, 55, 66]), row(10, [4, 5, 30, 33, 21, 56])];
  const all = buildDigitsRanking(rows, { type: "6x6" });
  assert.equal(all.totalTypeDraws, 3);
  assert.equal(all.totalGroups, 2);
  assert.equal(all.entries[0].label, "123450");
  assert.equal(all.entries[0].count, 2);
  assert.equal(all.entries[0].frequency, 2 / 3);
  assert.equal(all.entries[0].lastDraw, 8);
  assert.deepEqual(all.entries[0].draws, [2, 8]);
  assert.equal(all.entries.reduce((sum, entry) => sum + entry.count, 0), 3);
  const filtered = buildDigitsRanking(rows, { type: "6x6", query: "012345" });
  assert.equal(filtered.totalTypeDraws, 3);
  assert.equal(filtered.totalGroups, 2);
  assert.equal(filtered.matchedGroups, 1);
  assert.equal(filtered.entries[0].frequency, 2 / 3);
});

test("desempate usa último concurso e depois chave", () => {
  const a = row(5, example);
  const b = row(6, [11, 22, 33, 44, 55, 66]);
  assert.equal(buildDigitsRanking([a, b], { type: "6x6" }).entries[0].key, "123456");
  b.sorteioValue = 5;
  assert.equal(buildDigitsRanking([b, a], { type: "6x6" }).entries[0].key, "012345");
});

test("vazio, busca sem resultado e busca inválida não exibem resultados enganosos", () => {
  for (const result of [buildDigitsRanking([], { type: "6x6" }), buildDigitsRanking([row(1, example)], { type: "6x6", query: "123456" })]) {
    assert.deepEqual(result.entries, []);
    assert.equal(result.matchedGroups, 0);
    assert.equal(result.totalPages, 1);
  }
  const invalid = buildDigitsRanking([row(1, example)], { type: "6x6", query: "abc" });
  assert.ok(invalid.error);
  assert.deepEqual(invalid.entries, []);
});

test("base até 3069 confirma 123450, paginação e cobertura dos grupos", () => {
  const draws = JSON.parse(readFileSync(new URL("../public/data/sorteios.json", import.meta.url), "utf8"));
  const rows = draws.filter(draw => Number(draw.draw) <= 3069).map(draw => row(Number(draw.draw), draw.numbers));
  const first = buildDigitsRanking(rows, { type: "6x6" });
  assert.equal(first.totalTypeDraws, 698);
  assert.equal(first.totalGroups, 130);
  assert.equal(first.totalPages, 6);
  assert.equal(first.entries.length, 25);
  assert.equal(first.entries[0].label, "123450");
  assert.equal(first.entries[0].count, 64);
  const details = selectDigitsDraws(rows, { type: "6x6", key: "012345" });
  assert.equal(details.length, 64);
  assert.equal(details[0].sorteioValue, 1);
  assert.equal(details.at(-1).sorteioValue, 3042);
  assert.deepEqual(details[0].numbers, [4, 5, 30, 33, 41, 52]);
  assert.equal(first.entries[0].lastDraw, 3042);
  assert.equal((first.entries[0].frequency * 100).toFixed(2), "9.17");
  const entries = [];
  for (let page = 1; page <= 6; page++) entries.push(...buildDigitsRanking(rows, { type: "6x6", page }).entries);
  assert.equal(new Set(entries.map(entry => entry.key)).size, 130);
  assert.equal(entries.reduce((sum, entry) => sum + entry.count, 0), 698);
  assert.equal(buildDigitsRanking(rows, { type: "6x6", page: 99 }).page, 6);
  const filtered = buildDigitsRanking(rows, { type: "6x6", query: "123450", page: 6 });
  assert.equal(filtered.page, 1);
  assert.equal(filtered.entries[0].frequency, 64 / 698);
});
