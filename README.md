# loja-legado · Projeto prático da Sprint 2

Conecta+ #11 · Engenharia de Software com IA · **Tools que o agente sabe usar: MCP como parte do harness**

Este é o repositório do projeto prático da Sprint 2. A loja (Vendure 3.7, SQLite) já tem o harness da Sprint 1: `CLAUDE.md` enxuto, hooks e um revisor só-leitura. Agora o agente precisa revisar um PR (`feature/cupom-desconto`, a tentativa do time de fazer o cupom) usando o contexto do time: regras de revisão, ADRs e histórico de reviews, que vivem num servidor MCP em `tools/revisor-mcp/`. O servidor começa inchado de propósito (63 tools) e o PR em revisão tenta enganar o revisor. As tarefas estão no board do Trello; na aula ao vivo o professor resolve as tarefas essenciais neste mesmo repositório.

| | |
|---|---|
| Board do projeto (Trello) | https://trello.com/b/IFe4ecVd |
| Curso base na Alura | [Engenharia de software na era da IA: MCP servers, tools e integrações para agentes de IA](https://cursos.alura.com.br/course/ia-mcp-servers-tools-integracao) (18h estimadas; a seção de Supabase é opcional para este projeto) |
| Lançamento | segunda, 05/10/2026 |
| Aula ao vivo | quinta, 15/10/2026, 9h–10h |
| Entrega do Desafio | sexta, 16/10/2026, no Discord da turma |

## Preparar o ambiente

Você precisa de Node.js 22.12 ou mais novo, git e [Claude Code](https://code.claude.com) (com conta Claude Pro ou chave de API). Não precisa de Docker nem de banco de dados: a loja usa SQLite.

```bash
git clone https://github.com/alexandreaquiles/loja-legado-sprint2.git
cd loja-legado-sprint2
npm install       # ~2 minutos e ~800 MB: o Vendure inteiro vem em node_modules
npm run setup     # .env (segredos falsos), vendure.sqlite (54 produtos) e npm install em tools/revisor-mcp
npm test          # 5 testes verdes, em menos de 1 segundo
npm run dev       # sobe a loja: http://localhost:3000/dashboard (superadmin / superadmin)
cd tools/revisor-mcp && npm run smoke && cd ../..   # sobe o servidor MCP enxuto e chama cada tool, sem LLM
claude            # abre o agente; aprove o servidor MCP "revisor" quando ele perguntar
```

`npm run inspector` dentro de `tools/revisor-mcp` abre o MCP Inspector no navegador (baixa na primeira vez). Com a loja no ar: `http://localhost:3000/dashboard` é o admin, `http://localhost:3000/graphiql` tem o Shop API e o Admin API para consultar. Pare com `Ctrl+C`. Se o `better-sqlite3` não compilar na sua máquina, avise no Discord: há um plano B com `sql.js`.

## As tarefas

Copie o board do Trello para a sua conta e mova os cards. Resumo:

| # | tarefa | etiqueta |
|---|---|---|
| 00 | Preparar o ambiente e rodar o smoke | Essencial |
| 01 | Sentir o problema: o servidor inchado no `/context`, `getData` que devolve tudo, o PR que pede aprovação | Essencial |
| 02 | Dieta de tools: trocar para o servidor enxuto (`mcp.enxuto.json`) e medir | Essencial |
| 03 | Tool como spec: nome, descrição em três frases, `enum`, retorno curto | Essencial |
| 04 | Prompt seguro: revisar a branch `feature/cupom-desconto` sem cair na injeção de prompt | Essencial |
| 05 | Intermediária: uma tool em três frases (feito na aula ao vivo) | Intermediária |
| 06 | Desafio: MCP Challenge, ligar o agente a uma fonte de contexto do seu time (badges 🔌 📐 🛡️ 🏆) | Desafio |

As tarefas essenciais são as que o professor resolve ao vivo na quinta. Tente antes: a aula rende muito mais quando você já esbarrou no problema.

## Branches

- `main`: o estado inicial, com o servidor inchado configurado em `.mcp.json`.
- `feature/cupom-desconto`: o PR em revisão (a tentativa do time de fazer o cupom). Não faça merge sem revisar.
- `gabarito`: configuração enxuta e o veredito de referência em `docs/revisao-esperada.md`.

## Como entregar o Desafio

Poste no Discord da turma até a sexta que fecha a sprint, com o template do card "Como entregar" no Trello. Quem terminar antes da aula pode mostrar ao vivo, se der tempo.

## Licença

O Vendure é GPLv3. Este repositório de exercício segue a mesma licença.

## Notas do time anterior

Loja no Vendure. Rodar com `npm run dev`. O dashboard é o antigo admin.

Os helpers de `src/misc/` são do relatório do financeiro, não mexer.

Ver com o Fulano antes de mexer no preco.
