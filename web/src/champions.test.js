import assert from "node:assert/strict";
import test from "node:test";

import { buildChampionsRanking, isPositionValid, toPositionPair } from "./champions.js";

test("converte dezena em par linha/coluna", () => {
  assert.deepEqual(toPositionPair(41), { row: 4, col: 1, value: "41" });
  assert.deepEqual(toPositionPair("05"), { row: 0, col: 5, value: "05" });
});

test("valida posicao dentro da matriz n x n", () => {
  assert.equal(isPositionValid({ row: 4, col: 1 }, 6), true);
  assert.equal(isPositionValid({ row: 0, col: 5 }, 6), false);
  assert.equal(isPositionValid({ row: 7, col: 2 }, 6), false);
});

test("ranqueia assinaturas por score ponderado e descarta concursos invalidos", () => {
  const draws = [
    { draw: 1, numbers: [11, 12, 13, 14, 15, 16] },
    { draw: 2, numbers: [11, 12, 13, 14, 15, 16] },
    { draw: 3, numbers: [21, 22, 23, 24, 25, 26] },
    { draw: 4, numbers: [98, 21, 22, 23, 24, 25] }
  ];

  const result = buildChampionsRanking(draws, { n: 6, freqWeight: 0.8, recencyWeight: 0.2 });

  assert.equal(result.validDrawsCount, 3);
  assert.equal(result.discardedDrawsCount, 1);
  assert.equal(result.ranking.length, 2);

  const [first, second] = result.ranking;
  assert.equal(first.signature, "11-12-13-14-15-16");
  assert.equal(first.frequencyAbsolute, 2);
  assert.equal(first.frequencyNormalized, 1);
  assert.equal(first.recencyNormalized, 0.5);
  assert.equal(first.finalScore, 0.9);

  assert.equal(second.signature, "21-22-23-24-25-26");
  assert.equal(second.frequencyAbsolute, 1);
  assert.equal(second.frequencyNormalized, 0.5);
  assert.equal(second.recencyNormalized, 1);
  assert.equal(second.finalScore, 0.6);
});

test("respeita n configuravel na validacao de concursos", () => {
  const draws = [
    { draw: 1, numbers: [98, 21, 22, 23, 24, 25] }
  ];

  const withN6 = buildChampionsRanking(draws, { n: 6, freqWeight: 0.8, recencyWeight: 0.2 });
  const withN9 = buildChampionsRanking(draws, { n: 9, freqWeight: 0.8, recencyWeight: 0.2 });

  assert.equal(withN6.validDrawsCount, 0);
  assert.equal(withN6.discardedDrawsCount, 1);
  assert.equal(withN9.validDrawsCount, 1);
  assert.equal(withN9.discardedDrawsCount, 0);
});
