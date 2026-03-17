# Champions Tab Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar a app e entregar aba dedicada de vencedores usando o motor `buildWinnersScoreRanking`.

**Architecture:** Recriar `main.js` com duas abas no mesmo entrypoint, preservar a lógica de sorteios e adicionar um segundo fluxo de render para ranking. O cálculo permanece no front, com estado local simples e recomputação sob demanda.

**Tech Stack:** Vite, JavaScript ESM, Node test runner.

---

### Task 1: Restaurar entrypoint com abas

**Files:**
- Modify: `web/src/main.js`

- [ ] **Step 1: Reintroduzir estrutura base da UI**
- [ ] **Step 2: Adicionar navegação entre `Sorteios` e `Vencedores`**
- [ ] **Step 3: Manter render e filtros existentes de sorteios**

### Task 2: Integrar ranking de vencedores

**Files:**
- Modify: `web/src/main.js`
- Use: `web/src/winners.js`

- [ ] **Step 1: Adicionar controles da aba (N, pesos, Top N)**
- [ ] **Step 2: Calcular ranking com `buildWinnersScoreRanking`**
- [ ] **Step 3: Renderizar tabela de vencedores e estado vazio**

### Task 3: Verificação

**Files:**
- Test: `web/src/*.test.js`

- [ ] **Step 1: Rodar testes (`npm test`)**
- [ ] **Step 2: Rodar build (`npm run build:static`)**
- [ ] **Step 3: Reportar bloqueios de ambiente (se houver)**
