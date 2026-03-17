const DEFAULT_OPTIONS = {
  n: 6,
  top: 10
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeWinnersOptions(input = {}) {
  return {
    n: clamp(Math.trunc(toNumberOrFallback(input.n, DEFAULT_OPTIONS.n)), 2, 9),
    top: clamp(Math.trunc(toNumberOrFallback(input.top, DEFAULT_OPTIONS.top)), 1, 100)
  };
}

export function buildWinnersTableRows(ranking, top) {
  return ranking.slice(0, top);
}
