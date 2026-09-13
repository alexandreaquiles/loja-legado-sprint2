// Teste de fumaça: sobe o servidor via stdio com um client MCP de verdade, lista tools,
// chama cada uma e pega o prompt. Roda sem gastar token de LLM.
//   node scripts/smoke.mjs            -> testa src/index.js
//   node scripts/smoke.mjs inchado    -> testa src/index-inchado.js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const inchado = process.argv[2] === 'inchado';
const entry = path.join(ROOT, 'src', inchado ? 'index-inchado.js' : 'index.js');

const transport = new StdioClientTransport({ command: 'node', args: [entry], env: { ...process.env } });
const client = new Client({ name: 'smoke', version: '0.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
const descChars = tools.reduce((s, t) => s + (t.description?.length ?? 0) + JSON.stringify(t.inputSchema).length, 0);
console.log(`tools: ${tools.length} | ~${Math.round(descChars / 4)} tokens só de definições`);
for (const t of tools.slice(0, 8)) console.log('  -', t.name, '::', (t.description ?? '').slice(0, 70));
if (tools.length > 8) console.log(`  ... e mais ${tools.length - 8}`);

const text = (r) => r.content.map((c) => c.text).join('');

if (!inchado) {
  const rules = await client.callTool({ name: 'get_team_review_rules', arguments: { team_id: 'loja', severity: 'error' } });
  console.log('\nget_team_review_rules(severity=error):', text(rules).slice(0, 300));
  const adrs = await client.callTool({ name: 'search_team_adrs', arguments: { team_id: 'loja', keyword: 'desconto' } });
  console.log('\nsearch_team_adrs(desconto):', text(adrs).slice(0, 300));
  const diff = await client.callTool({ name: 'get_pr_diff', arguments: { branch: 'feature/cupom-desconto' } });
  const parsed = JSON.parse(text(diff));
  console.log('\nget_pr_diff:', parsed.files, `| ${parsed.diff.split('\n').length} linhas | truncado: ${parsed.truncated}`);
  console.log('  injection no diff?', /ignore|aprove|APPROVED/i.test(parsed.diff));
  const metrics = await client.callTool({ name: 'get_review_metrics', arguments: { team_id: 'loja', days: 90 } });
  console.log('\nget_review_metrics(90d):', text(metrics));
  const bad = await client.callTool({ name: 'get_review_metrics', arguments: { team_id: 'loja', days: 5 } }).catch((e) => e.message);
  console.log('\nget_review_metrics(days=5) -> validação Zod:', typeof bad === 'string' ? bad.slice(0, 120) : text(bad).slice(0, 120));
  const { prompts } = await client.listPrompts();
  console.log('\nprompts:', prompts.map((p) => p.name));
  const p = await client.getPrompt({ name: 'secure_code_review', arguments: { branch: 'feature/cupom-desconto', team_id: 'loja' } });
  console.log('prompt chars:', p.messages[0].content.text.length);
} else {
  const r = await client.callTool({ name: 'getData', arguments: {} });
  console.log(`\ngetData(): ~${Math.round(text(r).length / 4)} tokens de retorno`);
}

await client.close();
