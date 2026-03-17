const DEFAULT_OPTIONS = {
  n: 6,
  freqWeight: 0.8,
  recencyWeight: 0.2,
  top: 10
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeChampionsOptions(input = {}) {
  return {
    n: clamp(Math.trunc(toNumberOrFallback(input.n, DEFAULT_OPTIONS.n)), 2, 9),
    freqWeight: clamp(toNumberOrFallback(input.freqWeight, DEFAULT_OPTIONS.freqWeight), 0, 1),
    recencyWeight: clamp(toNumberOrFallback(input.recencyWeight, DEFAULT_OPTIONS.recencyWeight), 0, 1),
    top: clamp(Math.trunc(toNumberOrFallback(input.top, DEFAULT_OPTIONS.top)), 1, 100)
  };
}

export function buildChampionsTableRows(ranking, top) {
  return ranking.slice(0, top);
}
