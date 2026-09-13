// Prepara a máquina: branches locais do exercício, .env a partir do .env.example, o banco SQLite a partir do seed
// e as dependências do servidor MCP em tools/revisor-mcp.
// Roda em qualquer sistema (só Node). Não apaga nada que já exista.
const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const raiz = path.join(__dirname, '..');
const passo = (msg) => console.log(`setup: ${msg}`);

// Branches do exercício: um clone só cria a `main` local, e as tarefas usam
// `git diff main...feature/...` e `git show gabarito:arquivo`. Cria as que faltam, rastreando origin.
const git = (...args) => execFileSync('git', args, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const refs = (prefixo) => {
  try { return git('for-each-ref', '--format=%(refname)', prefixo).split('\n').filter(Boolean).map((r) => r.slice(prefixo.length)); }
  catch { return []; }
};
const locais = new Set(refs('refs/heads/'));
for (const nome of refs('refs/remotes/origin/')) {
  if (nome === 'HEAD' || locais.has(nome)) continue;
  try {
    git('branch', '--track', nome, `origin/${nome}`);
    passo(`branch ${nome} criada a partir de origin/${nome}`);
  } catch {
    passo(`não consegui criar a branch ${nome}; rode \`git branch --track ${nome} origin/${nome}\``);
  }
}

if (!fs.existsSync(path.join(raiz, '.env'))) {
  fs.copyFileSync(path.join(raiz, '.env.example'), path.join(raiz, '.env'));
  passo('.env criado a partir do .env.example (segredos falsos, só para o exercício)');
} else {
  passo('.env já existe');
}
if (!fs.existsSync(path.join(raiz, 'vendure.sqlite'))) {
  fs.copyFileSync(path.join(raiz, 'seed', 'vendure.sqlite'), path.join(raiz, 'vendure.sqlite'));
  passo('vendure.sqlite criado a partir de seed/vendure.sqlite (54 produtos de exemplo)');
} else {
  passo('vendure.sqlite já existe (apague-o e rode de novo para voltar ao seed)');
}

// Servidor MCP do time: dependências próprias (~20 MB). Não depende do Vendure: quem só quer a parte de MCP
// consegue rodar o smoke e o Inspector mesmo sem o npm install da loja.
const mcp = path.join(raiz, 'tools', 'revisor-mcp');
if (fs.existsSync(mcp) && !fs.existsSync(path.join(mcp, 'node_modules', '@modelcontextprotocol', 'sdk'))) {
  passo('npm install em tools/revisor-mcp (SDK do MCP e zod)');
  try {
    execSync('npm install --no-audit --no-fund --silent', { cwd: mcp, stdio: 'inherit' });
  } catch {
    console.error('setup: o npm install em tools/revisor-mcp falhou; rode `cd tools/revisor-mcp && npm install` e veja o erro.');
    process.exitCode = 1;
  }
} else if (fs.existsSync(mcp)) {
  passo('tools/revisor-mcp já tem node_modules');
}

if (!fs.existsSync(path.join(raiz, 'node_modules', '@vendure', 'core'))) {
  console.error('setup: a loja ainda não está instalada (node_modules/@vendure/core). Rode `npm install` (uns 2 minutos, ~800 MB) e depois `npm run setup` de novo.');
  console.error('setup: sem ela, npm test falha e o stop-gate segura o fim de cada turno do claude; o smoke do servidor MCP já funciona.');
  process.exit(1);
}
passo('pronto. npm test | npm run smoke | npm run conferir | claude');
