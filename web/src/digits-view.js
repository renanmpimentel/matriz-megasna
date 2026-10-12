import { buildSumFrequency } from "./digits-core.js";

const percentage = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function buildDigitsSummary(result, type) {
  return `${result.totalTypeDraws.toLocaleString("pt-BR")} sorteios do tipo ${type} · ${result.totalGroups.toLocaleString("pt-BR")} conjuntos encontrados · ${result.matchedGroups} ${result.matchedGroups === 1 ? "resultado" : "resultados"} nesta busca.`;
}

export function buildDigitsTableRows(entries, { expandedKey = "", type = "", draws = [], sumOrder = "count-desc" } = {}) {
  const sumOrders = [
    ["count-desc", "Mais ocorrências"], ["count-asc", "Menos ocorrências"],
    ["sum-desc", "Maior soma"], ["sum-asc", "Menor soma"]
  ];
  const selectedOrder = sumOrders.some(([value]) => value === sumOrder) ? sumOrder : "count-desc";
  const sumFrequency = buildSumFrequency(draws, selectedOrder);
  const maxCount = Math.max(0, ...sumFrequency.map(item => item.count));
  const sums = draws.map(row => row.sum);
  const sumRange = sums.length
    ? `<p data-digit-sums class="mb-3 text-base tabular-nums text-slate-800">Menor soma: <strong>${Math.min(...sums)}</strong> · Maior soma: <strong>${Math.max(...sums)}</strong></p>`
    : "";
  return entries.map((entry, index) => {
    const expanded = expandedKey === entry.key;
    return `
    <tr class="${index % 2 ? "bg-slate-50" : "bg-white"} border-b border-slate-200 align-top">
      <th scope="row" class="px-3 py-1 text-left font-semibold tabular-nums">
        <button id="digits-toggle-${entry.key}" type="button" data-digits-toggle="${entry.key}" aria-expanded="${expanded}" aria-controls="digits-details-${entry.key}" aria-label="Ver sorteios do conjunto ${entry.label}" class="min-h-11 rounded px-2 text-emerald-800 underline underline-offset-4 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700">${entry.label}</button>
      </th>
      <td class="px-3 py-3 text-center tabular-nums">${entry.count.toLocaleString("pt-BR")}</td>
      <td class="px-3 py-3 text-center tabular-nums">${percentage.format(entry.frequency)}</td>
      <td class="px-3 py-3 text-center tabular-nums">${entry.lastDraw}</td>
      <td class="px-3 py-1">
        <button id="digits-action-${entry.key}" type="button" data-digits-toggle="${entry.key}" aria-expanded="${expanded}" aria-controls="digits-details-${entry.key}" class="min-h-11 rounded px-2 font-medium text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700">${expanded ? "Recolher sorteios" : "Ver sorteios"}<span class="sr-only"> do conjunto ${entry.label}</span></button>
      </td>
    </tr>
    <tr id="digits-details-${entry.key}" ${expanded ? "" : "hidden"}>
      <td colspan="5" class="max-w-0 border-b border-slate-300 bg-slate-50 p-3 md:p-4">
        ${expanded ? `
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-lg font-semibold text-slate-900">Sorteios do conjunto ${entry.label} <span class="font-normal">· Tipo ${type} · ${entry.count} ocorrências</span></h3>
            <button id="digits-close-${entry.key}" type="button" data-digits-toggle="${entry.key}" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700">Recolher sorteios</button>
          </div>
          ${sumRange}
          ${sumFrequency.length ? `
            <section class="mb-6 w-full max-w-3xl" aria-label="Frequência das somas do conjunto ${entry.label}">
              <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h4 class="text-lg font-semibold text-slate-900">Frequência das somas</h4>
                  <p class="mt-1 text-base text-slate-700">${sumFrequency.length} somas diferentes em ${draws.length} sorteios.</p>
                </div>
                <div class="w-full sm:w-auto">
                  <label for="digits-sum-order" class="block text-base font-medium text-slate-800">Ordenar por</label>
                  <select id="digits-sum-order" class="mt-1 min-h-11 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700">
                    ${sumOrders.map(([value, label]) => `<option value="${value}"${value === selectedOrder ? " selected" : ""}>${label}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="max-h-96 w-full overflow-auto rounded border border-slate-300 focus-visible:outline-2 focus-visible:outline-emerald-700" tabindex="0" role="region" aria-label="Tabela de somas; role para ver todas">
                <table data-digit-sum-frequency class="w-full border-collapse bg-white text-lg tabular-nums text-slate-900" aria-label="Ocorrências por soma do conjunto ${entry.label}">
                  <thead class="sticky top-0 bg-emerald-800 text-white text-base"><tr><th scope="col" class="px-4 py-3 text-left">Soma</th><th scope="col" class="px-4 py-3 text-right">Ocorrências</th></tr></thead>
                  <tbody>${sumFrequency.map(item => `<tr data-sum-frequency="${item.sum}" class="odd:bg-white even:bg-slate-100 border-b border-slate-200 hover:bg-emerald-50"><th scope="row" class="px-4 py-3 text-left font-medium"><span class="inline-block min-w-12">${item.sum}</span>${item.count === maxCount && maxCount > 1 ? '<span class="ml-2 inline-block rounded bg-emerald-100 px-2 py-1 text-sm font-semibold text-emerald-900">Mais frequente</span>' : ""}</th><td class="px-4 py-3 text-right font-semibold">${item.count}</td></tr>`).join("")}</tbody>
                  <tfoot class="sticky bottom-0 bg-slate-200 font-semibold"><tr><th scope="row" class="px-4 py-3 text-left text-base">Total de sorteios</th><td class="px-4 py-3 text-right">${draws.length}</td></tr></tfoot>
                </table>
              </div>
              <p class="mt-3 text-base text-slate-700">Inclui somas que apareceram uma única vez. Role a tabela para ver todas.</p>
            </section>` : ""}
          <h4 class="mb-3 text-lg font-semibold text-slate-900">Matrizes e números por sorteio</h4>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1140px] border-collapse text-base tabular-nums" aria-label="Matrizes, números e soma por sorteio do conjunto ${entry.label}">
              <thead class="bg-emerald-800 text-white"><tr>
                <th scope="col" class="px-2 py-3">Concurso</th>
                ${Array.from({ length: 6 }, (_, i) => `<th scope="col" class="px-2 py-3">Matriz ${i + 1}</th>`).join("")}
                ${Array.from({ length: 6 }, (_, i) => `<th scope="col" class="px-2 py-3">Número ${i + 1}</th>`).join("")}
                <th scope="col" class="px-2 py-3">Soma</th>
              </tr></thead>
              <tbody>${draws.map(row => `<tr data-digit-draw="${row.sorteioValue}" class="odd:bg-white even:bg-slate-100 border-b border-slate-200 text-center">
                <th scope="row" class="px-2 py-3 font-semibold">${String(row.sorteioValue).padStart(3, "0")}</th>
                ${row.matriz.map(value => `<td class="px-2 py-3">${value}</td>`).join("")}
                ${row.numbers.map(value => `<td class="px-2 py-3">${String(value).padStart(2, "0")}</td>`).join("")}
                <td class="px-2 py-3 font-semibold">${row.sum}</td>
              </tr>`).join("")}</tbody>
            </table>
          </div>` : ""}
      </td>
    </tr>`;
  }).join("");
}
