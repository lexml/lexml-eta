import { expect } from '@open-wc/testing';
import { abrirArquivoDocumentoArticulado, lerArquivoDocumentoArticulado, salvarArquivoDocumentoArticulado } from '../../src/util/arquivoDocumentoArticulado';
import { novoDocumentoArticulado } from '../doc/documentoArticulado';

describe('Arquivos de documento articulado', () => {
  let descritorAbrir: PropertyDescriptor | undefined;
  let descritorSalvar: PropertyDescriptor | undefined;
  const configurar = (nome: string, value: unknown): Window => Object.defineProperty(window, nome, { configurable: true, value });
  const restaurar = (nome: string, descritor?: PropertyDescriptor): void => {
    if (descritor) Object.defineProperty(window, nome, descritor);
    else Reflect.deleteProperty(window, nome);
  };
  beforeEach(() => {
    descritorAbrir = Object.getOwnPropertyDescriptor(window, 'showOpenFilePicker');
    descritorSalvar = Object.getOwnPropertyDescriptor(window, 'showSaveFilePicker');
  });
  afterEach(() => {
    restaurar('showOpenFilePicker', descritorAbrir);
    restaurar('showSaveFilePicker', descritorSalvar);
  });

  it('grava o Jsonix com o nome padrão e fecha o arquivo', async () => {
    let gravado: Blob | undefined;
    let fechou = false;
    configurar('showSaveFilePicker', async options => {
      expect(options.suggestedName).to.equal('documento-articulado.json');
      return {
        createWritable: async (): Promise<any> => ({
          write: async (blob: Blob): Promise<void> => {
            gravado = blob;
          },
          close: async (): Promise<void> => {
            fechou = true;
          },
        }),
      };
    });
    expect(await salvarArquivoDocumentoArticulado(novoDocumentoArticulado())).to.equal(true);
    expect(fechou).to.equal(true);
    expect(JSON.parse(await gravado!.text()).name.localPart).to.equal('LexML');
  });

  it('lê o arquivo selecionado pelo diálogo', async () => {
    configurar('showOpenFilePicker', async () => [{ getFile: async (): Promise<File> => new File([JSON.stringify(novoDocumentoArticulado())], 'documento-articulado.json') }]);
    expect((await abrirArquivoDocumentoArticulado())?.value.metadado.identificacao.urn).to.include(':9999;999999');
  });

  it('trata cancelamento como operação não realizada', async () => {
    const cancelar = async (): Promise<never> => {
      throw new DOMException('Cancelado', 'AbortError');
    };
    configurar('showSaveFilePicker', cancelar);
    configurar('showOpenFilePicker', cancelar);
    expect(await salvarArquivoDocumentoArticulado(novoDocumentoArticulado())).to.equal(false);
    expect(await abrirArquivoDocumentoArticulado()).to.equal(undefined);
  });

  it('aborta uma escrita que falha e propaga o erro', async () => {
    let abortou = false;
    configurar('showSaveFilePicker', async () => ({
      createWritable: async (): Promise<any> => ({
        write: async (): Promise<void> => {
          throw new Error('Falha de escrita');
        },
        close: async (): Promise<void> => undefined,
        abort: async (): Promise<void> => {
          abortou = true;
        },
      }),
    }));
    let mensagem = '';
    try {
      await salvarArquivoDocumentoArticulado(novoDocumentoArticulado());
    } catch (erro) {
      mensagem = (erro as Error).message;
    }
    expect(abortou).to.equal(true);
    expect(mensagem).to.equal('Falha de escrita');
  });

  it('recusa arquivo com JSON inválido', async () => {
    let mensagem = '';
    try {
      await lerArquivoDocumentoArticulado(new Blob(['{']));
    } catch (erro) {
      mensagem = (erro as Error).message;
    }
    expect(mensagem).to.include('JSON válido');
  });

  it('encerra e remove o seletor alternativo ao cancelar', async () => {
    configurar('showOpenFilePicker', undefined);
    const resultado = abrirArquivoDocumentoArticulado();
    const input = document.querySelector('input[type=file][hidden]')!;
    input.dispatchEvent(new Event('cancel'));
    expect(await resultado).to.equal(undefined);
    expect(input.isConnected).to.equal(false);
  });
});
