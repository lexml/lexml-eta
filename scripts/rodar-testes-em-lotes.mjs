// Roda a suíte de testes (out-tsc/test/**/*.test.js) em lotes, cada um como um processo `wtr` novo.
//
// Motivo: numa execução única e contínua, o processo do Chromium acumula memória a cada arquivo de
// teste carregado (comportamento documentado do próprio Chromium/Playwright — não é vazamento deste
// projeto, ver https://github.com/microsoft/playwright/issues/17602) e, dependendo da memória livre da
// máquina, o processo é morto no meio da suíte. Reiniciar o browser periodicamente (um processo `wtr`
// por lote) evita esse acúmulo. Cobertura de cada lote é mesclada num relatório único ao final, para que
// o resultado final seja equivalente ao de "wtr --coverage" rodando tudo de uma vez.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

const RAIZ = process.cwd();
const DIR_TESTES = path.join(RAIZ, 'out-tsc/test');
const DIR_COBERTURA = path.join(RAIZ, 'coverage');
const TAMANHO_LOTE = Number(process.env.WTR_TAMANHO_LOTE) || 30;

// Mantido em sincronia com a exclusão equivalente em web-test-runner.config.mjs.
const ARQUIVOS_EXCLUIDOS = new Set([path.join(DIR_TESTES, 'redux/paginacao/reducer-paginacao.test.js')]);

function listarArquivosDeTeste(dir) {
  const resultado = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      resultado.push(...listarArquivosDeTeste(caminho));
    } else if (entrada.isFile() && entrada.name.endsWith('.test.js') && !ARQUIVOS_EXCLUIDOS.has(caminho)) {
      resultado.push(path.relative(RAIZ, caminho));
    }
  }
  return resultado;
}

function dividirEmLotes(arquivos, tamanho) {
  const lotes = [];
  for (let i = 0; i < arquivos.length; i += tamanho) {
    lotes.push(arquivos.slice(i, i + tamanho));
  }
  return lotes;
}

function rodarLote(arquivos, indice, dirCoberturaLote) {
  const args = arquivos.flatMap(arquivo => ['--files', arquivo]);
  args.push('--coverage', '--static-logging');

  console.log(`\n=== Lote ${indice + 1} (${arquivos.length} arquivos) ===`);
  const resultado = spawnSync('./node_modules/.bin/wtr', args, {
    stdio: 'inherit',
    env: { ...process.env, WTR_COVERAGE_DIR: dirCoberturaLote },
  });

  if (resultado.error) {
    console.error(`Erro ao executar o lote ${indice + 1}:`, resultado.error);
  }
  return resultado.status === 0;
}

function mesclarCobertura(diretoriosLotes) {
  const mapa = libCoverage.createCoverageMap({});
  let algumaCoberturaEncontrada = false;

  for (const dir of diretoriosLotes) {
    const arquivoJson = path.join(dir, 'coverage-final.json');
    if (existsSync(arquivoJson)) {
      mapa.merge(JSON.parse(readFileSync(arquivoJson, 'utf-8')));
      algumaCoberturaEncontrada = true;
    }
  }

  if (!algumaCoberturaEncontrada) {
    console.warn('Nenhum dado de cobertura encontrado para mesclar — pulando relatório de cobertura final.');
    return;
  }

  const contexto = libReport.createContext({
    dir: DIR_COBERTURA,
    coverageMap: mapa,
    watermarks: { statements: [50, 80], functions: [50, 80], branches: [50, 80], lines: [50, 80] },
  });

  reports.create('lcov', {}).execute(contexto);
  reports.create('text-summary', {}).execute(contexto);
  console.log(`Relatório de cobertura mesclado em ${path.join('coverage', 'lcov-report', 'index.html')}`);
}

const arquivos = listarArquivosDeTeste(DIR_TESTES).sort();
if (arquivos.length === 0) {
  console.error(`Nenhum arquivo de teste encontrado em ${DIR_TESTES}. Rode "tsc" antes deste script.`);
  process.exit(1);
}

const lotes = dividirEmLotes(arquivos, TAMANHO_LOTE);
console.log(`Rodando ${arquivos.length} arquivos de teste em ${lotes.length} lote(s) de até ${TAMANHO_LOTE} arquivos.`);

rmSync(DIR_COBERTURA, { recursive: true, force: true });
mkdirSync(DIR_COBERTURA, { recursive: true });

const diretoriosLotes = lotes.map((_, indice) => path.join(DIR_COBERTURA, `lote-${indice + 1}`));
let algumLoteFalhou = false;

lotes.forEach((lote, indice) => {
  const ok = rodarLote(lote, indice, diretoriosLotes[indice]);
  if (!ok) {
    algumLoteFalhou = true;
  }
});

mesclarCobertura(diretoriosLotes);
diretoriosLotes.forEach(dir => rmSync(dir, { recursive: true, force: true }));

if (algumLoteFalhou) {
  console.error('\nUm ou mais lotes de teste falharam.');
  process.exit(1);
}

console.log('\nTodos os lotes passaram.');
