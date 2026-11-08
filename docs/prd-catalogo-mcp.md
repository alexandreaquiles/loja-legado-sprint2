# PRD · servidor MCP `catalogo` (Desafio S2 · N2)

## Objetivo

Dar ao agente o contexto do **catálogo da loja** (variantes, SKUs e preços em centavos) na hora de revisar ou escrever uma promoção, sem colar tabelas na conversa nem abrir o banco por conta própria.

Hoje o agente revisa uma promoção como a de frete grátis acima de R$ 100,00 sem saber:
- quantas variantes ficam abaixo do mínimo;
- qual é a moeda do canal;
- se o canal usa `pricesIncludeTax`.

Para descobrir, ele teria que ler o `vendure.sqlite` direto: um arquivo binário, fora das tools, sem limite de tamanho.

## Usuários

- O agente (Claude Code), revisando um PR de promoção com o servidor `revisor` ou escrevendo uma `PromotionCondition`.
- A pessoa dev, perguntando "quantos produtos ficam de fora se o mínimo for X?".

## Tools (stdio, somente leitura)

### 1. `search_catalog_variants`
- **Faz:** busca variantes do catálogo por nome ou SKU.
- **Use quando:** precisar de exemplos reais de produto e preço para um teste ou para um comentário de revisão.
- **Retorna:** `{ variants: [{ sku, name, price_cents, enabled }], count, truncated }`, ordenadas por preço.
- **Parâmetros:**
  - `query`: 2 a 50 caracteres;
  - `status`: enum `enabled` | `disabled` | `all`, padrão `enabled`;
  - `limit`: de 1 a 50, padrão 10.

### 2. `count_variants_by_price`
- **Faz:** conta quantas variantes ficam abaixo de um valor, ou a partir dele, no canal padrão.
- **Use quando:** avaliar o impacto de uma condição de valor mínimo, como frete grátis ou `minimum_order_amount`.
- **Retorna:** `{ threshold_cents, side, count, total, currency, prices_include_tax, examples }`. `examples` traz no máximo 5 SKUs, os mais próximos do limite.
- **Parâmetros:**
  - `threshold_cents`: inteiro de 1 a 100000000;
  - `side`: enum `below` | `at_or_above`, padrão `below`.

## Restrições ("não fazer")

- Não escrever no banco: abrir o SQLite em `readOnly`. Nenhuma tool de escrita.
- Não aceitar SQL nem nome de tabela vindo do agente: as consultas são fixas e parametrizadas.
- Não devolver metadata (`createdAt`, ids internos, assets) nem o catálogo inteiro: sempre com `limit` e só os campos listados.
- Não ler `.env`: o caminho do banco é `vendure.sqlite` na raiz do repositório, e não vem de variável de ambiente.
- Não instalar driver nativo novo: usar o `node:sqlite` do Node 24.
- Não registrar nada no `promotionOptions` nem tocar em `src/`.

## Fora do escopo

- Promoções, pedidos e clientes. As promoções existentes também ficam de fora: a tabela está vazia no seed.
- Impostos por zona, estoque e assets.
- Transporte HTTP e autenticação.

## Critérios de aceite

1. O servidor sobe por stdio, e o Inspector lista exatamente 2 tools.
2. As duas tools seguem os 4 pilares:
   - nome verbo_objeto;
   - descrição em três frases;
   - Zod com `enum`, `default`, limite e `describe`.
3. Uma chamada inválida, como `threshold_cents: 99.5` ou `side: "under"`, é recusada pelo Zod antes do handler.
4. Busca sem resultado devolve lista vazia. Banco ausente devolve erro informativo que manda rodar `npm run setup`.
5. Há um smoke sem LLM (`npm --prefix tools/catalogo-mcp run smoke`), que imprime os tokens estimados do retorno de cada tool contra o dump das tabelas de catálogo.
6. O uso do servidor fica registrado no `CLAUDE.md`, e o `.env` continua negado.
