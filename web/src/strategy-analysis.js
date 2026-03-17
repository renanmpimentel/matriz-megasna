import { isPositionValid, toPositionPair } from "./champions.js";

const DEFAULT_FREQ_WEIGHT = 0.8;
const DEFAULT_RECENCY_WEIGHT = 0.2;

function roundMetric(value) {
  return Number(value.toFixed(6));
}

function toNumericDrawOrder(draw, fallbackOrder) {
  const parsed = Number(draw?.draw);
  return Number.isFinite(parsed) ? parsed : fallbackOrder + 1;
}

function toStrategySignature(numbers, n) {
  const positions = numbers.map((number) => toPositionPair(number));
  const isValid = positions.every((position) => isPositionValid(position, n));
  if (!isValid) return null;
  return positions.map((position) => position.value).join("-");
}

function toDrawCode(value) {
  return String(value).padStart(6, "0");
}

function toWinLabels(signature, drawCode, gameNumber) {
  return {
    teamLabel: `${drawCode}/jogo ${gameNumber} da mega`,
    matrixLabel: `${signature}/jogo ${gameNumber} da mega sena`
  };
}

export function buildStrategyRanking(draws, options = {}) {
  const n = Number(options.n ?? 6);
  const freqWeight = Number(options.freqWeight ?? DEFAULT_FREQ_WEIGHT);
  const recencyWeight = Number(options.recencyWeight ?? DEFAULT_RECENCY_WEIGHT);

  const normalizedDraws = [...draws]
    .map((draw, index) => ({ ...draw, __order: toNumericDrawOrder(draw, index) }))
    .sort((left, right) => left.__order - right.__order);

  const strategies = new Map();
  let validDrawsCount = 0;
  let discardedDrawsCount = 0;

  normalizedDraws.forEach((draw) => {
    const signature = toStrategySignature(draw.numbers ?? [], n);
    if (!signature) {
      discardedDrawsCount += 1;
      return;
    }

    const gameNumber = validDrawsCount + 1;
    const drawCode = toDrawCode(draw.__order);
    const seen = strategies.get(signature) ?? { frequencyAbsolute: 0, lastSeenOrder: -1, wins: [] };

    strategies.set(signature, {
      frequencyAbsolute: seen.frequencyAbsolute + 1,
      lastSeenOrder: validDrawsCount,
      wins: [...seen.wins, toWinLabels(signature, drawCode, gameNumber)]
    });

    validDrawsCount += 1;
  });

  if (strategies.size === 0) {
    return {
      ranking: [],
      validDrawsCount,
      discardedDrawsCount
    };
  }

  const maxFrequency = Math.max(...[...strategies.values()].map((item) => item.frequencyAbsolute));
  const maxRecencyIndex = Math.max(validDrawsCount - 1, 0);

  const ranking = [...strategies.entries()]
    .map(([signature, item]) => {
      const frequencyNormalized = item.frequencyAbsolute / maxFrequency;
      const recencyNormalized = maxRecencyIndex === 0 ? 1 : item.lastSeenOrder / maxRecencyIndex;
      const finalScore = freqWeight * frequencyNormalized + recencyWeight * recencyNormalized;

      return {
        signature,
        frequencyAbsolute: item.frequencyAbsolute,
        frequencyNormalized: roundMetric(frequencyNormalized),
        recencyNormalized: roundMetric(recencyNormalized),
        finalScore: roundMetric(finalScore),
        winsCount: item.wins.length,
        wins: item.wins
      };
    })
    .sort((left, right) => {
      if (right.finalScore !== left.finalScore) return right.finalScore - left.finalScore;
      if (right.frequencyAbsolute !== left.frequencyAbsolute) return right.frequencyAbsolute - left.frequencyAbsolute;
      return left.signature.localeCompare(right.signature);
    });

  return {
    ranking,
    validDrawsCount,
    discardedDrawsCount
  };
}
