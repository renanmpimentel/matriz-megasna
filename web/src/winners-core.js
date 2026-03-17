const DEFAULT_FREQ_WEIGHT = 0.8;
const DEFAULT_RECENCY_WEIGHT = 0.2;

function roundMetric(value) {
  return Number(value.toFixed(6));
}

export function toPositionPair(number) {
  const value = String(number).padStart(2, "0");
  const [row, col] = value.split("").map((digit) => Number(digit));
  return { row, col, value };
}

export function isPositionValid(position, n) {
  return position.row >= 1 && position.row <= n && position.col >= 1 && position.col <= n;
}

function toNumericDrawOrder(draw, fallbackOrder) {
  const parsed = Number(draw?.draw);
  return Number.isFinite(parsed) ? parsed : fallbackOrder + 1;
}

function toValidSignature(numbers, n) {
  const positions = numbers.map((number) => toPositionPair(number));
  const isValid = positions.every((position) => isPositionValid(position, n));
  if (!isValid) return null;
  return positions.map((position) => position.value).join("-");
}

export function buildWinnersScoreRanking(draws, options = {}) {
  const n = Number(options.n ?? 6);
  const freqWeight = Number(options.freqWeight ?? DEFAULT_FREQ_WEIGHT);
  const recencyWeight = Number(options.recencyWeight ?? DEFAULT_RECENCY_WEIGHT);
  const normalizedDraws = [...draws]
    .map((draw, index) => ({ ...draw, __order: toNumericDrawOrder(draw, index) }))
    .sort((left, right) => left.__order - right.__order);

  const signatures = new Map();
  let validDrawsCount = 0;
  let discardedDrawsCount = 0;

  normalizedDraws.forEach((draw) => {
    const signature = toValidSignature(draw.numbers ?? [], n);
    if (!signature) {
      discardedDrawsCount += 1;
      return;
    }

    const seen = signatures.get(signature) ?? { frequencyAbsolute: 0, lastSeenOrder: -1 };
    signatures.set(signature, {
      frequencyAbsolute: seen.frequencyAbsolute + 1,
      lastSeenOrder: validDrawsCount
    });
    validDrawsCount += 1;
  });

  if (signatures.size === 0) {
    return {
      ranking: [],
      validDrawsCount,
      discardedDrawsCount
    };
  }

  const maxFrequency = Math.max(...[...signatures.values()].map((item) => item.frequencyAbsolute));
  const maxRecencyIndex = Math.max(validDrawsCount - 1, 0);

  const ranking = [...signatures.entries()]
    .map(([signature, item]) => {
      const frequencyNormalized = item.frequencyAbsolute / maxFrequency;
      const recencyNormalized = maxRecencyIndex === 0 ? 1 : item.lastSeenOrder / maxRecencyIndex;
      const finalScore = freqWeight * frequencyNormalized + recencyWeight * recencyNormalized;

      return {
        signature,
        frequencyAbsolute: item.frequencyAbsolute,
        frequencyNormalized: roundMetric(frequencyNormalized),
        recencyNormalized: roundMetric(recencyNormalized),
        finalScore: roundMetric(finalScore)
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
