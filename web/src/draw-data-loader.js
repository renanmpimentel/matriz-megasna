import { getDrawsDataUrl, getDrawsMetaUrl } from "./data-url.js";

async function loadRequiredDraws(url, fetchImpl) {
  try {
    const response = await fetchImpl(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Nao foi possivel carregar os sorteios: ${reason}`, { cause: error });
  }
}

async function loadOptionalMetadata(url, fetchImpl) {
  try {
    const response = await fetchImpl(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function loadDrawData(baseUrl, fetchImpl = fetch) {
  const draws = await loadRequiredDraws(getDrawsDataUrl(baseUrl), fetchImpl);
  const metadata = await loadOptionalMetadata(getDrawsMetaUrl(baseUrl), fetchImpl);

  return { draws, metadata };
}
