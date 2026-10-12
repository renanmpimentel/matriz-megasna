const percentage = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function buildDigitsSummary(result, type) {
  return `${result.totalTypeDraws.toLocaleString("pt-BR")} sorteios do tipo ${type} · ${result.totalGroups.toLocaleString("pt-BR")} conjuntos encontrados · ${result.matchedGroups} ${result.matchedGroups === 1 ? "resultado" : "resultados"} nesta busca.`;
}

export function buildDigitsTableRows(entries) {
  return entries.map(entry => `
    <tr class="odd:bg-white even:bg-slate-50 border-b border-slate-200 align-top">
      <th scope="row" class="px-3 py-3 text-left font-semibold tabular-nums">${entry.label}</th>
      <td class="px-3 py-3 text-center tabular-nums">${entry.count.toLocaleString("pt-BR")}</td>
      <td class="px-3 py-3 text-center tabular-nums">${percentage.format(entry.frequency)}</td>
      <td class="px-3 py-3 text-center tabular-nums">${entry.lastDraw}</td>
      <td class="px-3 py-2">
        <details>
          <summary class="cursor-pointer rounded px-2 py-2 font-medium text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700">Ver concursos<span class="sr-only"> do conjunto ${entry.label}</span></summary>
          <p class="max-w-sm px-2 pb-2 leading-relaxed tabular-nums">${entry.draws.join(", ")}</p>
        </details>
      </td>
    </tr>`).join("");
}
