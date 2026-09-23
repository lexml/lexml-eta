import config from './web-test-runner.config.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const executar = promisify(execFile);
const cli = process.env.JSONIX_LEXML_CLI;
if (!cli) throw new Error('Defina JSONIX_LEXML_CLI com o caminho do conversor jsonix-lexml 2.0.0.');

// O CLI sai com código 0 mesmo quando a conversão falha: a falha só aparece na ausência do arquivo de saída.
const converter = async (comando, entrada, saida) => {
  const { stderr } = await executar(resolve(cli), [comando, entrada, '-o', saida], { timeout: 30000 });
  try {
    await access(saida);
  } catch {
    throw new Error(`jsonix-lexml ${comando} não gerou ${saida}: ${stderr}`);
  }
};

// toxml (CLI real) + validação XSD (script Java real).
// lexedit.xsd importa lexml-simples.xsd e valida também o conteúdo de lexedit:Metadado,
// que lexml-simples.xsd sozinho não checa (xsd:any lax com namespace desconhecido).
// Lança em caso de erro estrutural que não seja rejeição do XSD (SAXParseException).
const converterEValidar = async (payload, diretorio) => {
  const json = join(diretorio, 'documento-articulado.json');
  const xml = join(diretorio, 'documento-articulado.xml');
  await writeFile(json, JSON.stringify(payload), 'utf8');
  await converter('toxml', json, xml);
  try {
    await executar('java', [resolve('scripts/ValidarDocumentoLexml.java'), resolve('schemas/lexedit.xsd'), xml], { timeout: 30000 });
  } catch (erro) {
    if (erro.stderr?.includes('SAXParseException')) return { valido: false, erro: erro.stderr, xml: await readFile(xml, 'utf8') };
    throw erro;
  }
  return { valido: true, xml: await readFile(xml, 'utf8') };
};

export default {
  ...config,
  files: ['out-tsc/test/integracao/documentoArticulado.integration.js'],
  coverage: false,
  plugins: [
    ...(config.plugins ?? []),
    {
      name: 'validar-documento-articulado',
      async executeCommand({ command, payload }) {
        if (command === 'validar-documento-lexml') {
          const diretorio = await mkdtemp(join(tmpdir(), 'eta-documento-'));
          try {
            const resultado = await converterEValidar(payload, diretorio);
            if (!resultado.valido) return resultado;
            const retorno = join(diretorio, 'retorno.json');
            await converter('tojson', join(diretorio, 'documento-articulado.xml'), retorno);
            return { ...resultado, jsonix: JSON.parse(await readFile(retorno, 'utf8')) };
          } finally {
            await rm(diretorio, { recursive: true, force: true });
          }
        }
      },
    },
  ],
};
