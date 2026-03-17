import "./style.css";
import { getDrawsDataUrl } from "./data-url.js";
import { buildStrategyRanking } from "./strategy-analysis.js";
import { buildWinnersTableRows, normalizeWinnersOptions } from "./winners-view.js";

document.querySelector("#app").innerHTML = `
  <main class="min-h-screen bg-linear-to-b from-emerald-50 via-white to-amber-50 text-slate-800">
    <div class="mx-auto w-full max-w-[1440px] p-3 md:p-6">
      <header class="mb-4 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm md:p-6">
        <h1 class="text-2xl font-bold text-emerald-800 md:text-3xl">Painel Mega-Sena</h1>
        <p class="mt-1 text-sm text-slate-600 md:text-base">Consulta de sorteios e ranking de vencedores.</p>
        <div class="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Navegacao principal">
          <button id="tab-draws" type="button" class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white" aria-selected="true">Sorteios</button>
          <button id="tab-winners" type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" aria-selected="false">Vencedores</button>
        </div>
      </header>

      <section id="panel-draws" class="space-y-4">
        <section class="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm md:p-5" aria-label="Tutorial rapido">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-bold uppercase tracking-wide text-blue-800">Tutorial rapido</h2>
            <button id="toggle-tutorial" type="button" class="rounded-lg border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Ocultar</button>
          </div>
          <ol id="tutorial-list" class="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">1)</span> Use <span class="font-semibold">Numero</span> para achar sorteios por dezena.</li>
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">2)</span> Use <span class="font-semibold">Tipo</span> para filtrar por padrao de digitos.</li>
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">3)</span> Clique no cabecalho da coluna para ordenar.</li>
            <li class="rounded-xl bg-white p-3"><span class="font-semibold text-slate-900">4)</span> Use os botoes de pagina para navegar.</li>
          </ol>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Filtro rapido</h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
            <label class="text-sm font-medium text-slate-700">
              Numero do sorteio
              <input id="search-draw" type="number" min="1" placeholder="Ex: 2975" class="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-500" />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Numero (01 a 60)
              <input id="search-number" type="number" min="1" max="60" placeholder="Ex: 10" class="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-500" />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Tipo
              <select id="search-type" class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-emerald-500">
                <option value="">Todos</option>
              </select>
            </label>
            <label class="text-sm font-medium text-slate-700">
              Itens por pagina
              <select id="page-size" class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-emerald-500">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <div class="flex items-end">
              <button id="clear-filters" type="button" class="h-11 w-full rounded-xl bg-emerald-700 px-4 text-base font-semibold text-white transition hover:bg-emerald-800">Limpar filtros</button>
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

      <section id="panel-winners" class="hidden space-y-4">
        <section class="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm md:p-5">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-700">Parametros do ranking</h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="text-sm font-medium text-slate-700">
              Matriz n x n
              <input id="winners-n" type="number" min="2" max="9" value="6" class="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none transition focus:border-indigo-500" />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Top N
              <select id="winners-top" class="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-indigo-500">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </label>
          </div>
          <p id="winners-summary" class="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700"></p>
        </section>

        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1140px] border-collapse" aria-label="Ranking de vencedores">
              <thead class="bg-indigo-700 text-white">
                <tr>
                  <th class="px-3 py-3 text-left text-xs font-semibold">Estrategia (matriz/jogo base)</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold">Times vencedores</th>
                  <th class="px-3 py-3 text-left text-xs font-semibold">Times em que a estrategia venceu</th>
                  <th class="px-3 py-3 text-left text-xs font-semibold">Outros times vencedores com a mesma estrategia</th>
                </tr>
              </thead>
              <tbody id="winners-table-body"></tbody>
            </table>
          </div>
          <p id="winners-empty" class="hidden border-t border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Nenhum concurso valido para os parametros escolhidos.</p>
        </section>
      </section>

      <footer class="mt-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-center text-sm text-slate-600">
        <span id="last-updated">Ultima atualizacao: carregando...</span>
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
const sortableHeaders = [...document.querySelectorAll("[data-sort-key]")];
const tutorialList = document.querySelector("#tutorial-list");
const toggleTutorialButton = document.querySelector("#toggle-tutorial");
const lastUpdatedElement = document.querySelector("#last-updated");
const tabDraws = document.querySelector("#tab-draws");
const tabWinners = document.querySelector("#tab-winners");
const panelDraws = document.querySelector("#panel-draws");
const panelWinners = document.querySelector("#panel-winners");
const winnersN = document.querySelector("#winners-n");
const winnersTop = document.querySelector("#winners-top");
const winnersSummary = document.querySelector("#winners-summary");
const winnersTableBody = document.querySelector("#winners-table-body");
const winnersEmpty = document.querySelector("#winners-empty");

let rawDraws = [];
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

    if (left === right) return a.sorteioValue - b.sorteioValue;

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

function setActiveTab(tab) {
  const showDraws = tab === "draws";
  panelDraws.classList.toggle("hidden", !showDraws);
  panelWinners.classList.toggle("hidden", showDraws);

  tabDraws.setAttribute("aria-selected", showDraws ? "true" : "false");
  tabWinners.setAttribute("aria-selected", showDraws ? "false" : "true");

  tabDraws.className = showDraws
    ? "rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
    : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700";
  tabWinners.className = showDraws
    ? "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
    : "rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white";
}

function renderWinners() {
  const options = normalizeWinnersOptions({
    n: winnersN.value,
    top: winnersTop.value
  });

  winnersN.value = String(options.n);
  winnersTop.value = String(options.top);

  const result = buildStrategyRanking(rawDraws, options);
  const rows = buildWinnersTableRows(result.ranking, options.top);

  winnersSummary.textContent = `Validos: ${result.validDrawsCount} | Descartados: ${result.discardedDrawsCount} | Estrategias unicas: ${result.ranking.length} | Melhor estrategia: mais times vencedores`;

  winnersTableBody.innerHTML = rows
    .map((row) => {
      const teamsMarkup = row.teams
        .map((team) => `<div class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">${team}</div>`)
        .join("");
      const othersMarkup = row.otherWinningTeams
        .map((team) => `<div class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">${team}</div>`)
        .join("");
      const noneLabel = `<span class="text-slate-500">Sem outros times</span>`;

      return `
      <tr class="odd:bg-white even:bg-slate-50/70">
        <td class="border-b border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">${row.strategyLabel}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-center text-sm font-semibold text-indigo-700">${row.winsCount}</td>
        <td class="border-b border-slate-200 px-3 py-2 text-xs text-slate-700"><div class="grid gap-1">${teamsMarkup}</div></td>
        <td class="border-b border-slate-200 px-3 py-2 text-xs text-slate-700"><div class="grid gap-1">${othersMarkup || noneLabel}</div>
        </td>
      </tr>
    `
    })
    .join("");

  winnersEmpty.classList.toggle("hidden", rows.length > 0);
}

async function init() {
  const response = await fetch(getDrawsDataUrl(import.meta.env.BASE_URL));
  rawDraws = await response.json();

  const latestDraw = [...rawDraws].sort((a, b) => Number(a.draw) - Number(b.draw)).at(-1);
  const updatedLabel = new Date().toLocaleString("pt-BR");
  const latestDrawLabel = latestDraw?.date ? ` | Data do ultimo jogo: ${latestDraw.date}` : "";
  lastUpdatedElement.textContent = `Ultima atualizacao: ${updatedLabel}${latestDrawLabel}`;

  allRows = rawDraws.map(buildRow);
  filteredRows = [...allRows];

  const types = [...new Set(allRows.map((row) => row.type))].sort();
  typeFilter.innerHTML = `<option value="">Todos</option>${types.map((t) => `<option>${t}</option>`).join("")}`;

  renderPage();
  renderWinners();

  drawFilter.addEventListener("input", applyFilters);
  numberFilter.addEventListener("input", applyFilters);
  typeFilter.addEventListener("change", applyFilters);
  pageSizeSelect.addEventListener("change", () => {
    pageSize = Number(pageSizeSelect.value);
    currentPage = 1;
    renderPage();
  });

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
  tabWinners.addEventListener("click", () => setActiveTab("winners"));

  [winnersN, winnersTop].forEach((element) => {
    element.addEventListener("input", renderWinners);
    element.addEventListener("change", renderWinners);
  });
}

init();
