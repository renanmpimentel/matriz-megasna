export function buildGeneratorPanel() {
  return `
    <section id="panel-generator" class="hidden space-y-4" aria-labelledby="generator-title">
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h2 id="generator-title" class="text-xl font-semibold text-slate-900">Gerador de matrizes 6x6</h2>
        <p class="mt-2 max-w-3xl text-base text-slate-700">Gere jogos usando exatamente os seis dígitos escolhidos. Comece pelo intervalo histórico ou personalize a soma desejada.</p>
        <form id="generator-form" class="mt-5" novalidate>
          <div class="flex flex-wrap items-start gap-4">
            <div class="w-full sm:w-72">
              <label for="generator-digits" class="block text-base font-medium text-slate-800">Dígitos</label>
              <input id="generator-digits" type="text" inputmode="numeric" value="123450" autocomplete="off" aria-describedby="generator-help generator-digits-error" class="mt-1 h-11 w-full rounded-lg border border-slate-400 px-3 text-lg tabular-nums focus-visible:outline-2 focus-visible:outline-emerald-700" />
              <p id="generator-digits-error" class="mt-2 text-base text-red-800" aria-live="polite"></p>
            </div>
            <div class="w-full sm:w-48">
              <label for="generator-quantity" class="block text-base font-medium text-slate-800">Quantidade de jogos</label>
              <input id="generator-quantity" type="number" min="1" max="100" step="1" value="10" aria-describedby="generator-quantity-help generator-quantity-error" class="mt-1 h-11 w-full rounded-lg border border-slate-400 px-3 text-lg tabular-nums focus-visible:outline-2 focus-visible:outline-emerald-700" />
              <p id="generator-quantity-help" class="mt-1 text-base text-slate-700">De 1 a 100 por geração.</p>
              <p id="generator-quantity-error" class="mt-1 text-base text-red-800" aria-live="polite"></p>
            </div>
          </div>
          <p id="generator-help" class="mt-3 text-base text-slate-700">Informe seis dígitos diferentes, em qualquer ordem. Nas dezenas de 01 a 09, o zero também conta como dígito.</p>
          <div class="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-base" aria-live="polite" aria-atomic="true">
            <p class="font-semibold text-slate-900">Intervalo histórico · Tipo 6x6</p>
            <p id="generator-context" class="mt-1 tabular-nums text-slate-800">Carregando histórico…</p>
          </div>
          <div class="mt-5 flex flex-wrap items-start gap-4">
            <div class="w-full sm:w-48">
              <label for="generator-min-sum" class="block text-base font-medium text-slate-800">Soma mínima</label>
              <input id="generator-min-sum" type="number" min="21" max="345" step="1" disabled aria-describedby="generator-range-help generator-range-error" class="mt-1 h-11 w-full rounded-lg border border-slate-400 px-3 text-lg tabular-nums focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:bg-slate-100" />
            </div>
            <div class="w-full sm:w-48">
              <label for="generator-max-sum" class="block text-base font-medium text-slate-800">Soma máxima</label>
              <input id="generator-max-sum" type="number" min="21" max="345" step="1" disabled aria-describedby="generator-range-help generator-range-error" class="mt-1 h-11 w-full rounded-lg border border-slate-400 px-3 text-lg tabular-nums focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:bg-slate-100" />
            </div>
            <div class="w-full sm:w-72">
              <label for="generator-frequent-sum" class="block text-base font-medium text-slate-800">Usar soma mais frequente</label>
              <select id="generator-frequent-sum" disabled aria-describedby="generator-frequent-help" class="mt-1 h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:bg-slate-100"><option value="">Escolha uma soma</option></select>
              <p id="generator-frequent-help" class="mt-1 text-base text-slate-700">Inclui todas as somas empatadas.</p>
            </div>
          </div>
          <p id="generator-range-help" class="mt-3 text-base text-slate-700">Para uma soma exata, use o mesmo valor nos dois campos. Você pode sair do intervalo histórico, entre 21 e 345.</p>
          <p id="generator-range-error" class="mt-1 text-base text-red-800" aria-live="polite"></p>
          <button id="generator-restore-range" type="button" disabled class="mt-2 min-h-11 rounded-lg px-2 text-base font-medium text-emerald-800 underline underline-offset-4 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50">Restaurar intervalo histórico</button>
          <div class="mt-4 flex flex-wrap gap-3">
            <button id="generator-count" type="button" disabled class="min-h-11 rounded-lg border border-emerald-700 bg-white px-5 py-2 text-base font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Calcular total</button>
            <button id="generator-submit" type="submit" disabled class="min-h-11 rounded-lg bg-emerald-700 px-5 py-2 text-base font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Gerar matrizes</button>
            <button id="generator-cancel" type="button" hidden class="min-h-11 rounded-lg border border-slate-400 bg-white px-5 py-2 text-base font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-700">Cancelar</button>
          </div>
          <p id="generator-total" class="mt-4 text-lg font-semibold tabular-nums text-slate-900" aria-live="polite">Total de combinações válidas: ainda não calculado.</p>
        </form>
        <p class="mt-4 text-base text-slate-700">O intervalo histórico é um filtro de seleção, não uma previsão de resultado. A quantidade pedida não altera o total de combinações válidas.</p>
      </section>
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="generator-results-title">
        <div class="border-b border-slate-200 p-4">
          <h3 id="generator-results-title" class="text-lg font-semibold text-slate-900">Jogos gerados</h3>
          <p id="generator-status" class="mt-1 text-base text-slate-700" role="status" aria-live="polite" aria-atomic="true">Escolha os dígitos e clique em Gerar matrizes.</p>
        </div>
        <div id="generator-results" hidden class="overflow-x-auto" tabindex="0" role="region" aria-label="Jogos gerados; role horizontalmente para ver todas as colunas">
          <table class="w-full min-w-[800px] border-collapse text-base tabular-nums" aria-label="Matrizes e dezenas geradas">
            <thead class="bg-emerald-800 text-white"><tr>
              <th scope="col" class="px-4 py-3 text-left">Jogo</th>
              <th scope="col" class="px-4 py-3 text-left">Matriz</th>
              <th scope="col" class="px-4 py-3 text-left">Dezenas</th>
              <th scope="col" class="px-4 py-3 text-right">Soma</th>
              <th scope="col" class="px-4 py-3 text-left">Histórico</th>
            </tr></thead>
            <tbody id="generator-table-body"></tbody>
          </table>
        </div>
      </section>
    </section>`;
}

export function buildFrequentSumOptions(sums) {
  return '<option value="">Escolha uma soma</option>' + sums.map(({ sum, count }) => `<option value="${sum}">${sum} — ${count} ${count === 1 ? "ocorrência" : "ocorrências"}</option>`).join("");
}

export function buildGeneratorRows(games) {
  return games.map((game, index) => `
    <tr data-generated-game="${index + 1}" class="odd:bg-white even:bg-slate-50 border-b border-slate-200">
      <th scope="row" class="px-4 py-4 text-left font-medium">${index + 1}</th>
      <td class="whitespace-nowrap px-4 py-4">${game.matriz.join(" ")}</td>
      <td class="whitespace-nowrap bg-amber-50 px-4 py-4 text-lg font-semibold">${game.numbers.map(number => String(number).padStart(2, "0")).join(" ")}</td>
      <td class="px-4 py-4 text-right text-lg font-semibold">${game.sum}</td>
      <td class="px-4 py-4">${game.contests.length ? `${game.contests.length === 1 ? "Concurso" : "Concursos"} ${game.contests.join(", ")}` : "Não encontrado na base"}</td>
    </tr>`).join("");
}

export function buildGeneratorResultSummary({ games, totalValid }, requested) {
  if (!totalValid) return "Nenhuma combinação atende a todos os critérios deste conjunto.";
  const generated = `${games.length} ${games.length === 1 ? "jogo gerado" : "jogos gerados"}`;
  const total = `${totalValid.toLocaleString("pt-BR")} combinações válidas`;
  if (totalValid < requested) return `${generated}. Existem apenas ${total}; todas estão listadas.`;
  return `${generated} de ${total}. Sem repetições neste lote; ordenados pela soma.`;
}
