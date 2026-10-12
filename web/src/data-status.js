function formatPtBr(date) {
  return date.toLocaleString("pt-BR");
}

export function buildDataStatusLabel(
  { updatedAt, latestDrawDate } = {},
  formatDate = formatPtBr,
) {
  const updatedAtDate = typeof updatedAt === "string" ? new Date(updatedAt) : null;
  const hasValidTimestamp = updatedAtDate && !Number.isNaN(updatedAtDate.getTime());
  const formattedUpdate = hasValidTimestamp ? formatDate(updatedAtDate) : "indisponível";
  const updateLabel = `Dados atualizados em: ${formattedUpdate}`;

  if (typeof latestDrawDate !== "string" || latestDrawDate.trim() === "") {
    return updateLabel;
  }

  return `${updateLabel} | Data do ultimo jogo: ${latestDrawDate}`;
}
