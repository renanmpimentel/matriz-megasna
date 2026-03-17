import assert from "node:assert/strict";
import test from "node:test";

import { buildStrategyRanking } from "./strategy-analysis.js";

test("monta ranking com historico de times e matriz por jogo", () => {
  const draws = [
    { draw: 1, numbers: [11, 12, 13, 14, 15, 16] },
    { draw: 2, numbers: [11, 12, 13, 14, 15, 16] },
    { draw: 3, numbers: [21, 22, 23, 24, 25, 26] },
    { draw: 4, numbers: [98, 11, 12, 13, 14, 15] }
  ];

  const result = buildStrategyRanking(draws, { n: 6, freqWeight: 0.8, recencyWeight: 0.2 });

  assert.equal(result.validDrawsCount, 3);
  assert.equal(result.discardedDrawsCount, 1);
  assert.equal(result.ranking.length, 2);

  const [first, second] = result.ranking;

  assert.equal(first.signature, "11-12-13-14-15-16");
  assert.equal(first.winsCount, 2);
  assert.equal(first.frequencyAbsolute, 2);
  assert.equal(first.frequencyNormalized, 1);
  assert.equal(first.recencyNormalized, 0.5);
  assert.equal(first.finalScore, 0.9);

  assert.deepEqual(first.wins, [
    {
      teamLabel: "000001/jogo 1 da mega",
      matrixLabel: "11-12-13-14-15-16/jogo 1 da mega sena"
    },
    {
      teamLabel: "000002/jogo 2 da mega",
      matrixLabel: "11-12-13-14-15-16/jogo 2 da mega sena"
    }
  ]);

  assert.equal(second.signature, "21-22-23-24-25-26");
  assert.equal(second.winsCount, 1);
  assert.deepEqual(second.wins, [
    {
      teamLabel: "000003/jogo 3 da mega",
      matrixLabel: "21-22-23-24-25-26/jogo 3 da mega sena"
    }
  ]);
});

test("respeita top no recorte de exibicao", () => {
  const draws = [
    { draw: 1, numbers: [11, 12, 13, 14, 15, 16] },
    { draw: 2, numbers: [11, 12, 13, 14, 15, 16] },
    { draw: 3, numbers: [21, 22, 23, 24, 25, 26] }
  ];

  const result = buildStrategyRanking(draws, { n: 6, freqWeight: 0.8, recencyWeight: 0.2 });

  assert.equal(result.ranking[0].signature, "11-12-13-14-15-16");
});
