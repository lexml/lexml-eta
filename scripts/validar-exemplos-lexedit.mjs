import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const xsd = resolve(raiz, 'schemas/lexedit.xsd');
const pastaFixtures = resolve(raiz, 'scripts/fixtures-lexedit');
const exemploCompleto = resolve(raiz, 'docs/extensao-formato-lexml/documento-articulado-exemplo.xml');

// documento-articulado-exemplo.xml herda o namespace LexML default do <LexML> ancestral — ao
// extrair só o fragmento lexedit:Metadado, o xmlns precisa ser declarado de novo para os
// elementos LexML (p, Artigo, Caput...) embutidos nele continuarem resolvendo para o namespace certo.
const extrairFragmentoMetadado = () => {
  const conteudo = readFileSync(exemploCompleto, 'utf8');
  const inicio = conteudo.indexOf('<lexedit:Metadado');
  const fim = conteudo.indexOf('</lexedit:Metadado>') + '</lexedit:Metadado>'.length;
  if (inicio < 0 || fim < 0) throw new Error(`lexedit:Metadado não encontrado em ${exemploCompleto}`);
  const fragmento = conteudo.slice(inicio, fim);
  return fragmento.replace('<lexedit:Metadado', '<lexedit:Metadado xmlns="http://www.lexml.gov.br/1.0"');
};

const validar = (caminhoXml) => {
  try {
    execFileSync('java', [resolve(raiz, 'scripts/ValidarDocumentoLexml.java'), xsd, caminhoXml], { stdio: 'pipe' });
    return { valido: true };
  } catch (erro) {
    const stderr = erro.stderr?.toString() ?? String(erro);
    const linhaErro = stderr.split('\n').find((linha) => linha.includes('SAXParseException')) ?? stderr.split('\n')[0];
    return { valido: false, erro: linhaErro };
  }
};

const fixtures = readdirSync(pastaFixtures)
  .filter((nome) => nome.endsWith('.xml'))
  .map((nome) => ({ nome, caminho: join(pastaFixtures, nome) }));

const diretorioTemp = mkdtempSync(join(tmpdir(), 'lexedit-fixture-'));
const caminhoExemploCompleto = join(diretorioTemp, 'exemplo-completo.xml');
writeFileSync(caminhoExemploCompleto, extrairFragmentoMetadado(), 'utf8');
fixtures.push({ nome: 'documento-articulado-exemplo.xml (fragmento lexedit:Metadado)', caminho: caminhoExemploCompleto });

let falhas = 0;
for (const { nome, caminho } of fixtures) {
  const resultado = validar(caminho);
  if (resultado.valido) {
    console.log(`OK   ${nome}`);
  } else {
    falhas++;
    console.error(`FAIL ${nome}`);
    console.error(`     ${resultado.erro}`);
  }
}

rmSync(diretorioTemp, { recursive: true, force: true });

console.log(`\n${fixtures.length - falhas}/${fixtures.length} exemplos válidos contra schemas/lexedit.xsd.`);
if (falhas > 0) process.exit(1);
