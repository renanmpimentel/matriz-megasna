import assert from "node:assert/strict";
import test from "node:test";

import { loadDrawData } from "./draw-data-loader.js";

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return body;
    },
  };
}

test("carrega sorteios e metadados usando a base informada", async () => {
  const draws = [{ draw: 3068, date: "08/10/2026", numbers: [1, 2, 3, 4, 5, 6] }];
  const metadata = { updatedAt: "2026-10-09T00:15:00.000Z" };
  const requestedUrls = [];
  const fetchImpl = async (url) => {
    requestedUrls.push(url);
    return url.endsWith("sorteios.json") ? jsonResponse(draws) : jsonResponse(metadata);
  };

  assert.deepEqual(await loadDrawData("/matriz-megasna/", fetchImpl), { draws, metadata });
  assert.deepEqual(requestedUrls, [
    "/matriz-megasna/data/sorteios.json",
    "/matriz-megasna/data/meta.json",
  ]);
});

test("preserva os sorteios quando a requisicao de metadados falha", async () => {
  const draws = [{ draw: 3068 }];
  const fetchImpl = async (url) => {
    if (url.endsWith("meta.json")) throw new Error("rede indisponivel");
    return jsonResponse(draws);
  };

  assert.deepEqual(await loadDrawData("/", fetchImpl), { draws, metadata: null });
});

test("preserva os sorteios quando os metadados respondem com erro HTTP", async () => {
  const draws = [{ draw: 3068 }];
  const fetchImpl = async (url) =>
    url.endsWith("meta.json")
      ? jsonResponse(null, { ok: false, status: 404 })
      : jsonResponse(draws);

  assert.deepEqual(await loadDrawData("/", fetchImpl), { draws, metadata: null });
});

test("preserva os sorteios quando os metadados contem JSON invalido", async () => {
  const draws = [{ draw: 3068 }];
  const fetchImpl = async (url) => {
    if (url.endsWith("sorteios.json")) return jsonResponse(draws);
    return {
      ok: true,
      status: 200,
      async json() {
        throw new SyntaxError("JSON invalido");
      },
    };
  };

  assert.deepEqual(await loadDrawData("/", fetchImpl), { draws, metadata: null });
});

test("rejeita quando a requisicao dos sorteios falha", async () => {
  const fetchImpl = async (url) => {
    if (url.endsWith("sorteios.json")) throw new Error("rede indisponivel");
    return jsonResponse({ updatedAt: "2026-10-09T00:15:00.000Z" });
  };

  await assert.rejects(
    loadDrawData("/", fetchImpl),
    /Nao foi possivel carregar os sorteios: rede indisponivel/,
  );
});

test("rejeita quando os sorteios respondem com erro HTTP", async () => {
  const fetchImpl = async (url) =>
    url.endsWith("sorteios.json")
      ? jsonResponse(null, { ok: false, status: 503 })
      : jsonResponse({ updatedAt: "2026-10-09T00:15:00.000Z" });

  await assert.rejects(
    loadDrawData("/", fetchImpl),
    /Nao foi possivel carregar os sorteios: HTTP 503/,
  );
});
