import { z } from 'zod';
import { abrir, canalPadrao, VARIANTES } from '../db.js';

const erro = (text) => ({ isError: true, content: [{ type: 'text', text }] });
const json = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj) }] });
const SEM_BANCO =
  'Catalog database not found (vendure.sqlite at the repository root). Ask the dev to run "npm run setup", then call this tool again.';

export function registerCatalogTools(server) {
  server.registerTool(
    'search_catalog_variants',
    {
      title: 'Search Catalog Variants',
      description:
        'Searches the store catalog for product variants whose name or SKU contains the query, read-only. ' +
        'Use this when you need real products and prices for a test, a review comment or a promotion example. ' +
        'Returns { variants: [{ sku, name, price_cents, enabled }], count, truncated }, cheapest first; an empty list means nothing matches.',
      inputSchema: {
        query: z.string().trim().min(2).max(50).describe('Part of the variant name or SKU, case-insensitive (e.g. "laptop", "L2201").'),
        status: z
          .enum(['enabled', 'disabled', 'all'])
          .default('enabled')
          .describe('"enabled" = sellable variants (default); "disabled" = hidden from the shop; "all" = both.'),
        limit: z.number().int().min(1).max(50).default(10).describe('Max variants to return (1-50, default 10).'),
      },
    },
    async ({ query, status, limit }) => {
      const conn = abrir();
      if (!conn) return erro(SEM_BANCO);
      const filtro = status === 'all' ? '' : `and enabled = ${status === 'enabled' ? 1 : 0}`;
      const like = `%${query.toLowerCase()}%`;
      const linhas = conn
        .prepare(`select * from (${VARIANTES}) where (lower(name) like ? or lower(sku) like ?) ${filtro} order by price_cents, sku limit ?`)
        .all(like, like, limit + 1);
      const variants = linhas.slice(0, limit).map((v) => ({ ...v, enabled: Boolean(v.enabled) }));
      return json({ variants, count: variants.length, truncated: linhas.length > limit });
    }
  );

  server.registerTool(
    'count_variants_by_price',
    {
      title: 'Count Variants By Price',
      description:
        'Counts the enabled catalog variants priced below a threshold, or at or above it, in the default channel, read-only. ' +
        'Use this to measure the impact of a minimum order amount condition (e.g. free shipping above R$ 100,00 = 10000). ' +
        'Returns { threshold_cents, side, count, total, currency, prices_include_tax, examples } with up to 5 SKUs closest to the threshold.',
      inputSchema: {
        threshold_cents: z
          .number()
          .int()
          .min(1)
          .max(100_000_000)
          .describe('Threshold in integer minor units (cents), as the Promotion stores it: 10000 = 100.00.'),
        side: z
          .enum(['below', 'at_or_above'])
          .default('below')
          .describe('"below" = price < threshold (default; who does NOT reach the minimum); "at_or_above" = price >= threshold.'),
      },
    },
    async ({ threshold_cents, side }) => {
      const conn = abrir();
      if (!conn) return erro(SEM_BANCO);
      const cond = side === 'below' ? 'price_cents < ?' : 'price_cents >= ?';
      // Exemplos mais próximos do limite: são os casos de borda que um teste de promoção precisa cobrir.
      const ordem = side === 'below' ? 'price_cents desc' : 'price_cents asc';
      const base = `select * from (${VARIANTES}) where enabled = 1`;
      const { count } = conn.prepare(`select count(*) as count from (${base}) where ${cond}`).get(threshold_cents);
      const { total } = conn.prepare(`select count(*) as total from (${base})`).get();
      const examples = conn.prepare(`select sku, price_cents from (${base}) where ${cond} order by ${ordem}, sku limit 5`).all(threshold_cents);
      return json({ threshold_cents, side, count, total, ...canalPadrao(conn), examples });
    }
  );
}
