import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const declarationsPath = packageJson.types;
const publicRuntimeValues = [
  'AjudaComponent',
  'AjudaModalComponent',
  'AlertasComponent',
  'AlterarLarguraImagemModalComponent',
  'AlterarLarguraTabelaColunaModalComponent',
  'ArticulacaoComponent',
  'AtalhosModalComponent',
  'AutoriaComponent',
  'DataComponent',
  'DestinoComponent',
  'EditorComponent',
  'EditorTextoRicoComponent',
  'ElementoComponent',
  'HelpComponent',
  'LexmlAutocomplete',
  'LexmlEtaComponent',
  'LexmlEtaConfig',
  'LexmlEtaParametrosEdicao',
  'LexmlEtaProposicaoComponent',
  'OpcoesImpressaoComponent',
  'Proposicao',
  'ProposicaoDivididaDialog',
  'SubstituicaoTermoComponent',
  'SufixosModalComponent',
  'SwitchRevisaoComponent',
  'Usuario',
];
const publicTypes = ['DispositivoBloqueado'];
const registeredCustomElements = [
  'lexml-eta-ajuda',
  'lexml-eta-ajuda-modal',
  'lexml-eta-alertas',
  'lexml-eta-alterar-largura-imagem-modal',
  'lexml-eta-alterar-largura-tabela-coluna-modal',
  'lexml-eta-articulacao',
  'lexml-eta-atalhos',
  'lexml-eta-atalhos-modal',
  'lexml-eta-autocomplete',
  'lexml-eta-autocomplete-async',
  'lexml-eta-autocomplete-norma',
  'lexml-eta-autoria',
  'lexml-eta-data',
  'lexml-eta-destino',
  'lexml-eta-editor-texto-rico',
  'lexml-eta-elemento',
  'lexml-eta-opcoes-impressao',
  'lexml-eta-proposicao',
  'lexml-eta-proposicao-editor',
  'lexml-eta-sufixos-modal',
  'lexml-eta-switch-revisao',
  'lexml-eta',
  'lexml-substituicao-termo',
  'proposicao-dividida-modal',
];

const parseExportedNames = value =>
  value
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
    .map(specifier => specifier.split(/\s+as\s+/).at(-1));

const collectDeclarationFiles = directory =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectDeclarationFiles(path);
    }
    return entry.name.endsWith('.d.ts') ? [path] : [];
  });

assert.equal(declarationsPath, 'dist/types/src/index.d.ts');
assert.ok(existsSync('dist/index.js'), 'O bundle principal não foi gerado.');
assert.ok(existsSync('dist/index.min.js'), 'O bundle minificado não foi gerado.');
assert.ok(existsSync(declarationsPath), 'As declarações TypeScript não foram geradas.');

const declarations = readFileSync(declarationsPath, 'utf8');
const javascript = readFileSync('dist/index.js', 'utf8');

const declarationRuntimeExports = [...declarations.matchAll(/^export\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"];?$/gm)].flatMap(match => parseExportedNames(match[1])).sort();
assert.deepEqual(declarationRuntimeExports, [...publicRuntimeValues].sort(), 'A API pública de runtime do index.d.ts divergiu da allowlist.');

const declarationTypeExports = [...declarations.matchAll(/^export type\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"];?$/gm)].flatMap(match => parseExportedNames(match[1])).sort();
assert.deepEqual(declarationTypeExports, [...publicTypes].sort(), 'A API pública de tipos divergiu da allowlist.');

const javascriptExportMatch = [...javascript.matchAll(/^export\s*\{([^}]*)\};$/gm)].at(-1);
assert.ok(javascriptExportMatch, 'A lista de exports do bundle não foi encontrada.');
assert.deepEqual(parseExportedNames(javascriptExportMatch[1]).sort(), [...publicRuntimeValues].sort(), 'A API pública de runtime do JavaScript divergiu da allowlist.');

for (const tag of registeredCustomElements) {
  assert.ok(javascript.includes(`customElement('${tag}')`), `O bundle não registra o componente <${tag}>.`);
}

for (const declarationFile of collectDeclarationFiles('dist/types')) {
  const content = readFileSync(declarationFile, 'utf8');
  for (const forbiddenReference of ['C:\\Users\\', 'node_modules']) {
    assert.equal(content.includes(forbiddenReference), false, `Referência não publicável encontrada em ${declarationFile}: ${forbiddenReference}`);
  }
}

console.log('Contrato público, tipos e registros do pacote validados com sucesso.');
