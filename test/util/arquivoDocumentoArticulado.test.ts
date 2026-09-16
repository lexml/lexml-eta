import { expect } from '@open-wc/testing';
import { abrirArquivoDocumentoArticulado, lerArquivoDocumentoArticulado, salvarArquivoDocumentoArticulado } from '../../src/util/arquivoDocumentoArticulado';
import { novoDocumentoArticulado } from '../doc/documentoArticulado';

describe('Arquivos de documento articulado', () => {
  let descritorAbrir: PropertyDescriptor | undefined;
  const configurar = (nome: string, value: unknown): Window => Object.defineProperty(window, nome, { configurable: true, value });
  const restaurar = (nome: string, descritor?: PropertyDescriptor): void => {
    if (descritor) Object.defineProperty(window, nome, descritor);
    else Reflect.deleteProperty(window, nome);
  };
  beforeEach(() => {
    descritorAbrir = Object.getOwnPropertyDescriptor(window, 'showOpenFilePicker');
  });
  afterEach(() => {
    restaurar('showOpenFilePicker', descritorAbrir);
  });

  it('baixa o Jsonix com o nome de arquivo composto, sem usar o seletor nativo de salvamento', async () => {
    const cliques: HTMLAnchorElement[] = [];
    const clickOriginal = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement): void {
      cliques.push(this);
    };
    try {
      await salvarArquivoDocumentoArticulado(novoDocumentoArticulado());
    } finally {
      HTMLAnchorElement.prototype.click = clickOriginal;
    }
    expect(cliques).to.have.length(1);
    expect(cliques[0].download).to.equal('documento-articulado - PLS nº 999999, de 9999.json');
    const conteudo = await (await fetch(cliques[0].href)).text();
    expect(JSON.parse(conteudo).name.localPart).to.equal('LexML');
  });

  it('propaga o erro ao tentar salvar um documento inválido', async () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.projetoNorma.norma.articulacao.lXhier = [];
    let mensagem = '';
    try {
      await salvarArquivoDocumentoArticulado(entrada);
    } catch (erro) {
      mensagem = (erro as Error).message;
    }
    expect(mensagem).to.include('articulação');
  });

  it('lê o arquivo selecionado pelo diálogo', async () => {
    configurar('showOpenFilePicker', async () => [{ getFile: async (): Promise<File> => new File([JSON.stringify(novoDocumentoArticulado())], 'documento-articulado.json') }]);
    expect((await abrirArquivoDocumentoArticulado())?.value.metadado.identificacao.urn).to.include(':9999;999999');
  });

  it('trata cancelamento ao abrir como operação não realizada', async () => {
    configurar('showOpenFilePicker', async (): Promise<never> => {
      throw new DOMException('Cancelado', 'AbortError');
    });
    expect(await abrirArquivoDocumentoArticulado()).to.equal(undefined);
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
