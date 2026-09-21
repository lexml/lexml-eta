import config from './web-test-runner.config.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const executar = promisify(execFile);
const cli = process.env.JSONIX_LEXML_CLI;
if (!cli) throw new Error('Defina JSONIX_LEXML_CLI com o caminho do conversor jsonix-lexml 1.0.0.');

// toxml (CLI real) + validação XSD (script Java real), comuns aos dois comandos abaixo.
// Lança em caso de erro estrutural que não seja rejeição do XSD (SAXParseException).
const converterEValidar = async (payload, diretorio) => {
  const json = join(diretorio, 'documento-articulado.json');
  const xml = join(diretorio, 'documento-articulado.xml');
  await writeFile(json, JSON.stringify(payload), 'utf8');
  await executar(resolve(cli), ['toxml', json, '-o', xml], { timeout: 30000 });
  try {
    await executar('java', [resolve('scripts/ValidarDocumentoLexml.java'), resolve('schemas/lexml-simples.xsd'), xml], { timeout: 30000 });
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
            await executar(resolve(cli), ['tojson', join(diretorio, 'documento-articulado.xml'), '-o', retorno], { timeout: 30000 });
            return { ...resultado, jsonix: JSON.parse(await readFile(retorno, 'utf8')) };
          } finally {
            await rm(diretorio, { recursive: true, force: true });
          }
        }

        // Variante sem tojson: usada para campos que o CLI real não transporta de volta a JSON
        // (ex.: MetadadoProprietario, um xsd:any — ver design.md da change de remissão inválida,
        // Decisão 5). Verifica só o que o CLI real comprovadamente suporta: toxml + XSD + texto.
        if (command === 'toxml-e-validar-lexml') {
          const diretorio = await mkdtemp(join(tmpdir(), 'eta-documento-'));
          try {
            return await converterEValidar(payload, diretorio);
          } finally {
            await rm(diretorio, { recursive: true, force: true });
          }
        }
      },
    },
  ],
};
