import assert from "node:assert/strict";
import test from "node:test";

import { getDrawsDataUrl } from "./data-url.js";

test("usa base root local", () => {
  assert.equal(getDrawsDataUrl("/"), "/data/sorteios.json");
});

test("usa base do GitHub Pages", () => {
  assert.equal(getDrawsDataUrl("/matriz-megasna/"), "/matriz-megasna/data/sorteios.json");
});

test("normaliza barra final da base", () => {
  assert.equal(getDrawsDataUrl("/matriz-megasna"), "/matriz-megasna/data/sorteios.json");
});
