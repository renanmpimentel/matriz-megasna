# Mega-Sena Web (Vite)

Aplicacao web para consulta de sorteios, com filtros e paginacao.

- `Matriz 1..6`
- `Soma`
- `Tipo`
- `Digitos`

## Estrategias vencedoras

Na aba `Campeoes`, o ranking mostra:

- `Time/jogo`: formato `012345/jogo N da mega`
- `Matriz/jogo`: formato `15-15-41-44-52-63/jogo N da mega sena`
- `Outros times vencedores`: mesma estrategia (matriz) aplicada em outros jogos vencedores

A melhor estrategia fica no topo do ranking (score ponderado por frequencia + recencia).

## Deploy no GitHub Pages

O repositório inclui o workflow `.github/workflows/deploy-gh-pages.yml` para publicar `web/dist` automaticamente.

1. No GitHub, abra **Settings > Pages**.
2. Em **Build and deployment**, selecione **Source: GitHub Actions**.
3. Faça push para a branch `main`.

O site sera publicado na URL do Pages do repositorio.

### Validacao em producao

O workflow faz:

1. `lint`
2. `typecheck`
3. `test`
4. `build:static`
5. deploy no Pages
6. smoke-check da URL publicada

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
