import "./style.css";
import { loadDrawData } from "./draw-data-loader.js";
import { buildDataStatusLabel } from "./data-status.js";
import { buildDigitsRanking, selectDigitsDraws } from "./digits-core.js";
import { buildDigitsTableRows, buildDigitsSummary } from "./digits-view.js";
import { buildStrategiesRanking, buildTypeFrequency, buildTypeCadence } from "./strategies-core.js";
import { buildStrategiesTableRows, buildTypeFrequencyChart, buildCadenceOverview, buildCadenceDetails, normalizeStrategiesOptions } from "./strategies-view.js";

document.querySelector("#app").innerHTML = `
  <main class="min-h-screen bg-linear-to-b from-emerald-50 via-white to-amber-50 text-slate-800">
    <div class="mx-auto w-full max-w-[1440px] p-3 md:p-6">
      <header class="mb-4 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm md:p-6">
        <h1 class="text-2xl font-bold text-emerald-800 md:text-3xl">Painel Mega-Sena</h1>
        <p class="mt-1 text-sm text-slate-600 md:text-base">Consulte os sorteios com busca simples, filtros, paginacao e ranking de estrategias.</p>
        <div class="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Navegacao principal">
          <button id="tab-draws" type="button" aria-selected="true" class="rounded-lg border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Sorteios</button>
          <button id="tab-strategies" type="button" aria-selected="false" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Estrategias</button>
          <button id="tab-digits" type="button" aria-selected="false" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Dígitos</button>
        </div>
      </header>

      <section id="panel-draws" class="space-y-4">
        <section class="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm md:p-5" aria-label="Tutorial rapido">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-bold uppercase tracking-wide text-blue-800">Tutorial rapido</h2>
            <button id="toggle-tutorial" type="button" class="rounded-lg border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">
              Ocultar
            </button>
          </div>
          <ol id="tutorial-list" class="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">1)</span> Use <span class="font-semibold">Numero</span> para encontrar sorteios que contem uma dezena especifica.</li>
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">2)</span> Use o filtro <span class="font-semibold">Tipo</span> para reduzir os resultados por padrao de digitos.</li>
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">3)</span> Clique no titulo de qualquer coluna para <span class="font-semibold">ordenar</span> crescente/decrescente.</li>
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">4)</span> Navegue com <span class="font-semibold">Primeira, Anterior, Proxima e Ultima</span> para trocar de pagina.</li>
          </ol>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Filtro rapido</h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
            <label class="text-sm font-medium text-slate-700">
              Numero do sorteio
              <input id="search-draw" type="number" min="1" placeholder="Ex: 2975"
                class="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none ring-0 transition focus:border-emerald-500" />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Numero (01 a 60)
              <input id="search-number" type="number" min="1" max="60" placeholder="Ex: 10"
                class="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none ring-0 transition focus:border-emerald-500" />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Tipo
              <select id="search-type"
                class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-emerald-500">
                <option value="">Todos</option>
              </select>
            </label>
            <label class="text-sm font-medium text-slate-700">
              Itens por pagina
              <select id="page-size"
                class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-emerald-500">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <div class="flex items-end">
              <button id="clear-filters" type="button"
                class="h-11 w-full rounded-xl bg-emerald-700 px-4 text-base font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.99]">
                Limpar filtros
              </button>
            </div>
          </div>
          <div class="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700" id="result-count" aria-live="polite"></div>
        </section>

        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table id="result-table" class="w-full min-w-[1100px] border-collapse">
              <thead class="bg-emerald-800 text-white">
                <tr>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="sorteio" class="mx-auto flex items-center gap-1">Sorteio <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="matriz1" class="mx-auto flex items-center gap-1">Matriz 1 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="matriz2" class="mx-auto flex items-center gap-1">Matriz 2 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="matriz3" class="mx-auto flex items-center gap-1">Matriz 3 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="matriz4" class="mx-auto flex items-center gap-1">Matriz 4 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="matriz5" class="mx-auto flex items-center gap-1">Matriz 5 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="matriz6" class="mx-auto flex items-center gap-1">Matriz 6 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="num1" class="mx-auto flex items-center gap-1">Num 1 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="num2" class="mx-auto flex items-center gap-1">Num 2 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="num3" class="mx-auto flex items-center gap-1">Num 3 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="num4" class="mx-auto flex items-center gap-1">Num 4 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="num5" class="mx-auto flex items-center gap-1">Num 5 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="num6" class="mx-auto flex items-center gap-1">Num 6 <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="sum" class="mx-auto flex items-center gap-1">Soma <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="type" class="mx-auto flex items-center gap-1">Tipo <span class="text-[10px] opacity-70">↕</span></button></th>
                  <th class="sticky top-0 px-2 py-3 text-center text-xs font-semibold"><button type="button" data-sort-key="digitsValue" class="mx-auto flex items-center gap-1">Digitos <span class="text-[10px] opacity-70">↕</span></button></th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-3 md:flex-row">
            <p id="page-info" class="text-sm text-slate-700"></p>
            <div class="flex items-center gap-2">
              <button id="first-page" class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">Primeira</button>
              <button id="prev-page" class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">Anterior</button>
              <span id="page-number" class="min-w-28 text-center text-sm font-semibold text-slate-700"></span>
              <button id="next-page" class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">Proxima</button>
              <button id="last-page" class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">Ultima</button>
            </div>
          </div>
        </section>
      </section>

      <section id="panel-strategies" class="hidden space-y-4">
        <section class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5" aria-labelledby="type-frequency-title">
          <h2 id="type-frequency-title" class="text-xl font-semibold text-slate-900">Frequência total por tipo de matriz</h2>
          <div id="type-frequency-chart"></div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5" aria-labelledby="cadence-title">
          <h2 id="cadence-title" class="text-xl font-semibold text-slate-900">Cadência por tipo</h2>
          <div id="cadence-overview"></div>
          <div id="cadence-selection" class="mt-5 hidden">
            <label for="cadence-type" class="block text-base font-semibold text-slate-800">Ver intervalos do tipo</label>
            <select id="cadence-type" class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-emerald-700 sm:w-48"></select>
            <div id="cadence-details" aria-live="polite"></div>
          </div>
          <p class="mt-4 text-sm text-slate-700">Médias históricas não representam ciclos fixos nem previsão. Um tipo estar há vários concursos sem aparecer não significa que aparecerá no próximo. Os filtros de estratégias não alteram esta análise.</p>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Filtro de estrategias</h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label class="text-sm font-medium text-slate-700">
              Estrategia (matriz completa)
              <input id="strategy-filter" type="text" placeholder="Ex: 14-15-42-44-52-63"
                class="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none ring-0 transition focus:border-emerald-500" />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Tipo da matriz
              <select id="strategies-type"
                class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-emerald-500">
                <option value="">Todos</option>
              </select>
            </label>
            <label class="text-sm font-medium text-slate-700">
              Top N
              <select id="strategies-top"
                class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-emerald-500">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="-1">Todas</option>
              </select>
            </label>
            <div class="flex items-end">
              <button id="clear-strategies" type="button"
                class="h-11 w-full rounded-xl bg-emerald-700 px-4 text-base font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.99]">
                Limpar filtro
              </button>
            </div>
          </div>
          <p class="mt-3 text-sm text-slate-700">Frequência da matriz completa (Matriz 1 a 6) por tipo. A frequência no tipo divide as ocorrências da matriz pelo total de sorteios daquele tipo. O filtro de matriz e o Top N não alteram essa base. Frequência histórica não indica chance de prêmio.</p>
          <p id="strategies-summary" class="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700" aria-live="polite"></p>
        </section>

        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[980px] border-collapse" aria-label="Ranking de estrategias">
              <thead class="bg-emerald-800 text-white">
                <tr>
                  <th class="px-3 py-3 text-center text-xs font-semibold">#</th>
                  <th class="px-3 py-3 text-left text-xs font-semibold">Estrategia</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold">Tipo</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold">Ocorrências</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold">Sorteios do tipo</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold">Frequência no tipo</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold">Frequência geral</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold">Ultima ocorrencia</th>
                  <th class="px-3 py-3 text-left text-xs font-semibold">Concursos</th>
                </tr>
              </thead>
              <tbody id="strategies-table-body"></tbody>
            </table>
          </div>
          <p id="strategies-empty" class="hidden border-t border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Nenhuma estrategia encontrada para o filtro informado.</p>
        </section>
      </section>

      <section id="panel-digits" class="hidden space-y-4" aria-labelledby="digits-title">
        <section class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5">
          <h2 id="digits-title" class="text-xl font-semibold text-slate-900">Frequência por conjunto de dígitos</h2>
          <p class="mt-2 max-w-prose text-base text-slate-700">Cada linha reúne sorteios com exatamente os mesmos dígitos, independentemente da ordem ou repetição nas dezenas. Exemplo: 123450 representa 0, 1, 2, 3, 4 e 5.</p>
          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <label class="text-base font-medium text-slate-700">Tipo
              <select id="digits-type" class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-emerald-700"></select>
            </label>
            <label class="text-base font-medium text-slate-700">Buscar conjunto de dígitos
              <input id="digits-search" type="text" inputmode="numeric" placeholder="Ex.: 123450 ou 012345" aria-describedby="digits-help digits-error" class="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 placeholder:text-slate-600 focus-visible:outline-2 focus-visible:outline-emerald-700" />
            </label>
            <div class="flex items-end"><button id="digits-clear" type="button" class="h-11 w-full rounded-xl bg-emerald-700 px-4 text-base font-semibold text-white hover:bg-emerald-800">Limpar busca</button></div>
          </div>
          <p id="digits-help" class="mt-3 text-sm text-slate-700">Busca exata: informe cada dígito uma única vez, em qualquer ordem. O zero é exibido no final. Percentuais sobre todos os sorteios do tipo selecionado, sem alteração pela busca. Clique em um conjunto de dígitos para ver as matrizes e dezenas de cada sorteio.</p>
          <p id="digits-error" class="mt-2 hidden text-base font-medium text-red-800" role="status"></p>
          <p id="digits-summary" class="mt-3 rounded-xl bg-slate-50 p-3 text-base text-slate-700" aria-live="polite"></p>
        </section>
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[760px] border-collapse text-base" aria-label="Frequência dos conjuntos de dígitos">
              <thead class="bg-emerald-800 text-white"><tr>
                <th scope="col" class="px-3 py-3 text-left">Dígitos</th>
                <th scope="col" class="px-3 py-3">Ocorrências</th>
                <th scope="col" class="px-3 py-3">Frequência no tipo</th>
                <th scope="col" class="px-3 py-3">Último concurso</th>
                <th scope="col" class="px-3 py-3 text-left">Concursos</th>
              </tr></thead>
              <tbody id="digits-table-body"></tbody>
            </table>
          </div>
          <p id="digits-empty" class="hidden p-4 text-base text-slate-700"></p>
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-3">
            <p id="digits-page-info" class="text-base text-slate-700"></p>
            <div class="flex gap-2">
              <button id="digits-prev" type="button" class="h-11 rounded-lg border border-slate-300 bg-white px-4 text-base disabled:cursor-not-allowed disabled:opacity-50">Anterior</button>
              <button id="digits-next" type="button" class="h-11 rounded-lg border border-slate-300 bg-white px-4 text-base disabled:cursor-not-allowed disabled:opacity-50">Próxima</button>
            </div>
          </div>
        </section>
        <p class="text-sm text-slate-700">Frequência histórica não prevê resultados futuros.</p>
      </section>

      <footer class="mt-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-center text-sm text-slate-600">
        <span id="last-updated">Dados atualizados em: carregando...</span>
      </footer>
    </div>
  </main>
`;

const tableBody = document.querySelector("#result-table tbody");
const drawFilter = document.querySelector("#search-draw");
const numberFilter = document.querySelector("#search-number");
const typeFilter = document.querySelector("#search-type");
const pageSizeSelect = document.querySelector("#page-size");
const clearFilters = document.querySelector("#clear-filters");
const resultCount = document.querySelector("#result-count");
const pageInfo = document.querySelector("#page-info");
const pageNumber = document.querySelector("#page-number");
const firstPageButton = document.querySelector("#first-page");
const prevPageButton = document.querySelector("#prev-page");
const nextPageButton = document.querySelector("#next-page");
const lastPageButton = document.querySelector("#last-page");
const sortableHeaders = [...document.querySelectorAll("#panel-draws [data-sort-key]")];
const tutorialList = document.querySelector("#tutorial-list");
const toggleTutorialButton = document.querySelector("#toggle-tutorial");
const lastUpdatedElement = document.querySelector("#last-updated");

const tabDraws = document.querySelector("#tab-draws");
const tabStrategies = document.querySelector("#tab-strategies");
const tabDigits = document.querySelector("#tab-digits");
const digitsType = document.querySelector("#digits-type");
const digitsSearch = document.querySelector("#digits-search");
const digitsPrev = document.querySelector("#digits-prev");
const digitsNext = document.querySelector("#digits-next");
let digitsPage = 1;
let expandedDigitsKey = "";

const strategyFilterInput = document.querySelector("#strategy-filter");
const strategiesTopSelect = document.querySelector("#strategies-top");
const strategiesTypeSelect = document.querySelector("#strategies-type");
const clearStrategiesButton = document.querySelector("#clear-strategies");
const strategiesSummary = document.querySelector("#strategies-summary");
const strategiesTableBody = document.querySelector("#strategies-table-body");
const strategiesEmpty = document.querySelector("#strategies-empty");

let allRows = [];
let filteredRows = [];
let currentPage = 1;
let pageSize = 25;
let sortState = { key: "sorteio", direction: "asc" };

function sortedWithoutDuplicates(value) {
  return [...new Set(value.split(""))].sort().join("");
}

function buildRow(draw, index) {
  const numbers = draw.numbers.map((n) => String(n).padStart(2, "0"));
  const concat = numbers.join("");
  const digits = sortedWithoutDuplicates(concat);
  const matriz = [];

  for (let i = 0; i < 6; i += 1) {
    const d1 = concat[i * 2];
    const d2 = concat[i * 2 + 1];
    const p1 = digits.indexOf(d1) + 1;
    const p2 = digits.indexOf(d2) + 1;
    matriz.push(Number(`${p1}${p2}`));
  }

  const sum = draw.numbers.reduce((acc, n) => acc + n, 0);
  const type = `${digits.length}x${digits.length}`;
  const digitsValue = digits.includes("0") ? Number(digits) * 10 : Number(digits);
  const sorteioValue = Number(draw.draw ?? index + 1);
  const sorteio = String(sorteioValue).padStart(3, "0");

  return { sorteio, sorteioValue, matriz, numbers, sum, type, digitsValue };
}

function getSortValue(row, key) {
  if (key === "sorteio") return row.sorteioValue;
  if (key.startsWith("matriz")) return row.matriz[Number(key.replace("matriz", "")) - 1];
  if (key.startsWith("num")) return Number(row.numbers[Number(key.replace("num", "")) - 1]);
  return row[key];
}

function sortRows() {
  filteredRows.sort((a, b) => {
    const left = getSortValue(a, sortState.key);
    const right = getSortValue(b, sortState.key);

    if (left === right) {
      return a.sorteioValue - b.sorteioValue;
    }

    const comparison = left > right ? 1 : -1;
    return sortState.direction === "asc" ? comparison : -comparison;
  });
}

function updateSortIndicators() {
  sortableHeaders.forEach((button) => {
    const indicator = button.querySelector("span");
    if (!indicator) return;
    if (button.dataset.sortKey === sortState.key) {
      indicator.textContent = sortState.direction === "asc" ? "↑" : "↓";
      indicator.classList.remove("opacity-70");
      indicator.classList.add("opacity-100");
      return;
    }
    indicator.textContent = "↕";
    indicator.classList.add("opacity-70");
    indicator.classList.remove("opacity-100");
  });
}

function renderPage() {
  sortRows();
  updateSortIndicators();

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const rows = filteredRows.slice(start, end);

  tableBody.innerHTML = rows
    .map((row) => {
      const matrixCells = row.matriz
        .map((value) => `<td class=\"border-b border-slate-200 px-2 py-2 text-center text-sm\">${value}</td>`)
        .join("");
      const numberCells = row.numbers
        .map((value) => `<td class=\"border-b border-slate-200 bg-amber-50 px-2 py-2 text-center text-sm\">${value}</td>`)
        .join("");

      return `
        <tr class="odd:bg-white even:bg-slate-50/65 transition">
          <td class="border-b border-slate-200 bg-slate-200 px-2 py-2 text-center text-sm font-semibold">${row.sorteio}</td>
          ${matrixCells}
          ${numberCells}
          <td class="border-b border-slate-200 bg-rose-50 px-2 py-2 text-center text-sm">${row.sum}</td>
          <td class="border-b border-slate-200 bg-emerald-50 px-2 py-2 text-center text-sm">${row.type}</td>
          <td class="border-b border-slate-200 px-2 py-2 text-center text-sm">${row.digitsValue}</td>
        </tr>
      `;
    })
    .join("");

  resultCount.textContent = `Mostrando ${rows.length} de ${filteredRows.length} sorteios filtrados.`;
  pageInfo.textContent = `Total de paginas: ${totalPages}`;
  pageNumber.textContent = `Pagina ${currentPage} / ${totalPages}`;

  firstPageButton.disabled = currentPage === 1;
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
  lastPageButton.disabled = currentPage === totalPages;

  [firstPageButton, prevPageButton, nextPageButton, lastPageButton].forEach((button) => {
    if (button.disabled) {
      button.classList.add("opacity-40", "cursor-not-allowed");
    } else {
      button.classList.remove("opacity-40", "cursor-not-allowed");
    }
  });
}

function applyFilters() {
  const selectedDraw = Number(drawFilter.value);
  const selectedNumber = Number(numberFilter.value);
  const selectedType = typeFilter.value;

  filteredRows = allRows.filter((row) => {
    const byDraw = selectedDraw ? row.sorteioValue === selectedDraw : true;
    const byNumber = selectedNumber ? row.numbers.includes(String(selectedNumber).padStart(2, "0")) : true;
    const byType = selectedType ? row.type === selectedType : true;
    return byDraw && byNumber && byType;
  });
  currentPage = 1;
  renderPage();
}

function renderStrategies() {
  const options = normalizeStrategiesOptions({
    top: strategiesTopSelect.value,
    strategyFilter: strategyFilterInput.value,
    typeFilter: strategiesTypeSelect.value
  });

  strategyFilterInput.value = options.strategyFilter;
  strategiesTopSelect.value = String(options.top);

  const result = buildStrategiesRanking(allRows, options);
  const rows = buildStrategiesTableRows(result.ranking);
  strategiesTableBody.innerHTML = rows.join("");
  strategiesEmpty.classList.toggle("hidden", rows.length > 0);

  const leader = result.ranking[0];
  if (!leader) {
    strategiesSummary.textContent = `Nenhuma matriz encontrada. Tipo: ${options.typeFilter || "Todos"} | Sorteios nesta base: ${result.selectedTypeDraws} de ${result.totalDraws}.`;
    return;
  }

  strategiesSummary.textContent = `Tipo: ${options.typeFilter || "Todos"} | Sorteios nesta base: ${result.selectedTypeDraws} de ${result.totalDraws} | Matrizes exibidas: ${result.ranking.length} de ${result.totalStrategies} | Matriz mais frequente: ${leader.strategyKey} (${leader.wins} ocorrências)`;
}

function setActiveTab(tab) {
  for (const name of ["draws", "strategies", "digits"]) {
    const active = name === tab;
    document.querySelector(`#panel-${name}`).classList.toggle("hidden", !active);
    const button = document.querySelector(`#tab-${name}`);
    button.setAttribute("aria-selected", String(active));
    button.className = active
      ? "rounded-lg border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
      : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700";
  }
}

function renderDigits({ keepExpanded = false, focusId = "" } = {}) {
  if (!keepExpanded) expandedDigitsKey = "";
  const result = buildDigitsRanking(allRows, { type: digitsType.value, query: digitsSearch.value, page: digitsPage });
  digitsPage = result.page;
  const draws = expandedDigitsKey ? selectDigitsDraws(allRows, { type: digitsType.value, key: expandedDigitsKey }) : [];
  document.querySelector("#digits-table-body").innerHTML = buildDigitsTableRows(result.entries, { expandedKey: expandedDigitsKey, type: digitsType.value, draws });
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
  document.querySelector("#digits-summary").textContent = allRows.length ? buildDigitsSummary(result, digitsType.value) : "Nenhum sorteio disponível para agrupar.";
  const errorElement = document.querySelector("#digits-error");
  errorElement.textContent = result.error;
  errorElement.classList.toggle("hidden", !result.error);
  digitsSearch.setAttribute("aria-invalid", String(Boolean(result.error)));
  const empty = document.querySelector("#digits-empty");
  empty.classList.toggle("hidden", result.entries.length > 0 || Boolean(result.error));
  empty.textContent = allRows.length ? "Este conjunto não apareceu na base para o tipo selecionado." : "Nenhum sorteio disponível.";
  const first = result.matchedGroups ? (result.page - 1) * 25 + 1 : 0;
  const last = result.matchedGroups ? first + result.entries.length - 1 : 0;
  document.querySelector("#digits-page-info").textContent = `Conjuntos ${first}–${last} de ${result.matchedGroups} · Página ${result.page} de ${result.totalPages}`;
  digitsPrev.disabled = result.page <= 1;
  digitsNext.disabled = result.page >= result.totalPages;
}

async function init() {
  const { draws, metadata } = await loadDrawData(import.meta.env.BASE_URL);

  const latestDraw = [...draws].sort((a, b) => Number(a.draw) - Number(b.draw)).at(-1);
  lastUpdatedElement.textContent = buildDataStatusLabel({
    updatedAt: metadata?.updatedAt,
    latestDrawDate: latestDraw?.date,
  });

  allRows = draws.map(buildRow);
  document.querySelector("#type-frequency-chart").innerHTML = buildTypeFrequencyChart(buildTypeFrequency(allRows));
  const cadence = buildTypeCadence(allRows);
  document.querySelector("#cadence-overview").innerHTML = buildCadenceOverview(cadence);
  if (cadence.status === "ready") {
    const cadenceSelect = document.querySelector("#cadence-type");
    cadenceSelect.innerHTML = cadence.entries.map(entry => `<option>${entry.type}</option>`).join("");
    cadenceSelect.value = cadence.entries.some(entry => entry.type === "6x6") ? "6x6" : cadence.entries[0].type;
    const renderCadenceDetails = () => {
      document.querySelector("#cadence-details").innerHTML = buildCadenceDetails(cadence.entries.find(entry => entry.type === cadenceSelect.value));
    };
    document.querySelector("#cadence-selection").classList.remove("hidden");
    cadenceSelect.addEventListener("change", renderCadenceDetails);
    renderCadenceDetails();
  }

  const types = [...new Set(allRows.map((row) => row.type))].sort();
  typeFilter.innerHTML = `<option value="">Todos</option>${types.map((t) => `<option>${t}</option>`).join("")}`;
  strategiesTypeSelect.innerHTML = typeFilter.innerHTML;
  const digitTypes = [...types].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  digitsType.innerHTML = digitTypes.map(type => `<option>${type}</option>`).join("");
  digitsType.value = digitTypes.includes("6x6") ? "6x6" : (digitTypes[0] ?? "");
  digitsType.disabled = !digitTypes.length;
  digitsSearch.disabled = !digitTypes.length;
  renderDigits();
  document.querySelector("#digits-table-body").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-digits-toggle]");
    if (!button) return;
    const key = button.dataset.digitsToggle;
    expandedDigitsKey = expandedDigitsKey === key ? "" : key;
    const focusId = button.id.startsWith("digits-close-") ? `digits-toggle-${key}` : button.id;
    renderDigits({ keepExpanded: true, focusId });
  });
  for (const [element, event] of [[digitsType, "change"], [digitsSearch, "input"]]) {
    element.addEventListener(event, () => { digitsPage = 1; renderDigits(); });
  }
  document.querySelector("#digits-clear").addEventListener("click", () => {
    digitsSearch.value = "";
    digitsPage = 1;
    renderDigits();
  });
  digitsPrev.addEventListener("click", () => { digitsPage -= 1; renderDigits(); });
  digitsNext.addEventListener("click", () => { digitsPage += 1; renderDigits(); });

  filteredRows = [...allRows];
  renderPage();
  renderStrategies();

  drawFilter.addEventListener("input", applyFilters);
  numberFilter.addEventListener("input", applyFilters);
  typeFilter.addEventListener("change", applyFilters);

  sortableHeaders.forEach((button) => {
    button.addEventListener("click", () => {
      const clickedKey = button.dataset.sortKey;
      if (clickedKey === sortState.key) {
        sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
      } else {
        sortState = { key: clickedKey, direction: "asc" };
      }
      currentPage = 1;
      renderPage();
    });
  });

  pageSizeSelect.addEventListener("change", () => {
    pageSize = Number(pageSizeSelect.value);
    currentPage = 1;
    renderPage();
  });

  firstPageButton.addEventListener("click", () => {
    currentPage = 1;
    renderPage();
  });

  prevPageButton.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    renderPage();
  });

  nextPageButton.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    currentPage = Math.min(totalPages, currentPage + 1);
    renderPage();
  });

  lastPageButton.addEventListener("click", () => {
    currentPage = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    renderPage();
  });

  clearFilters.addEventListener("click", () => {
    drawFilter.value = "";
    numberFilter.value = "";
    typeFilter.value = "";
    pageSizeSelect.value = "25";
    pageSize = 25;
    filteredRows = [...allRows];
    sortState = { key: "sorteio", direction: "asc" };
    currentPage = 1;
    renderPage();
  });

  toggleTutorialButton.addEventListener("click", () => {
    const hidden = tutorialList.classList.toggle("hidden");
    toggleTutorialButton.textContent = hidden ? "Mostrar" : "Ocultar";
  });

  tabDraws.addEventListener("click", () => setActiveTab("draws"));
  tabStrategies.addEventListener("click", () => setActiveTab("strategies"));
  tabDigits.addEventListener("click", () => setActiveTab("digits"));

  [strategyFilterInput, strategiesTopSelect, strategiesTypeSelect].forEach((element) => {
    element.addEventListener("input", renderStrategies);
    element.addEventListener("change", renderStrategies);
  });

  clearStrategiesButton.addEventListener("click", () => {
    strategyFilterInput.value = "";
    strategiesTopSelect.value = "10";
    strategiesTypeSelect.value = "";
    renderStrategies();
  });
}

init();
