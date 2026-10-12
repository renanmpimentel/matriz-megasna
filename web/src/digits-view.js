const percentage = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function buildDigitsSummary(result, type) {
  return `${result.totalTypeDraws.toLocaleString("pt-BR")} sorteios do tipo ${type} · ${result.totalGroups.toLocaleString("pt-BR")} conjuntos encontrados · ${result.matchedGroups} ${result.matchedGroups === 1 ? "resultado" : "resultados"} nesta busca.`;
}

export function buildDigitsTableRows(entries, { expandedKey = "", type = "", draws = [] } = {}) {
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
