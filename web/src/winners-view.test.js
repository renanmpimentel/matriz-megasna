import assert from "node:assert/strict";
import test from "node:test";

import { buildWinnersTableRows, normalizeWinnersOptions } from "./winners-view.js";

test("normaliza opcoes de vencedores com defaults e limites", () => {
  const options = normalizeWinnersOptions({ n: "9", top: "500" });

  assert.deepEqual(options, {
    n: 9,
    top: 100
  });
});

test("limita linhas do ranking com top configurado", () => {
  const rows = buildWinnersTableRows(
    [
      { signature: "11-12", winsCount: 2 },
      { signature: "21-22", winsCount: 1 }
    ],
    1
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].signature, "11-12");
});
