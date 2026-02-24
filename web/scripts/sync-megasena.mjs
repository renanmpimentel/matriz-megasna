import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena";
const OUTPUT_PATH = resolve("public/data/sorteios.json");
const WAIT_MS = 70;
const RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "mega-sena-web-sync/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} em ${url}`);
  }

  return response.json();
}

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      return await fetchJson(url);
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) {
        await sleep(300 * attempt);
      }
    }
  }

  throw lastError;
}

function normalize(concurso) {
  return {
    draw: Number(concurso.numero),
    date: concurso.dataApuracao,
    numbers: (concurso.listaDezenas ?? []).map((n) => Number(n))
  };
}

async function main() {
  const latest = await fetchWithRetry(BASE_URL);
  const latestNumber = Number(latest.numero);

  if (!Number.isFinite(latestNumber) || latestNumber < 1) {
    throw new Error("Nao foi possivel identificar o numero do ultimo concurso.");
  }

  let concursos = [];
  try {
    const saved = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      concursos = parsed
        .filter((item) => Number.isFinite(Number(item?.draw)))
        .sort((a, b) => Number(a.draw) - Number(b.draw));
    }
  } catch {
    concursos = [];
  }

  const lastSavedDraw = concursos.length ? Number(concursos[concursos.length - 1].draw) : 0;
  const startNumber = Math.max(1, lastSavedDraw + 1);

  if (startNumber > latestNumber) {
    process.stdout.write(`Nenhum sorteio novo. Ultimo salvo: ${lastSavedDraw}.\n`);
    process.stdout.write(`Arquivo mantido: ${OUTPUT_PATH}\n`);
    return;
  }

  process.stdout.write(`Ultimo salvo: ${lastSavedDraw}. Atualizando de ${startNumber} ate ${latestNumber}.\n`);

  for (let number = startNumber; number <= latestNumber; number += 1) {
    const data = await fetchWithRetry(`${BASE_URL}/${number}`);
    concursos.push(normalize(data));
    const fetchedCount = number - startNumber + 1;
    if (fetchedCount % 50 === 0 || number === latestNumber) {
      process.stdout.write(`Novos sincronizados: ${fetchedCount} (${number}/${latestNumber})\n`);
    }
    await sleep(WAIT_MS);
  }

  concursos = concursos
    .sort((a, b) => Number(a.draw) - Number(b.draw))
    .filter((item, index, arr) => index === 0 || Number(item.draw) !== Number(arr[index - 1].draw));

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(concursos), "utf8");

  process.stdout.write(`Arquivo atualizado: ${OUTPUT_PATH}\n`);
  process.stdout.write(`Total de sorteios: ${concursos.length}\n`);
}

main().catch((error) => {
  process.stderr.write(`Falha ao sincronizar: ${error.message}\n`);
  process.exit(1);
});
