@AGENTS.md

## Claude Code neste repositório

- Hooks em `.claude/settings.json`: `guard.sh` bloqueia comandos da lista "Nunca"; `test-after-edit.sh` roda `npm test` depois de cada Edit/Write em `src/` ou `test/`; `stop-gate.sh` não deixa encerrar com teste vermelho (até 3 voltas; em plan mode não roda). Se um hook devolver erro, leia o motivo e corrija; não tente contornar.
- O `.env` está negado em `permissions.deny`: não tente ler por outro caminho.
- Tarefa com spec: planeje em `docs/plano.md` antes de implementar. Antes de dizer pronto, peça ao subagente `revisor-codigo` para revisar o diff contra a spec.

## Servidor MCP do time

- `tools/revisor-mcp/` é o servidor MCP `revisor` (stdio, dados em `data/*.json`): regras de revisão, ADRs e histórico de reviews do time `loja`. O `.mcp.json` escolhe a versão (`src/index-inchado.js` ou `src/index.js`). Depois de mudar o `.mcp.json`, saia e abra o `claude` de novo.
- `npm run smoke` sobe o servidor sem LLM, chama as tools e imprime os tokens estimados; `npm run conferir -- NN` confere um card.
- `tools/catalogo-mcp/` é o servidor MCP `catalogo` (stdio, somente leitura sobre o `vendure.sqlite`): variantes, SKUs e preços em centavos do canal padrão. Use `count_variants_by_price` para medir o impacto de um valor mínimo de promoção e `search_catalog_variants` para exemplos reais em testes. Não leia o `vendure.sqlite` por outro caminho. PRD em `docs/prd-catalogo-mcp.md`; `npm --prefix tools/catalogo-mcp run smoke` testa sem LLM.
- Os conectores do claude.ai ficam desligados neste projeto (`disableClaudeAiConnectors` no `.claude/settings.json`): o agente vê só os 7 tools de `revisor` e `catalogo`.
