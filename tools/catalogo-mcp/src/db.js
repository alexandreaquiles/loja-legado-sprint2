// Acesso somente leitura ao vendure.sqlite da raiz do loja-legado (criado pelo npm run setup a partir do seed).
// Consultas fixas e parametrizadas: nenhuma tool aceita SQL ou nome de tabela vindo do agente.
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DB_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'vendure.sqlite');

let db;

// Devolve null se o banco não existe, para a tool responder com erro informativo em vez de criar um arquivo vazio.
export function abrir() {
  if (db) return db;
  if (!existsSync(DB_FILE)) return null;
  db = new DatabaseSync(DB_FILE, { readOnly: true });
  return db;
}

// Canal padrão: moeda e se os preços já incluem imposto (a base da promoção muda com isso, AGENTS.md).
export function canalPadrao(conn) {
  const c = conn.prepare("select defaultCurrencyCode, pricesIncludeTax from channel where code = '__default_channel__'").get();
  return { currency: c?.defaultCurrencyCode ?? null, prices_include_tax: Boolean(c?.pricesIncludeTax) };
}

// Uma linha por variante não apagada, com o preço do canal padrão e o nome em qualquer idioma disponível.
export const VARIANTES = `
  select v.sku as sku,
         coalesce((select t.name from product_variant_translation t where t.baseId = v.id order by t.languageCode = 'pt_BR' desc limit 1), v.sku) as name,
         p.price as price_cents,
         v.enabled as enabled
    from product_variant v
    join product_variant_price p on p.variantId = v.id and p.channelId = 1
   where v.deletedAt is null`;
