const TOP_VALUES = new Set([10, 25, 50, 100, -1]);

function toPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export function buildTypeFrequencyChart({ totalDraws, entries }) {
  if (!totalDraws) return '<p class="mt-3 text-base text-slate-700">Nenhum sorteio disponível para comparar os tipos.</p>';
  const percentage = new Intl.NumberFormat("pt-BR", {
    style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  return `
    <p class="mt-1 text-base text-slate-700">Histórico completo: ${totalDraws.toLocaleString("pt-BR")} sorteios. Cada ocorrência conta, mesmo quando a matriz se repete.</p>
    <ul class="my-5 space-y-5" aria-label="Comparação da frequência total">
      ${entries.map(({ type, count, frequency }) => `
        <li>
          <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-base">
            <span class="text-lg font-semibold text-slate-900">${type}</span>
            <span class="tabular-nums text-slate-800"><strong>${count.toLocaleString("pt-BR")} sorteios</strong> · ${percentage.format(frequency)} do total</span>
          </div>
          <div class="h-7 overflow-hidden rounded bg-slate-100" aria-hidden="true">
            <div class="h-full rounded ${type === "7x7" ? "bg-emerald-700" : type === "8x8" ? "bg-blue-700" : "bg-slate-600"}" style="width: ${frequency * 100}%"></div>
          </div>
        </li>
      `).join("")}
    </ul>
    <div class="flex justify-between text-sm tabular-nums text-slate-600" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
    <p class="mt-3 text-sm text-slate-700">Todos os tipos encontrados no histórico, com percentuais sobre o total de sorteios. Os filtros abaixo não alteram este gráfico. Frequência histórica não prevê resultados futuros.</p>
  `;
}

const cadenceNumber = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const cadencePercent = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function buildCadenceOverview(result) {
  if (result.status === "empty") return '<p class="mt-3">Nenhum sorteio disponível para analisar a cadência.</p>';
  if (result.status === "invalid") return '<p class="mt-3 text-amber-900" role="status">Histórico inconsistente: há concursos ausentes, duplicados ou inválidos. A cadência ficará indisponível até a base ser corrigida.</p>';
  return `
    <p class="mt-2 text-base text-slate-700">Base: ${result.totalDraws.toLocaleString("pt-BR")} concursos. A média abaixo divide o total de concursos pelas ocorrências de cada tipo.</p>
    <div class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-left text-base" aria-label="Cadência média por tipo">
        <thead class="bg-emerald-800 text-white"><tr><th scope="col" class="px-3 py-3">Tipo</th><th scope="col" class="px-3 py-3">Ocorrências</th><th scope="col" class="px-3 py-3">Frequência média no histórico</th></tr></thead>
        <tbody>${result.entries.map(entry => `<tr class="odd:bg-white even:bg-slate-50 border-b border-slate-200">
          <th scope="row" class="px-3 py-2 font-semibold">${entry.type}</th>
          <td class="px-3 py-2 tabular-nums">${entry.count.toLocaleString("pt-BR")}</td>
          <td class="px-3 py-2 tabular-nums">1 a cada ${cadenceNumber.format(entry.oneEvery)} concursos</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>`;
}

export function buildCadenceDetails(entry) {
  if (!entry) return "";
  const current = `<p class="mt-2 text-base text-slate-700">Última ocorrência: concurso <strong>${entry.lastDraw}</strong>. ${entry.sinceLast === 0 ? "Apareceu no concurso mais recente." : `Desde então: <strong>${entry.sinceLast} ${entry.sinceLast === 1 ? "concurso" : "concursos"} sem aparecer</strong>.`}</p>`;
  if (!entry.intervalCount) return `${current}<p class="mt-3">Ainda não há intervalo completo para este tipo: é preciso ter pelo menos duas ocorrências.</p>`;
  return `
    <h3 class="mt-4 text-lg font-semibold text-slate-900">Intervalos entre ocorrências de ${entry.type}</h3>
    <p class="mt-2 text-base text-slate-700">Intervalo médio observado: <strong>${cadenceNumber.format(entry.meanGap)} concursos</strong> · Maior intervalo: <strong>${entry.maxGap} ${entry.maxGap === 1 ? "concurso" : "concursos"}</strong>.</p>
    ${current}
    <p class="mt-3 text-base text-slate-700">Distribuição de ${entry.intervalCount.toLocaleString("pt-BR")} intervalos completos. Percentuais calculados sobre esses intervalos, não sobre o total de concursos.</p>
    <p class="mt-2 text-sm text-slate-700">Do concurso 100 ao 104, o intervalo é 4. Ocorrências consecutivas têm intervalo 1. A espera atual não entra neste cálculo.</p>
    <div class="mt-4 max-h-96 overflow-y-auto rounded border border-slate-200 p-3 focus-visible:outline-2 focus-visible:outline-emerald-700" tabindex="0" role="region" aria-label="Distribuição dos intervalos de ${entry.type}; role para ver todos">
      <ul class="space-y-4">${entry.distribution.map(item => `
        <li>
          <div class="mb-1 flex flex-wrap justify-between gap-x-3 text-base">
            <span>Após ${item.gap} ${item.gap === 1 ? "concurso" : "concursos"}</span>
            <span class="tabular-nums">${item.count} ${item.count === 1 ? "vez" : "vezes"} · ${cadencePercent.format(item.frequency)}</span>
          </div>
          <div class="h-4 rounded bg-slate-100" aria-hidden="true"><div class="h-full rounded bg-emerald-700" style="width: ${item.frequency * 100}%"></div></div>
        </li>`).join("")}</ul>
    </div>
    <div class="mt-1 flex justify-between text-sm text-slate-600" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
    <p class="mt-1 text-sm text-slate-700">Role dentro do gráfico para consultar todos os intervalos, inclusive os que não ocorreram.</p>`;
}

export function normalizeStrategiesOptions(input = {}) {
  const parsedTop = Number(input.top);
  const top = TOP_VALUES.has(parsedTop) ? parsedTop : 10;
  const strategyFilter = String(input.strategyFilter ?? "")
    .trim()
    .replaceAll(" ", "");

  const typeFilter = String(input.typeFilter ?? "").trim();
  return { top, strategyFilter, typeFilter };
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
        <td class="border-b border-slate-200 bg-emerald-50 px-3 py-2 text-center text-sm">${entry.type || "—"}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${entry.wins}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${entry.totalTypeDraws ?? "—"}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${entry.typeRate == null ? "—" : toPercentage(entry.typeRate)}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${toPercentage(entry.winRate)}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm">${entry.lastWinDraw}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-sm" title="${drawsText}">${shortDraws}</td>
      </tr>
    `;
  });
}
