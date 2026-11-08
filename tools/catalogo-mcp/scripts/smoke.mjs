// Teste de fumaça, sem LLM: sobe o servidor via stdio com um client MCP de verdade, lista as tools,
// chama cada uma, confere as recusas do Zod e compara o tamanho do retorno com o dump das tabelas de catálogo.
//   npm --prefix tools/catalogo-mcp run smoke
//
// Tokens estimados = caracteres / 4, arredondado à centena (a mesma conta do smoke do revisor-mcp).
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DB_FILE } from '../src/db.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = (chars) => Math.round(chars / 4 / 100) * 100;
const texto = (r) => (r.content ?? []).map((c) => c.text ?? '').join('\n');
const fmt = (n) => n.toLocaleString('pt-BR');

let falhas = 0;
const check = (ok, msg) => {
  if (!ok) falhas++;
  console.log(`  ${ok ? '✔' : '✘'} ${msg}`);
};

const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(ROOT, 'src', 'index.js')], stderr: 'ignore' });
const client = new Client({ name: 'smoke', version: '0.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
const defs = tools.reduce((s, t) => s + JSON.stringify({ name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema }).length, 0);
console.log('Inventário (tools/list)');
console.log(`  ${tools.length} tools · ~${fmt(tokens(defs))} tokens estimados de definições (${tools.map((t) => t.name).join(', ')})`);

// Alternativa sem servidor: colar as tabelas de catálogo inteiras na conversa (o que o agente faria lendo o banco).
const db = new DatabaseSync(DB_FILE, { readOnly: true });
const dump = ['product_variant', 'product_variant_translation', 'product_variant_price', 'channel']
  .map((t) => JSON.stringify(db.prepare(`select * from "${t}"`).all()))
  .join('\n');

const chamar = (name, args) => client.callTool({ name, arguments: args });
const r1 = await chamar('count_variants_by_price', { threshold_cents: 10000 });
const r2 = await chamar('search_catalog_variants', { query: 'laptop' });
const r3 = await chamar('search_catalog_variants', { query: 'zzzz-nao-existe' });
const r4 = await chamar('count_variants_by_price', { threshold_cents: 99.5 });
const r5 = await chamar('count_variants_by_price', { threshold_cents: 10000, side: 'under' });

console.log('Retornos');
console.log(`  dump das tabelas de catálogo: ~${fmt(tokens(dump.length))} tokens estimados`);
console.log(`  count_variants_by_price(10000): ~${fmt(tokens(texto(r1).length))} tokens · ${texto(r1)}`);
console.log(`  search_catalog_variants("laptop"): ~${fmt(tokens(texto(r2).length))} tokens`);

console.log('Checagens');
check(tools.length === 2, `2 tools listadas (${tools.length})`);
const c1 = JSON.parse(texto(r1));
check(!r1.isError && c1.count > 0 && c1.total > c1.count, `count_variants_by_price(10000, below): ${c1.count} de ${c1.total} variantes abaixo de 10000`);
const c2 = JSON.parse(texto(r2));
check(!r2.isError && c2.variants.length > 0 && c2.variants.every((v) => Object.keys(v).join() === 'sku,name,price_cents,enabled'), 'search_catalog_variants devolve só sku, name, price_cents, enabled');
check(!r3.isError && JSON.parse(texto(r3)).count === 0, 'busca sem resultado → lista vazia, não erro');
check(r4.isError === true, `threshold_cents 99.5 → recusado pelo Zod: ${texto(r4).slice(0, 90)}…`);
check(r5.isError === true, `side "under" → recusado pelo Zod: ${texto(r5).slice(0, 90)}…`);

await client.close();
console.log(falhas ? `\n✘ ${falhas} checagem(ns) falharam` : '\n✔ servidor ok');
process.exit(falhas ? 1 : 0);
