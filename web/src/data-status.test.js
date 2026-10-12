import assert from "node:assert/strict";
import test from "node:test";

import { buildDataStatusLabel } from "./data-status.js";

const deterministicFormatter = (date) => {
  assert.ok(date instanceof Date);
  return "08/10/2026, 21:15:00";
};

test("informa a atualizacao real e a data do ultimo jogo", () => {
  assert.equal(
    buildDataStatusLabel(
      {
        updatedAt: "2026-10-09T00:15:00.000Z",
        latestDrawDate: "08/10/2026",
      },
      deterministicFormatter,
    ),
    "Dados atualizados em: 08/10/2026, 21:15:00 | Data do ultimo jogo: 08/10/2026",
  );
});

test("informa indisponibilidade quando updatedAt esta ausente", () => {
  assert.equal(
    buildDataStatusLabel({ latestDrawDate: "08/10/2026" }, deterministicFormatter),
    "Dados atualizados em: indisponível | Data do ultimo jogo: 08/10/2026",
  );
});

test("informa indisponibilidade quando updatedAt e invalido", () => {
  assert.equal(
    buildDataStatusLabel(
      { updatedAt: "timestamp-invalido", latestDrawDate: "08/10/2026" },
      deterministicFormatter,
    ),
    "Dados atualizados em: indisponível | Data do ultimo jogo: 08/10/2026",
  );
});

test("omite a data do ultimo jogo quando ela esta ausente", () => {
  assert.equal(
    buildDataStatusLabel({ updatedAt: "2026-10-09T00:15:00.000Z" }, deterministicFormatter),
    "Dados atualizados em: 08/10/2026, 21:15:00",
  );
});

test("usa formatacao pt-BR por padrao", () => {
  const updatedAt = "2026-10-09T00:15:00.000Z";

  assert.equal(
    buildDataStatusLabel({ updatedAt }),
    `Dados atualizados em: ${new Date(updatedAt).toLocaleString("pt-BR")}`,
  );
});
