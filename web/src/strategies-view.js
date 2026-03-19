const TOP_VALUES = new Set([10, 25, 50, 100, -1]);

function toPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export function normalizeStrategiesOptions(input = {}) {
  const parsedTop = Number(input.top);
  const top = TOP_VALUES.has(parsedTop) ? parsedTop : 10;
  const strategyFilter = String(input.strategyFilter ?? "")
    .trim()
    .replaceAll(" ", "");

  return { top, strategyFilter };
}

export function buildStrategiesTableRows(ranking) {
  return ranking.map((entry, index) => {
    const drawsText = entry.draws.join(", ");
    const shortDraws = entry.draws.length > 12
      ? `${entry.draws.slice(0, 12).join(", ")} ... (+${entry.draws.length - 12})`
      : drawsText;

    return `
      <tr class="odd:bg-white even:bg-slate-50/65 transition">
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm font-semibold">${index + 1}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-sm font-medium">${entry.strategyKey}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${entry.wins}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${toPercentage(entry.winRate)}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${entry.lastWinDraw}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-sm" title="${drawsText}">${shortDraws}</td>
      </tr>
    `;
  });
}
