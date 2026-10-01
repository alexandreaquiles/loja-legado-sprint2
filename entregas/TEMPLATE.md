# [Desafio S2] <seu-usuario>

Copie este arquivo para `entregas/<seu-usuario>.md`, preencha e apague as seções dos níveis que não fez. Missão, níveis e rubrica: card 06 do Trello.

**Privacidade:** a PR é pública. Não coloque nela código, métricas, políticas ou nomes internos da sua empresa: anonimize ou use o `loja-legado`; na dúvida, deixe de fora. Não rode código da empresa numa conta pessoal do Claude sem autorização do seu time de segurança.

- **Usuário:** @<seu-usuario>
- **Repositório:** <anonimizado> ou "loja-legado"
- **Trilha:** dev | líder

## 📐 N1 · Tool Designer

- MCPs avaliados pelos 6 critérios (quem mantém e comunidade, último commit, quantidade de tools, clareza das descrições, permissões, testes), com o veredito manter / filtrar / remover:
- Tools e tokens das definições antes → depois (−X%), com o tool search desligado nas duas medidas:
- Comando que gera o número:

## 🔌 N2 · Conector

- Fonte conectada:
- PRD (link ou caminho no repositório):
- Print do Inspector (tools listadas e uma chamada recusada pela validação):
- Número antes → depois e o comando que o gera:

## 🛡️ N3 · Guardião

- Opção: A (HTTP + OAuth) | B (trifecta)
- Fontes (URLs):
- Evidência (o fluxo funcionando e uma chamada recusada sem token, ou o teste antes → depois com o comando que reproduz):

## O que eu tiraria do inventário do meu time amanhã



## Níveis que declaro

Pela rubrica do card 06: o grau mínimo vale o badge; o exemplar concorre ao showcase.

| Nível | Grau (mínimo / sólido / exemplar) |
|---|---|
| N1 | |
| N2 | |
| N3 | |

## Autoavaliação (marque antes de abrir a PR)

- [ ] Sei quantas tools o agente vê na minha sessão e quanto as definições custam, com e sem o tool search.
- [ ] Cada tool minha tem nome verbo_objeto e descrição que diz o que faz, quando usar e o que retorna.
- [ ] Nenhum parâmetro é string livre onde um enum caberia, e todo erro diz como corrigir a chamada.
- [ ] Nenhum segredo em arquivo versionado; o token que uso expira.
- [ ] Todo número que cito vem com o comando que o gerou.
- [ ] No N3, cito as fontes com URL e sei dizer qual dos três ingredientes a minha defesa quebra (opção B) ou o que o servidor valida antes de aceitar uma chamada (opção A).
- [ ] Nada da minha empresa aparece na PR sem anonimizar: ela é pública.
