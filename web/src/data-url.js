function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function getDrawsDataUrl(baseUrl) {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  return `${normalizedBase}data/sorteios.json`;
}

export function getDrawsMetaUrl(baseUrl) {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  return `${normalizedBase}data/meta.json`;
}
