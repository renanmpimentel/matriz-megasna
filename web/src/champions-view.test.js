import assert from "node:assert/strict";
import test from "node:test";

import { buildChampionsTableRows, normalizeChampionsOptions } from "./champions-view.js";

test("normaliza opcoes de campeoes com defaults e limites", () => {
  const options = normalizeChampionsOptions({ n: "9", freqWeight: "2", recencyWeight: "-1", top: "500" });

  assert.deepEqual(options, {
    n: 9,
    freqWeight: 1,
    recencyWeight: 0,
    top: 100
  });
});

test("limita linhas do ranking com top configurado", () => {
  const rows = buildChampionsTableRows(
    [
      { signature: "11-12", frequencyAbsolute: 2, frequencyNormalized: 1, recencyNormalized: 0.8, finalScore: 0.96 },
      { signature: "21-22", frequencyAbsolute: 1, frequencyNormalized: 0.5, recencyNormalized: 1, finalScore: 0.6 }
    ],
    1
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].signature, "11-12");
});
