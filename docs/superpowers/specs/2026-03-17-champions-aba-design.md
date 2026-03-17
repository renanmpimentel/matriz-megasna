# Design: Aba de Campeoes (Mega-Sena)

## Objetivo
Retomar o estado atual do projeto restaurando `web/src/main.js` e adicionar uma aba dedicada "Campeoes" que consome `buildChampionsRanking`.

## Escopo
- Manter a aba atual de sorteios com filtros e paginacao.
- Adicionar navegação por abas: `Sorteios` e `Campeoes`.
- Na aba `Campeoes`, mostrar ranking com controles de `N`, pesos e Top N.
- Exibir contadores de concursos validos e descartados.

## Fora de escopo
- Web Worker.
- Pre-calculo no build.
- Alterar pipeline de dados.

## Fluxo
1. Carregar sorteios de `data/sorteios.json`.
2. Renderizar aba de sorteios como hoje.
3. Converter dados e calcular ranking via `buildChampionsRanking`.
4. Recalcular quando controles da aba mudarem.

## Erros e estados vazios
- Sem concursos validos para o `N` selecionado: mostrar mensagem amigavel.
- Dados ausentes/invalidos: manter contadores e tabela vazia.

## Validacao
- Testes unitarios existentes de `champions.js` continuam verdes.
- Build do frontend sem erro.
