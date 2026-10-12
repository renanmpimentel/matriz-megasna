function toDrawValue(row, fallback) {
  const value = Number(row.sorteioValue ?? row.sorteio ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

export function toStrategyKey(row) {
  if (!row?.matriz || row.matriz.length !== 6) return "";
  return row.matriz.map((value) => String(value)).join("-");
}

export function buildTypeFrequency(rows) {
  const totals = new Map();
  for (const row of rows) {
    totals.set(row.type, (totals.get(row.type) ?? 0) + 1);
  }
  return {
    totalDraws: rows.length,
    entries: [...totals].sort(([a], [b]) => a.localeCompare(b, "pt-BR", { numeric: true })).map(([type, count]) => ({
      type, count, frequency: rows.length ? count / rows.length : 0
    }))
  };
}

export function buildTypeCadence(rows) {
  const totalDraws = rows.length;
  if (!totalDraws) return { status: "empty", totalDraws, entries: [] };
  const sorted = [...rows].sort((a, b) => a.sorteioValue - b.sorteioValue);
  // Esta análise usa o histórico completo: concursos únicos, de 1 até o último.
  if (sorted.some((row, index) => !Number.isSafeInteger(row.sorteioValue) || row.sorteioValue !== index + 1)) {
    return { status: "invalid", totalDraws, entries: [] };
  }
  const byType = new Map();
  for (const row of sorted) {
    if (!byType.has(row.type)) byType.set(row.type, []);
    byType.get(row.type).push(row.sorteioValue);
  }
  const entries = [...byType]
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map(([type, draws]) => {
      const gaps = draws.slice(1).map((draw, index) => draw - draws[index]);
      const intervalCount = gaps.length;
      const maxGap = intervalCount ? Math.max(...gaps) : null;
      const counts = new Map();
      for (const gap of gaps) counts.set(gap, (counts.get(gap) ?? 0) + 1);
      return {
        type, count: draws.length, oneEvery: totalDraws / draws.length,
        intervalCount,
        meanGap: intervalCount ? gaps.reduce((sum, gap) => sum + gap, 0) / intervalCount : null,
        maxGap, lastDraw: draws.at(-1), sinceLast: sorted.at(-1).sorteioValue - draws.at(-1),
        distribution: Array.from({ length: maxGap ?? 0 }, (_, index) => ({
          gap: index + 1, count: counts.get(index + 1) ?? 0,
          frequency: (counts.get(index + 1) ?? 0) / intervalCount
        }))
      };
    });
  return { status: "ready", totalDraws, entries };
}

export function buildStrategiesRanking(rows, options = {}) {
  const strategyFilter = (options.strategyFilter ?? "").trim();
  const typeFilter = (options.typeFilter ?? "").trim();
  const typeTotals = new Map();
  for (const row of rows) {
    const type = row.type ?? "";
    typeTotals.set(type, (typeTotals.get(type) ?? 0) + 1);
  }
  const grouped = new Map();

  rows.forEach((row, index) => {
    const strategyKey = toStrategyKey(row);
    if (!strategyKey) return;
    const type = row.type ?? "";
    if (typeFilter && type !== typeFilter) return;
    if (strategyFilter && strategyKey !== strategyFilter) return;

    const draw = toDrawValue(row, index + 1);
    const groupKey = JSON.stringify([type, strategyKey]);
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        type,
        strategyKey,
        wins: 0,
        draws: [],
        lastWinDraw: 0
      });
    }

    const entry = grouped.get(groupKey);
    entry.wins += 1;
    entry.draws.push(draw);
    entry.lastWinDraw = Math.max(entry.lastWinDraw, draw);
  });

  const totalDraws = rows.length;
  const ranking = [...grouped.values()]
    .map((entry) => {
      const sortedDraws = [...entry.draws].sort((a, b) => a - b);
      return {
        type: entry.type,
        strategyKey: entry.strategyKey,
        wins: entry.wins,
        winRate: totalDraws > 0 ? entry.wins / totalDraws : 0,
        totalTypeDraws: typeTotals.get(entry.type),
        typeRate: entry.wins / typeTotals.get(entry.type),
        draws: sortedDraws,
        lastWinDraw: entry.lastWinDraw
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.lastWinDraw !== a.lastWinDraw) return b.lastWinDraw - a.lastWinDraw;
      return a.strategyKey.localeCompare(b.strategyKey) || a.type.localeCompare(b.type);
    });

  const summary = {
    totalDraws,
    selectedTypeDraws: typeFilter ? (typeTotals.get(typeFilter) ?? 0) : totalDraws,
    totalStrategies: ranking.length
  };
  if (typeof options.top === "number" && options.top > 0) {
    return { ...summary, ranking: ranking.slice(0, options.top) };
  }

  return { ...summary, ranking };
}
