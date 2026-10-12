import { normalizeDigitsSearch, selectDigitsDraws } from "./digits-core.js";
import { buildMatrix } from "./matrix-core.js";

export function getGeneratorContext(rows, input) {
  const search = normalizeDigitsSearch(input, "6x6");
  const empty = { key: search.key, error: search.error, minSum: null, maxSum: null, historyCount: 0, historyDraws: [] };
  if (search.error) return empty;
  if (!search.key) return { ...empty, error: "Informe seis dígitos diferentes para gerar matrizes 6x6." };
  const historyDraws = selectDigitsDraws(rows, { type: "6x6", key: search.key });
  if (!historyDraws.length) return { ...empty, error: "Este conjunto não tem sorteios no histórico. Não há intervalo de referência para gerar matrizes." };
  const sums = historyDraws.map(draw => draw.numbers.reduce((sum, number) => sum + Number(number), 0));
  return { key: search.key, error: "", minSum: Math.min(...sums), maxSum: Math.max(...sums), historyCount: historyDraws.length, historyDraws };
}

export function validateGeneratorQuantity(value) {
  const quantity = typeof value === "number" || (typeof value === "string" && value.trim()) ? Number(value) : NaN;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return { quantity: null, error: "Informe uma quantidade inteira de 1 a 100." };
  }
  return { quantity, error: "" };
}

export function validateGeneratorRange(minValue, maxValue) {
  const parse = value => typeof value === "number" || (typeof value === "string" && value.trim()) ? Number(value) : NaN;
  const minSum = parse(minValue);
  const maxSum = parse(maxValue);
  if (!Number.isInteger(minSum) || !Number.isInteger(maxSum) || minSum < 21 || maxSum > 345 || minSum > maxSum) {
    return { minSum: null, maxSum: null, error: "Informe somas inteiras de 21 a 345, com a menor soma igual ou inferior à maior." };
  }
  return { minSum, maxSum, error: "" };
}

export function getFrequentSums(historyDraws) {
  const counts = new Map();
  let highest = 0;
  for (const draw of historyDraws) {
    const sum = draw.numbers.reduce((total, number) => total + Number(number), 0);
    const count = (counts.get(sum) ?? 0) + 1;
    counts.set(sum, count);
    highest = Math.max(highest, count);
  }
  return [...counts].filter(([, count]) => count === highest)
    .sort(([a], [b]) => a - b).map(([sum, count]) => ({ sum, count }));
}

export function generateGames({ key, minSum, maxSum, quantity, historyDraws = [] }, random = Math.random) {
  const search = normalizeDigitsSearch(key, "6x6");
  if (search.error || !search.key) throw new TypeError("Informe seis dígitos diferentes.");
  const count = validateGeneratorQuantity(quantity);
  if (count.error) throw new RangeError(count.error);
  if (!Number.isInteger(minSum) || !Number.isInteger(maxSum) || minSum < 0 || maxSum < minSum) {
    throw new RangeError("O intervalo de soma deve ter limites inteiros, não negativos e em ordem crescente.");
  }

  const candidates = [];
  for (let number = 1; number <= 60; number++) {
    const digits = String(number).padStart(2, "0");
    const first = search.key.indexOf(digits[0]);
    const second = search.key.indexOf(digits[1]);
    if (first >= 0 && second >= 0) candidates.push({ number, mask: (1 << first) | (1 << second) });
  }

  const selected = [];
  const current = [];
  let totalValid = 0;
  // Enumerate once; reservoir sampling keeps only the requested batch in memory.
  function visit(start, sum, mask) {
    const remaining = 6 - current.length;
    if (!remaining) {
      if (mask !== 63 || sum < minSum || sum > maxSum) return;
      totalValid++;
      if (selected.length < count.quantity) selected.push({ numbers: [...current], sum });
      else {
        const index = Math.floor(random() * totalValid);
        if (index < count.quantity) selected[index] = { numbers: [...current], sum };
      }
      return;
    }
    if (candidates.length - start < remaining) return;
    let smallest = sum;
    let largest = sum;
    for (let offset = 0; offset < remaining; offset++) {
      smallest += candidates[start + offset].number;
      largest += candidates[candidates.length - 1 - offset].number;
    }
    if (smallest > maxSum || largest < minSum) return;
    for (let index = start; index <= candidates.length - remaining; index++) {
      const candidate = candidates[index];
      if (sum + candidate.number > maxSum) break;
      current.push(candidate.number);
      visit(index + 1, sum + candidate.number, mask | candidate.mask);
      current.pop();
    }
  }
  visit(0, 0, 0);

  const history = new Map();
  for (const draw of historyDraws) {
    const numbersKey = draw.numbers.map(Number).sort((a, b) => a - b).join(",");
    if (!history.has(numbersKey)) history.set(numbersKey, []);
    history.get(numbersKey).push(Number(draw.sorteioValue));
  }
  for (const contests of history.values()) contests.sort((a, b) => a - b);
  const games = selected.map(game => ({ ...game, matriz: buildMatrix(game.numbers), contests: history.get(game.numbers.join(",")) ?? [] }));
  games.sort((a, b) => a.sum - b.sum || a.numbers.reduce((order, number, index) => order || number - b.numbers[index], 0));
  return { games, totalValid };
}
