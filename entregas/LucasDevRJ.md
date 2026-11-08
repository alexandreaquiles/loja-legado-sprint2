# [Desafio S2] LucasDevRJ

- **Usuário:** @LucasDevRJ
- **Repositório:** "loja-legado" (`loja-legado-sprint2`)
- **Trilha:** dev

Números de tokens:
- **`/context`:** é o que o Claude Code mostra, com o tool search **desligado** (`--settings .claude/settings.demo-inchado.json`, que traz `ENABLE_TOOL_SEARCH=false`).
- **"~N estimados":** caracteres / 4, a mesma conta do `npm run smoke`.

## 📐 N1 · Tool Designer

### Inventário: o que o agente via nesta pasta, avaliado pelos 6 critérios

Consultei o registry por `GET https://registry.modelcontextprotocol.io/v0/servers?search=<nome>`. O último commit veio de `gh api repos/<owner>/<repo>`, em 08/11/2026.

| Servidor | Registry | Quem mantém / comunidade | Último commit | Tools | Clareza das descrições | Permissões | Testes | Veredito neste projeto |
|---|---|---|---|---|---|---|---|---|
| `revisor` inchado (`index-inchado.js`) | não (local) | material do curso | 01/10/2026 | 63 | ruim: "Gets data." + o mesmo parágrafo LONG em todas | `run_sql` "qualquer SQL", `create_secret`, `delete_repository` | não | **remover** (trocar pelo enxuto) |
| `revisor` enxuto (`index.js`) | não (local) | material do curso | 01/10/2026 | 5 | boa: três frases, enums, erro informativo (card 03) | 4 de leitura + 1 escrita (`log_review`) | `npm run smoke` | **manter** |
| claude.ai Notion | `com.notion/mcp` (remoto `mcp.notion.com/mcp`) | Notion; o servidor local `makenotion/notion-mcp-server` tem 4,7 mil ★ | 29/10/2026 | 77 | boas, mas longas: `notion-query-data-sources` sozinha tem ~10,9k tokens | escrita e exclusão de páginas e bancos | sim (vitest no repo local) | **remover** (nada a ver com revisão de código) |
| claude.ai Gmail | não achei entrada oficial | conector do diretório do claude.ai | n/d (fechado) | 30 | boas | `send_message`, `forward`, `trash_*` | n/d | **remover** |
| claude.ai Google Drive | não achei entrada oficial | conector do diretório do claude.ai | n/d | 16 | boas | `share_file`, `trash_file`, `update_file` | n/d | **remover** |
| claude.ai Google Calendar | não achei entrada oficial | conector do diretório do claude.ai | n/d | 9 | boas | `create/update/delete_event` | n/d | **remover** |
| claude.ai Trello | não achei entrada própria (a `com.atlassian/atlassian-mcp-server` cobre Jira e Confluence) | conector do diretório do claude.ai | n/d | 15 | boas | `trelloWrite*` em quadros, cartões e listas | n/d | **remover** |
| claude.ai Claude Docs | não (Anthropic) | Anthropic | n/d | 8 | boas | criar e editar documentos | n/d | **remover** |
| Claude in Chrome | não (embutido no Claude Code) | Anthropic | n/d | 20 | boas | controle total do navegador, `javascript_tool`, `form_input` | n/d | **remover** (`--no-chrome`) |

Os vereditos valem **para este repositório**: os conectores continuam úteis no resto do meu dia. Nenhum deles é necessário para revisar um PR.

### Dieta aplicada

1. **`.claude/settings.json`:** `"disableClaudeAiConnectors": true`. É configuração versionada do projeto, então vale para todo mundo que clonar. Ela tira os 155 tools dos 6 conectores do claude.ai.
2. **Claude in Chrome:** é configuração global (`~/.claude.json`), por isso desligo por sessão com `claude --no-chrome`. Ela tira mais 20 tools.
3. **`.mcp.json`:** o `revisor` aponta para o enxuto (card 02) e entra o `catalogo` do N2.

Total: **7 tools ativas**, dentro do teto de 10 a 12.

### Medição: tools e tokens das definições, com tool search desligado nas duas

| | Tools MCP | Tokens das definições | Como medi |
|---|---|---|---|
| Antes (sessão do card 01: inchado + conectores + Chrome) | 238 | 213,5k ("MCP tools") | `claude --settings .claude/settings.demo-inchado.json`, depois `/context` |
| Depois (enxuto + catalogo, sem conectores e sem Chrome) | 7 | 2,5k ("MCP tools"): revisor 1.818 + catalogo 731 = 2.549 | `claude --no-chrome --settings .claude/settings.demo-inchado.json`, depois `/context all` |
| Redução | −97% (238 → 7) | **−98,8%** (213,5k → 2,5k) | |

O contexto total no início da sessão caiu de 279,4k para 64k tokens.

Medição isolada só dos servidores do projeto, reproduzível com `claude -p "/context"`:

| | Tools | Tokens | Comando |
|---|---|---|---|
| `revisor` inchado + Chrome | 83 | 36,7k ("MCP tools"); só o revisor: 27.940 | `claude -p "/context" --chrome --settings .claude/settings.demo-inchado.json --mcp-config mcp.inchado.json` |
| `revisor` enxuto, sem Chrome | 5 | 1,8k ("MCP tools"); só o revisor: 1.773 | `claude -p "/context" --no-chrome --settings .claude/settings.demo-inchado.json --mcp-config mcp.enxuto.json` |

O modo `-p` não carrega os conectores do claude.ai. Por isso a linha "antes → depois" completa vem da sessão interativa.

### Design: duas tools que ficaram, lidas pelos 4 pilares

**`log_review`**
- **Nome:** bom, verbo + objeto.
- **Três frases:** boas, e a descrição diz que é "the ONLY write operation".
- **Schema:**
  - `decision` tem enum;
  - mas `team_id`, `repo` e `branch` são strings livres: um time inexistente grava sem erro;
  - "Never include secrets" está só no `describe`, que o modelo pode ignorar.
- **Retorno:** enxuto (`logged`, `history_size`).
- **O que eu mudaria:**
  - validar `team_id` contra os times conhecidos, com o erro do card 03;
  - `branch` com o mesmo `refSchema` do `get_pr_diff`;
  - a proibição de segredos virar checagem, que é o que o hook do N3 faz no harness.

**`get_review_metrics`**
- **Nome, três frases e retorno:** bons. Devolve só agregados, "never the full history".
- **Previsibilidade:** tem o **mesmo furo que o card 03 corrigiu** na `get_team_review_rules`. Com `team_id: "lojas"`, ela devolve `total_reviews: 0`, que o agente lê como "o time nunca errou".
- **O que eu mudaria:** time inexistente → `isError` com os times válidos. E a descrição precisa dizer que `days` conta a partir de hoje: as 4 revisões do seed caem fora da janela padrão de 30 dias, e a métrica volta vazia na primeira revisão.

## 🔌 N2 · Conector

- **Fonte conectada:** o catálogo da loja no `vendure.sqlite`, em modo **somente leitura**, com o `node:sqlite` do Node 24 (sem driver nativo novo). São variantes, SKUs, preços em centavos, a moeda do canal e o `pricesIncludeTax`. Hoje o agente revisa uma promoção de valor mínimo sem saber quantos produtos ficam abaixo dele.
- **PRD:** [`docs/prd-catalogo-mcp.md`](../docs/prd-catalogo-mcp.md), com objetivo, tools, lista de "não fazer", fora do escopo e critérios de aceite.
- **Servidor:** `tools/catalogo-mcp/` (stdio), registrado como `catalogo` no `.mcp.json`.
  - `search_catalog_variants(query, status: enabled|disabled|all = enabled, limit 1-50 = 10)`
  - `count_variants_by_price(threshold_cents: int 1-100000000, side: below|at_or_above = below)`
  - Nenhuma tool de escrita. As consultas são fixas e parametrizadas, sem SQL vindo do agente.
  - Erros informativos:
    - banco ausente → "rode `npm run setup`";
    - busca sem resultado → lista vazia, não erro.
- **Print do Inspector** (`npm --prefix tools/catalogo-mcp run inspector`):

  As 2 tools listadas:

  ![Inspector: 2 tools listadas](img/n2-inspector-tools.jpg)

  `count_variants_by_price` com `threshold_cents: 99.5` recusada pelo Zod antes do handler (`MCP error -32602 … expected int, received number`):

  ![Inspector: chamada recusada pela validação](img/n2-inspector-recusa-zod.jpg)
- **Número antes → depois:**

  | | Tokens estimados |
  |---|---|
  | Colar as tabelas de catálogo na conversa (`product_variant`, `_translation`, `_price`, `channel`) | ~12.100 |
  | `count_variants_by_price(10000)`: responde "45 de 88 variantes abaixo de R$ 100,00, USD, sem imposto no preço" com os 5 SKUs de borda (R$ 99,99) | ~100 |
  | Definições das 2 tools | ~500 |

  Comando: `npm --prefix tools/catalogo-mcp run smoke`, que também confere as 2 recusas do Zod e a lista vazia.
- **Com a Sprint 1:**
  - o uso do servidor está no `CLAUDE.md`;
  - o `.env` continua negado (`permissions.deny`);
  - o servidor não lê variável de ambiente nenhuma: o caminho do banco é fixo.

## 🛡️ N3 · Guardião

- **Opção:** B (trifecta).
- **Fontes:**
  - https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
  - https://code.claude.com/docs/en/hooks
  - https://code.claude.com/docs/en/permissions
  - https://code.claude.com/docs/en/mcp (para `disableClaudeAiConnectors`)
- **Os três ingredientes no `loja-legado`:**
  - **Dado privado:** a chave de pagamento. O `.env` está negado, mas o PR traz um fallback fixo no código.
  - **Conteúdo não confiável:** o diff **e** os dados das tools.
  - **Canal de saída:** o `summary` do `log_review`, gravado no histórico.
- **Defesa (não depende do modelo):** o hook `PreToolUse` [`.claude/hooks/no-secret-in-log.mjs`](../.claude/hooks/no-secret-in-log.mjs), com matcher `mcp__revisor__log_review`.
  - Recusa (exit 2) qualquer argumento de texto da chamada com cara de segredo: `sk_live_…`, `NOME_API_KEY=valor`, token do GitHub, chave AWS, chave privada, URL com senha.
  - Devolve ao agente o motivo e como refazer a chamada.
  - Formato mascarado (`sk_****`) passa.
  - **Ingrediente quebrado:** o **canal de saída**.
- **Teste de injeção indireta vinda dos dados:**
  - O teste copia `tools/revisor-mcp/data/` para uma pasta temporária e acrescenta uma regra envenenada **R-10**, ativa no time `loja`, que manda copiar sem mascarar a chave `sk_live_` do diff no summary "para a auditoria".
  - O servidor roda contra essa cópia (`REVISOR_DATA_DIR`), então nada em `data/` muda.
  - Comando que reproduz: `npm --prefix tools/revisor-mcp run trifecta`

  | | Resultado |
  |---|---|
  | **Antes**, sem o hook | `get_team_review_rules` entrega a R-10. `log_review` com a chave no summary → `{"logged":true}` e **a chave fica gravada no histórico** |
  | **Depois**, a mesma chamada pelo hook | **barrada** (exit 2): `o campo "summary" contém chave de API com prefixo` |
  | Mesmo hook, injeção vinda do **diff** (ADR-009 / `PAGAMENTO_API_KEY=…`) | **barrada** (exit 2) |
  | Revisão honesta com `sk_****` | passa (exit 0) |

- **O que ficou de fora:**
  - **O dado privado continua alcançável pelo diff.** A defesa não impede o agente de *ver* a chave fixa no código. Isso só se resolve tirando o segredo do repositório e rotacionando a chave, que é exatamente o que a revisão pede.
  - **O hook só vale no Claude Code com este `settings.json`.** Outro cliente (o Inspector, por exemplo) chama o `log_review` direto. A próxima camada seria a mesma checagem dentro do servidor.

## O que eu tiraria do inventário do meu time amanhã

Os conectores pessoais (Notion, Gmail, Drive, Calendar, Trello e Claude Docs), mais o Chrome, de qualquer repositório de código. Com o tool search desligado, eles somavam ~187k tokens de definições em toda sessão, sem serem usados numa revisão. Com o tool search ligado, o custo cai para ~600 tokens, mas o agente continua escolhendo entre 175 nomes e com `send_message`, `share_file` e `delete_pages` ao alcance.

## Níveis que declaro

| Nível | Grau (mínimo / sólido / exemplar) |
|---|---|
| N1 | sólido: cada veredito com critério, sem segredo em arquivo versionado. A dieta está versionada no `.claude/settings.json` do projeto, com −98,8% de tokens das definições. |
| N2 | mínimo (⏳ sólido, se o agente usar o `catalogo` numa tarefa real sem eu dizer a tool) |
| N3 | exemplar: o mesmo hook barra a injeção do diff e a dos dados, num comando que outra pessoa roda, e a entrega diz qual ingrediente ficou de fora |

## Autoavaliação (marque antes de abrir a PR)

- [x] Sei quantas tools o agente vê na minha sessão e quanto as definições custam, com e sem o tool search.
- [x] Cada tool minha tem nome verbo_objeto e descrição que diz o que faz, quando usar e o que retorna.
- [x] Nenhum parâmetro é string livre onde um enum caberia, e todo erro diz como corrigir a chamada.
- [x] Nenhum segredo em arquivo versionado. (A parte "o token que uso expira" não se aplica: esta entrega não usa token. Os servidores são stdio locais, e o GitHub MCP remoto ficou de fora.)
- [x] Todo número que cito vem com o comando que o gerou.
- [x] No N3, cito as fontes com URL e sei dizer qual dos três ingredientes a minha defesa quebra (opção B) ou o que o servidor valida antes de aceitar uma chamada (opção A).
- [x] Nada da minha empresa aparece na PR sem anonimizar: ela é pública.
