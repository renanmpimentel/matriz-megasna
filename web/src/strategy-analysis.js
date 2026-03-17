import { isPositionValid, toPositionPair } from "./winners-core.js";

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
    const seen = strategies.get(signature) ?? { lastSeenOrder: -1, wins: [] };

    strategies.set(signature, {
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

  const ranking = [...strategies.entries()]
    .map(([signature, item]) => {
      return {
        signature,
        winsCount: item.wins.length,
        strategyLabel: item.wins[0]?.matrixLabel ?? signature,
        teams: item.wins.map((win) => win.teamLabel),
        otherWinningTeams: item.wins.slice(1).map((win) => win.teamLabel),
        lastSeenOrder: item.lastSeenOrder,
        wins: item.wins
      };
    })
    .sort((left, right) => {
      if (right.winsCount !== left.winsCount) return right.winsCount - left.winsCount;
      if (right.lastSeenOrder !== left.lastSeenOrder) return right.lastSeenOrder - left.lastSeenOrder;
      return left.signature.localeCompare(right.signature);
    });

  return {
    ranking,
    validDrawsCount,
    discardedDrawsCount
  };
}
