const fs = require('fs');
const path = require('path');

// Pasta alvo para rodar o script
const TARGET_DIR = path.join(__dirname, 'src');

/**
 * Regex para encontrar os padrões:
 * - (?<![a-zA-Z0-9_])   -> Garante que não faz parte de outra palavra/variável maior
 * - (_?[a-z][a-z0-9]*)  -> Opcionalmente começa com _, depois letras minúsculas (para não pegar MAIÚSCULAS)
 * - (_[a-z0-9]+)+       -> Seguido por um ou mais blocos de _ e minúsculas/números
 * - (?![a-zA-Z0-9_])    -> Garante que terminou a palavra
 */
const regex = /(?<![a-zA-Z0-9_])(_?[a-z][a-z0-9]*(_[a-z0-9]+)+)(?![a-zA-Z0-9_])/g;

function toCamelCase(str) {
  return str.replace(/_([a-z0-9])/g, (match, letter, offset) => {
    // Mantém o underscore inicial (ex: _minha_var -> _minhaVar)
    if (offset === 0) return match; 
    return letter.toUpperCase();
  });
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  const newContent = content.replace(regex, (match) => {
    const replacement = toCamelCase(match);
    if (match !== replacement) {
      hasChanges = true;
    }
    return replacement;
  });

  if (hasChanges && newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`[Modificado] ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Diretório não encontrado: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Ignorar pastas que não precisam ser alteradas
      if (!['node_modules', '.git', '.next', 'dist', 'build', 'public'].includes(file)) {
        walkDir(fullPath);
      }
    } else {
      // Alterar somente arquivos de código
      if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        processFile(fullPath);
      }
    }
  }
}

console.log(`Iniciando a conversão de snake_case para camelCase na pasta: ${TARGET_DIR}...`);
walkDir(TARGET_DIR);
console.log('Conversão finalizada com sucesso!');
