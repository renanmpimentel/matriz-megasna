import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildMatrix } from "./matrix-core.js";

test("matriz usa posições dos dígitos incluindo zero à esquerda, sem ordenar dezenas", () => {
  const numbers = [52, 4, 5, 30, 33, 41];
  assert.deepEqual(buildMatrix(numbers), [63, 15, 16, 41, 44, 52]);
  assert.deepEqual(numbers, [52, 4, 5, 30, 33, 41]);
  assert.deepEqual(buildMatrix(numbers.map(String)), buildMatrix(numbers));
});

test("matriz compartilhada preserva algoritmo anterior em toda a base e todos os tipos", () => {
  const draws = JSON.parse(readFileSync(new URL("../public/data/sorteios.json", import.meta.url), "utf8"));
  for (const draw of draws) {
    const concat = draw.numbers.map(number => String(number).padStart(2, "0")).join("");
    const digits = [...new Set(concat)].sort().join("");
    const expected = Array.from({ length: 6 }, (_, i) => Number(`${digits.indexOf(concat[i * 2]) + 1}${digits.indexOf(concat[i * 2 + 1]) + 1}`));
    assert.deepEqual(buildMatrix(draw.numbers), expected, `Concurso ${draw.draw}`);
  }
});
