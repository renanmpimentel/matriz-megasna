# Mega-Sena Web (Vite)

Aplicacao web para consulta de sorteios, com filtros e paginacao.

- `Matriz 1..6`
- `Soma`
- `Tipo`
- `Digitos`

## Aba Estrategias

A aba `Estrategias` agrupa os sorteios pela matriz completa (`Matriz 1..6`) e gera um ranking historico.

- `Estrategia`: chave da matriz no formato `m1-m2-m3-m4-m5-m6`
- `Vitorias`: quantidade de sorteios em que a estrategia apareceu
- `%`: participacao da estrategia sobre o total de sorteios avaliados
- `Ultima ocorrencia`: concurso mais recente da estrategia
- `Concursos`: lista de concursos em que a estrategia ocorreu

Observacao: o ranking mede recorrencia historica de padrao. Ele nao faz previsao de premio.

## Deploy no GitHub Pages

O repositório inclui o workflow `.github/workflows/deploy-gh-pages.yml` para publicar `web/dist` automaticamente.

1. No GitHub, abra **Settings > Pages**.
2. Em **Build and deployment**, selecione **Source: GitHub Actions**.
3. Faça push para a branch `main`.

O site sera publicado na URL do Pages do repositorio.

## Rodar local com Docker

```bash
docker run --rm -it -p 5173:5173 -v "$(pwd)/web:/app" -w /app node:22-alpine sh -lc "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
```

Abra `http://localhost:5173`.

## Build com Docker

```bash
docker run --rm -v "$(pwd)/web:/app" -w /app node:22-alpine sh -lc "npm install && npm run build"
```

Saida em `web/dist`.

## Atualizar sorteios online

Atualiza `public/data/sorteios.json` buscando apenas concursos novos (do ultimo salvo ate o ultimo disponivel):

```bash
docker run --rm -v "$(pwd)/web:/app" -w /app node:22-alpine sh -lc "npm run sync:data"
```

Obs.: o `npm run build` ja executa essa sincronizacao automaticamente antes do build.
