// catalogo-mcp: servidor MCP somente leitura sobre o catálogo do vendure.sqlite (Desafio S2 · N2, PRD em docs/prd-catalogo-mcp.md).
// 2 tools de leitura, nenhuma de escrita. Transporte stdio, sem rede.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCatalogTools } from './tools/catalog.js';

const server = new McpServer({ name: 'catalogo', version: '1.0.0' });

registerCatalogTools(server);

// Em stdio, stdout é o canal do protocolo: NUNCA use console.log aqui. Use console.error para debug.
const transport = new StdioServerTransport();
await server.connect(transport);
