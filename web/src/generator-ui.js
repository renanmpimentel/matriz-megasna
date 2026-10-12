import { getGeneratorContext, validateGeneratorQuantity, validateGeneratorRange, getFrequentSums } from "./generator-core.js";
import { createGeneratorRunner } from "./generator-runner.js";
import { buildGeneratorRows, buildGeneratorResultSummary, buildFrequentSumOptions } from "./generator-view.js";

export function initGenerator(root, rows) {
  const find = selector => root.querySelector(selector);
  const digits = find("#generator-digits");
  const quantity = find("#generator-quantity");
  const minimum = find("#generator-min-sum");
  const maximum = find("#generator-max-sum");
  const frequent = find("#generator-frequent-sum");
  const restore = find("#generator-restore-range");
  const calculate = find("#generator-count");
  const submit = find("#generator-submit");
  const cancel = find("#generator-cancel");
  const status = find("#generator-status");
  const total = find("#generator-total");
  const results = find("#generator-results");
  const body = find("#generator-table-body");
  let context;
  let amount;
  let range;
  let busy = false;
  let requested = 0;
  let action = "generate";

  function setBusy(value) {
    busy = value;
    const invalid = Boolean(context.error || range.error);
    submit.disabled = busy || invalid || Boolean(amount.error);
    calculate.disabled = busy || invalid;
    submit.textContent = busy && action === "generate" ? "Gerando…" : "Gerar matrizes";
    calculate.textContent = busy && action === "count" ? "Calculando…" : "Calcular total";
    cancel.hidden = !busy;
    results.setAttribute("aria-busy", String(busy));
  }

  function clearResults() {
    body.innerHTML = "";
    results.hidden = true;
    status.classList.remove("text-red-800");
    total.textContent = "Total de combinações válidas: ainda não calculado.";
  }

  const runner = createGeneratorRunner({
    createWorker: () => new Worker(new URL("./generator-worker.js", import.meta.url), { type: "module" }),
    onStart() {
      clearResults();
      setBusy(true);
      status.textContent = action === "count" ? "Calculando todas as combinações válidas…" : "Gerando… Buscando combinações dentro do intervalo escolhido.";
    },
    onResult(result) {
      setBusy(false);
      total.textContent = `Total de combinações válidas: ${result.totalValid.toLocaleString("pt-BR")}.`;
      if (action === "count") {
        status.textContent = result.totalValid
          ? "Cálculo concluído. Escolha a quantidade e clique em Gerar matrizes para obter um lote."
          : "Nenhuma combinação atende ao intervalo escolhido. Ajuste as somas ou restaure o intervalo histórico.";
        return;
      }
      body.innerHTML = buildGeneratorRows(result.games);
      results.hidden = result.games.length === 0;
      status.textContent = buildGeneratorResultSummary(result, requested);
    },
    onCancel() {
      setBusy(false);
      status.textContent = "Operação cancelada. Você pode calcular ou gerar novamente.";
    },
    onError() {
      setBusy(false);
      clearResults();
      status.classList.add("text-red-800");
      status.textContent = "Não foi possível concluir o cálculo. Tente novamente.";
    }
  });

  function updateInputs({ resetRange = false } = {}) {
    runner.cancel();
    clearResults();
    context = getGeneratorContext(rows, digits.value);
    amount = validateGeneratorQuantity(quantity.value);
    if (resetRange) {
      minimum.value = context.minSum ?? "";
      maximum.value = context.maxSum ?? "";
      frequent.innerHTML = buildFrequentSumOptions(getFrequentSums(context.historyDraws));
    }
    range = validateGeneratorRange(minimum.value, maximum.value);
    for (const input of [minimum, maximum, frequent, restore]) input.disabled = Boolean(context.error);
    const matchesFrequent = [...frequent.options].some(option => option.value === minimum.value);
    frequent.value = minimum.value === maximum.value && matchesFrequent ? minimum.value : "";
    find("#generator-digits-error").textContent = context.error;
    find("#generator-quantity-error").textContent = amount.error;
    find("#generator-range-error").textContent = context.error ? "" : range.error;
    digits.setAttribute("aria-invalid", String(Boolean(context.error)));
    quantity.setAttribute("aria-invalid", String(Boolean(amount.error)));
    for (const input of [minimum, maximum]) input.setAttribute("aria-invalid", String(!context.error && Boolean(range.error)));
    find("#generator-context").textContent = context.error
      ? "Intervalo indisponível para este conjunto."
      : `Menor soma: ${context.minSum} · Maior soma: ${context.maxSum} · ${context.historyCount} sorteios de referência.`;
    status.textContent = context.error || range.error
      ? "Corrija os campos acima para calcular ou gerar matrizes."
      : "Clique em Calcular total para consultar as possibilidades, ou em Gerar matrizes para obter um lote.";
    setBusy(false);
  }

  function start(nextAction) {
    if (busy) return;
    updateInputs();
    if (context.error || range.error || (nextAction === "generate" && amount.error)) {
      (context.error ? digits : range.error ? minimum : quantity).focus();
      return;
    }
    action = nextAction;
    requested = action === "count" ? 1 : amount.quantity;
    runner.start({ key: context.key, minSum: range.minSum, maxSum: range.maxSum, historyDraws: context.historyDraws, quantity: requested });
  }

  digits.addEventListener("input", () => updateInputs({ resetRange: true }));
  for (const input of [quantity, minimum, maximum]) input.addEventListener("input", () => updateInputs());
  frequent.addEventListener("change", () => {
    if (!frequent.value) return;
    minimum.value = maximum.value = frequent.value;
    updateInputs();
  });
  restore.addEventListener("click", () => updateInputs({ resetRange: true }));
  find("#generator-form").addEventListener("submit", event => { event.preventDefault(); start("generate"); });
  calculate.addEventListener("click", () => start("count"));
  cancel.addEventListener("click", () => {
    runner.cancel();
    (action === "count" ? calculate : submit).focus({ preventScroll: true });
  });
  updateInputs({ resetRange: true });
  return { cancel: () => runner.cancel() };
}
