// Gera demo/doc/<nome>.json a partir de demo/doc/<nome>.ts (PL, PLP e MPV) e o índice de proposições do backend da demo.
// Por padrão um .json existente não é reescrito (outros testes dependem dele); `--forcar` regrava os que divergirem do .ts.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { extrairEmenta, identificarPorUrn } from '../demo/server/identificacaoDocumento.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pastaDocs = path.join(raiz, 'demo/doc');
const arquivoIndice = path.join(raiz, 'demo/server/dados/proposicoes.json');

const extrairDocumento = fonte => {
  const inicio = fonte.search(/^export const \w+\s*(?::[^=]+)?=\s*/m);
  if (inicio < 0) return undefined;
  const literal = fonte.slice(fonte.indexOf('=', inicio) + 1).replace(/;\s*$/, '');
  return vm.runInNewContext(`(${literal})`);
};

const igual = (arquivo, documento) => {
  if (!fs.existsSync(arquivo)) return false;
  try {
    return JSON.stringify(JSON.parse(fs.readFileSync(arquivo, 'utf8'))) === JSON.stringify(documento);
  } catch {
    return false;
  }
};

const forcar = process.argv.includes('--forcar');
const indice = new Map();
let gravados = 0;
let total = 0;
for (const arquivo of fs
  .readdirSync(pastaDocs)
  .filter(f => f.endsWith('.ts'))
  .sort()) {
  const documento = extrairDocumento(fs.readFileSync(path.join(pastaDocs, arquivo), 'utf8'));
  const identificacao = identificarPorUrn(documento?.value?.metadado?.identificacao?.urn);
  if (!identificacao) continue;

  const nomeJson = arquivo.replace(/\.ts$/, '.json');
  total++;
  const caminhoJson = path.join(pastaDocs, nomeJson);
  if (forcar ? !igual(caminhoJson, documento) : !fs.existsSync(caminhoJson)) {
    fs.writeFileSync(path.join(pastaDocs, nomeJson), JSON.stringify(documento, null, 2) + '\n');
    gravados++;
  }

  // Versões do mesmo documento (ex.: plp_68_2024_1): prevalece o arquivo de nome mais curto.
  const chave = `${identificacao.sigla}/${identificacao.numero}/${identificacao.ano}`;
  const existente = indice.get(chave);
  if (!existente || nomeJson.length < existente.arquivo.length) {
    indice.set(chave, { ...identificacao, arquivo: nomeJson, ementa: extrairEmenta(documento) });
  }
}

fs.mkdirSync(path.dirname(arquivoIndice), { recursive: true });
fs.writeFileSync(arquivoIndice, JSON.stringify([...indice.values()], null, 2) + '\n');
console.log(`${total} documento(s) PL/PLP/MPV, ${gravados} .json gravado(s); ${indice.size} proposição(ões) no índice.`);
