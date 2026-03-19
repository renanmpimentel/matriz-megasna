function toDrawValue(row, fallback) {
  const value = Number(row.sorteioValue ?? row.sorteio ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

export function toStrategyKey(row) {
  if (!row?.matriz || row.matriz.length !== 6) return "";
  return row.matriz.map((value) => String(value)).join("-");
}

export function buildStrategiesRanking(rows, options = {}) {
  const strategyFilter = (options.strategyFilter ?? "").trim();
  const grouped = new Map();

  rows.forEach((row, index) => {
    const strategyKey = toStrategyKey(row);
    if (!strategyKey) return;
    if (strategyFilter && strategyKey !== strategyFilter) return;

    const draw = toDrawValue(row, index + 1);
    if (!grouped.has(strategyKey)) {
      grouped.set(strategyKey, {
        strategyKey,
        wins: 0,
        draws: [],
        lastWinDraw: 0
      });
    }

    const entry = grouped.get(strategyKey);
    entry.wins += 1;
    entry.draws.push(draw);
    entry.lastWinDraw = Math.max(entry.lastWinDraw, draw);
  });

  const totalDraws = rows.length;
  const ranking = [...grouped.values()]
    .map((entry) => {
      const sortedDraws = [...entry.draws].sort((a, b) => a - b);
      return {
        strategyKey: entry.strategyKey,
        wins: entry.wins,
        winRate: totalDraws > 0 ? entry.wins / totalDraws : 0,
        draws: sortedDraws,
        lastWinDraw: entry.lastWinDraw
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.lastWinDraw !== a.lastWinDraw) return b.lastWinDraw - a.lastWinDraw;
      return a.strategyKey.localeCompare(b.strategyKey);
    });

  if (typeof options.top === "number" && options.top > 0) {
    return { totalDraws, ranking: ranking.slice(0, options.top) };
  }

  return { totalDraws, ranking };
}
