# Gerador de matrizes em Web Worker

Status: aceito para implementação local do gerador solicitado.

## Contexto

A aplicação é estática (Vite/GitHub Pages) e já carrega o histórico completo. Calcular o total exato exige visitar muitas combinações, enquanto a interface deve continuar navegável e permitir cancelamento.

## Decisão

Executar enumeração e reservoir sampling em um Web Worker de módulo, criado por URL relativa resolvida pelo Vite. O núcleo de cálculo permanece puro e testável em Node; a matriz é compartilhada com os sorteios existentes. Um controlador termina o worker ao cancelar/trocar entradas e usa sua identidade para ignorar mensagens antigas. Não adicionar servidor, dependência externa ou armazenamento dos jogos.

## Consequências

A contagem é exata; a seleção é uniforme sem reposição dentro do lote e usa memória proporcional à quantidade pedida. O worker compilado deve ser verificado também com a base de URL do GitHub Pages. Resultados são temporários, sem garantia de não repetição entre lotes. Frequência histórica não implica previsão.
