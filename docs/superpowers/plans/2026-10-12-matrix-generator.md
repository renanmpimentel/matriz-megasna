# Gerador de matrizes 6x6 — plano aprovado

## Objetivo

Nova aba Gerador, somente local, preservando layout e dados atuais. Entrada de seis dígitos distintos (padrão 123450) e quantidade inteira de 1 a 100 (padrão 10). Intervalo inclusivo inicia com os limites históricos do conjunto exato. Sem histórico, bloquear e explicar. Para a base atual: 64 sorteios, somas 69 a 249.

Adição solicitada durante a implementação: permitir edição de mínimo/máximo, inclusive igualdade para soma exata; seleção de todas as somas empatadas na maior frequência; botão Restaurar intervalo histórico; botão Calcular total independente da quantidade de jogos. Padrão informado ao usuário: permitir sair do histórico dentro de 21–345 (limites físicos de seis dezenas distintas). Pergunta opcional apresentada; sem resposta até o momento. Mostrar total exato para os dígitos/limites atuais, invalidando-o ao editar. Para123450: 852.368 possibilidades em69–249; 8.990 para soma145. Contagem verificada por enumeração independente sem poda.

Cada combinação contém seis dezenas distintas de 01 a 60, em ordem crescente, usando todos e somente os seis dígitos informados (incluindo zero à esquerda). Reutilizar cálculo de matriz dos sorteios. Não repetir combinações no lote; permitir repetição entre lotes e jogos históricos, identificando todos os concursos correspondentes.

## Implementação

- [x] Núcleo testado em generator-core.js e matrix-core.js: normalização/contexto, quantidade, enumeração de combinações por máscara de dígitos, limites inclusivos e reservoir sampling uniforme com memória proporcional à quantidade. Retornar games e totalValid. Ordenar saída por soma, depois dezenas.
- [x] Execução em generator-worker.js, controle do ciclo em generator-runner.js: iniciar, concluir, cancelar/terminate, tratar erros e ignorar mensagens de execuções antigas.
- [x] Interface isolada em generator-view.js e generator-ui.js. Campos, intervalo/base histórica, botão Gerar matrizes, botão Cancelar e tabela Jogo/Matriz/Dezenas/Soma/Histórico. Estados acessíveis; edição cancela e limpa resultados; sair da aba cancela execução ativa e preserva lote já concluído. Informar insuficiência e zero resultados. Aviso: intervalo não é previsão.
- [x] Integrar main.js: adicionar aba, inicializar UI com allRows, usar buildMatrix compartilhado, preservar filtros/ordenação/telas atuais.
- [x] Revisão de especificação, depois qualidade. Rodar lint, typecheck, todos os testes e build. Browser: gerar 10/100, trocar dígitos, erros, cancelamento, histórico, regressões Sorteios/Estratégias/Dígitos, desktop e viewport estreito. Build Pages para validar URL do worker.

## Testes

TDD no núcleo, runner e renderização. Fixtures para bordas exatas, todos os dígitos, sem mutação, histórico repetido, quantidade insuficiente, validação e corrida/cancelamento. Navegador real usando o Web Worker; sem novo framework E2E. Entrega em http://localhost:5173/, sem merge, commit ou publicação.

## Resultado e autorização de publicação

80 testes passaram em Node24 local e Node22 (CI), lint/typecheck/build Pages aprovados, scanner sem segredos. Revisões de especificação e qualidade aprovadas. Browser real validou geração10/100, totais exatos, soma145, limites personalizados, histórico, insuficiência11, cancelamento e regressões. Em seguida o usuário solicitou explicitamente publicar tudo em produção; essa autorização substitui a restrição inicial de entrega somente local.
