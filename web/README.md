# Mega-Sena Web (Vite)

Aplicacao web para consulta de sorteios, com filtros e paginacao.

- `Matriz 1..6`
- `Soma`
- `Tipo`
- `Digitos`

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
