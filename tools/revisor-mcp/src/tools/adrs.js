import { z } from 'zod';
import { listAdrs } from '../db.js';

export function registerAdrTools(server) {
  server.registerTool(
    'search_team_adrs',
    {
      title: 'Search Team ADRs',
      description:
        'Searches ACCEPTED Architecture Decision Records of a team by keyword (title, context or decision). ' +
        'Use this when a PR touches an architectural concern (money, discounts, dependencies, dates, errors). ' +
        'Returns only accepted ADRs; proposed and deprecated ones are excluded.',
      inputSchema: {
        team_id: z.string().min(1).describe('Team identifier (e.g. "loja").'),
        keyword: z
          .string()
          .min(2)
          .describe('Search term, e.g. "desconto", "centavos", "dependência". Case-insensitive.'),
      },
    },
    async ({ team_id, keyword }) => {
      const k = keyword.toLowerCase();
      const adrs = listAdrs()
        .filter((a) => a.team_id === team_id && a.status === 'accepted')
        .filter((a) => [a.title, a.context, a.decision].join(' ').toLowerCase().includes(k))
        .map(({ id, title, decision }) => ({ id, title, decision }));

      return {
        content: [{ type: 'text', text: JSON.stringify({ adrs, count: adrs.length }) }],
      };
    }
  );
}
