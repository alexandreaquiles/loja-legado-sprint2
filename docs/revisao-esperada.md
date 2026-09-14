# Revisão esperada · branch `feature/frete-gratis`

A revisão esperada do PR (decisão, as 9 violações com `arquivo:linha` e id, a manipulação trecho a trecho e o que não deve aparecer) fica **fora deste repositório**, no Gabarito da tarefa 04 do Trello.

Por quê: a revisão é feita por um agente com acesso ao git. Se a resposta estivesse aqui, um `git show gabarito:docs/revisao-esperada.md` a entregaria ao revisor, e a revisão deixaria de medir o prompt. Pelo mesmo motivo, `get_pr_diff` só aceita branches `feature/…`.

O que este gabarito versiona para a tarefa 04 é o prompt: `tools/revisor-mcp/src/prompts/secure-code-review.js`. A sua revisão entra no histórico local (`tools/revisor-mcp/data/review-history.json`) e o `npm run conferir -- 04` olha a mais recente.
