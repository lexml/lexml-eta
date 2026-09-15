import config from './web-test-runner.config.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const executar = promisify(execFile);
const cli = process.env.JSONIX_LEXML_CLI;
if (!cli) throw new Error('Defina JSONIX_LEXML_CLI com o caminho do conversor jsonix-lexml 1.0.0.');

export default {
  ...config,
  files: ['out-tsc/test/integracao/documentoArticulado.integration.js'],
  coverage: false,
  plugins: [
    ...(config.plugins ?? []),
    {
      name: 'validar-documento-articulado',
      async executeCommand({ command, payload }) {
        if (command !== 'validar-documento-lexml') return;
        const diretorio = await mkdtemp(join(tmpdir(), 'eta-documento-'));
        try {
          const json = join(diretorio, 'documento-articulado.json');
          const xml = join(diretorio, 'documento-articulado.xml');
          const retorno = join(diretorio, 'retorno.json');
          await writeFile(json, JSON.stringify(payload), 'utf8');
          await executar(resolve(cli), ['toxml', json, '-o', xml], { timeout: 30000 });
          try {
            await executar('java', [resolve('scripts/ValidarDocumentoLexml.java'), resolve('test/schemas/lexml/lexml-simples.xsd'), xml], { timeout: 30000 });
          } catch (erro) {
            if (erro.stderr?.includes('SAXParseException')) return { valido: false, erro: erro.stderr };
            throw erro;
          }
          await executar(resolve(cli), ['tojson', xml, '-o', retorno], { timeout: 30000 });
          return { valido: true, xml: await readFile(xml, 'utf8'), jsonix: JSON.parse(await readFile(retorno, 'utf8')) };
        } finally {
          await rm(diretorio, { recursive: true, force: true });
        }
      },
    },
  ],
};
