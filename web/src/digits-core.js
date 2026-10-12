export function toDigitsKey(row) {
  return [...new Set(row.numbers.map(number => String(number).padStart(2, "0")).join(""))].sort().join("");
}

export function normalizeDigitsSearch(input, type) {
  const text = String(input ?? "").replace(/\s/g, "");
  if (!text) return { key: "", error: "" };
  if (!/^\d+$/.test(text)) return { key: "", error: "Use apenas dígitos de 0 a 9, sem letras ou sinais." };
  if (new Set(text).size !== text.length) return { key: "", error: "Informe cada dígito apenas uma vez." };
  const size = Number(type.split("x")[0]);
  if (text.length !== size) return { key: "", error: `Para o tipo ${type}, informe exatamente ${size} dígitos diferentes.` };
  return { key: [...text].sort().join(""), error: "" };
}

export function selectDigitsDraws(rows, { type, key }) {
  const search = normalizeDigitsSearch(key, type);
  if (search.error || !search.key) return [];
  return rows.filter(row => row.type === type && toDigitsKey(row) === search.key)
    .sort((a, b) => a.sorteioValue - b.sorteioValue);
}

export function buildSumFrequency(draws, order = "sum-asc") {
  const counts = new Map();
  for (const draw of draws) counts.set(draw.sum, (counts.get(draw.sum) ?? 0) + 1);
  const entries = [...counts].map(([sum, count]) => ({ sum, count }));
  return entries.sort((a, b) => {
    if (order === "count-desc") return b.count - a.count || a.sum - b.sum;
    if (order === "count-asc") return a.count - b.count || a.sum - b.sum;
    if (order === "sum-desc") return b.sum - a.sum;
    return a.sum - b.sum;
  });
}

export function buildDigitsRanking(rows, { type, query = "", page = 1 }) {
  const selected = rows.filter(row => row.type === type);
  const groups = new Map();
  for (const row of selected) {
    const key = toDigitsKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row.sorteioValue);
  }
  const { key: searchKey, error } = normalizeDigitsSearch(query, type);
  const ranking = [...groups].map(([key, draws]) => {
    const sortedDraws = [...draws].sort((a, b) => a - b);
    return {
      key, label: key.startsWith("0") ? key.slice(1) + "0" : key,
      count: draws.length, frequency: draws.length / selected.length,
      lastDraw: sortedDraws.at(-1), draws: sortedDraws
    };
  }).sort((a, b) => b.count - a.count || b.lastDraw - a.lastDraw || a.key.localeCompare(b.key));
  const matches = error ? [] : ranking.filter(entry => !searchKey || entry.key === searchKey);
  const totalPages = Math.max(1, Math.ceil(matches.length / 25));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isInteger(page) ? page : 1));
  return {
    totalTypeDraws: selected.length, totalGroups: ranking.length, matchedGroups: matches.length,
    page: currentPage, totalPages, error,
    entries: matches.slice((currentPage - 1) * 25, currentPage * 25)
  };
}
