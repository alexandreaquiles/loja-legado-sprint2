# Intermediária · uma tool em três frases (referência)

A tool ruim, do servidor inchado (`tools/revisor-mcp/src/index-inchado.js`):

```
nome: getData
descrição: Gets data. (+ um parágrafo genérico de ~900 caracteres)
parâmetros: type (string, opcional, sem descrição)
retorno: o banco inteiro (regras, ADRs e histórico), com metadata
```

A tarefa: reescrever para o caso "regras de revisão do time" no template.

```
Nome (verbo_objeto):
Faz:
Use quando:
Retorna:
Um parâmetro com enum:
```

## Gabarito de referência

```
Nome: get_team_review_rules
Faz: retorna as regras ATIVAS de revisão de código de um time.
Use quando: for revisar um PR e precisar saber o que o time exige.
Retorna: lista de {id, category, severity, rule}; "error" bloqueia o PR, "warning" deve corrigir, "info" é desejável;
         erro com a lista de team_id válidos se o time não existir.
Parâmetro com enum: severity ∈ {error, warning, info}, opcional; omitido = todas.
```

A versão em código é `tools/revisor-mcp/src/tools/review-rules.js` desta branch: as três frases viram a `description`, o enum vira `z.enum([...]).optional().describe(...)`, e o limite vira `limit` (1 a 50, padrão 20).

## O que costuma faltar

- Dizer que só vêm regras **ativas** (a R-09 está desativada).
- Explicar o significado de cada valor do enum: para o modelo, `error` é só uma palavra.
- Dizer o que acontece quando o parâmetro é omitido.
- Um limite de quantidade.
- O que acontece quando o `team_id` não existe (o card 03 implementa).

## Como conferir com o agente

Cole a sua versão no Claude Code e pergunte: "Em que situação você chamaria esta tool? Que ambiguidade ainda vê?". A resposta é o feedback. Para comparar o custo, `npm run smoke` mostra `getData()` e `get_team_review_rules` em tokens estimados.
