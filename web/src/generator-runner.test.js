import assert from "node:assert/strict";
import test from "node:test";
import { createGeneratorRunner } from "./generator-runner.js";

function setup() {
  const workers = [];
  const events = [];
  const runner = createGeneratorRunner({
    createWorker: () => {
      const worker = { terminate() { this.terminated = true; }, postMessage(payload) { this.payload = payload; } };
      workers.push(worker);
      return worker;
    },
    onStart: () => events.push("start"), onResult: value => events.push(value),
    onCancel: () => events.push("cancel"), onError: () => events.push("error")
  });
  return { workers, events, runner };
}

test("runner envia dados ao worker, entrega resultado uma vez e termina execução", () => {
  const { runner, workers, events } = setup();
  const payload = { key: "012345", quantity: 10 };
  const result = { games: [], totalValid: 0 };
  runner.start(payload);
  assert.deepEqual(workers[0].payload, payload);
  workers[0].onmessage({ data: { type: "result", result } });
  workers[0].onmessage({ data: { type: "result", result } });
  assert.deepEqual(events, ["start", result]);
  assert.equal(workers[0].terminated, true);
  runner.cancel();
  assert.deepEqual(events, ["start", result]);
});

test("cancelar e reiniciar ignora respostas e erros antigos", () => {
  const { runner, workers, events } = setup();
  runner.start({});
  const first = workers[0];
  runner.cancel();
  assert.equal(first.terminated, true);
  runner.start({});
  first.onmessage({ data: { type: "result", result: "stale" } });
  first.onerror({ preventDefault() {} });
  workers[1].onmessage({ data: { type: "result", result: "fresh" } });
  assert.deepEqual(events, ["start", "cancel", "start", "fresh"]);
});

test("nova geração termina worker anterior mesmo sem cancelamento explícito", () => {
  const { runner, workers, events } = setup();
  runner.start({});
  runner.start({});
  assert.equal(workers[0].terminated, true);
  workers[0].onmessage({ data: { type: "result", result: "stale" } });
  workers[1].onmessage({ data: { type: "error", message: "erro" } });
  assert.equal(workers[1].terminated, true);
  assert.deepEqual(events, ["start", "start", "error"]);
});

test("falhas de criação, envio e execução não deixam runner ocupado", () => {
  for (const phase of ["create", "send", "runtime"]) {
    let errors = 0;
    const worker = { terminate() { this.terminated = true; }, postMessage() { if (phase === "send") throw Error("send"); } };
    const runner = createGeneratorRunner({
      createWorker() { if (phase === "create") throw Error("create"); return worker; },
      onStart() {}, onResult() {}, onCancel() {}, onError() { errors++; }
    });
    runner.start({});
    if (phase === "runtime") worker.onerror({ preventDefault() {} });
    assert.equal(errors, 1, phase);
    if (phase !== "create") assert.equal(worker.terminated, true);
    runner.cancel();
  }
});
