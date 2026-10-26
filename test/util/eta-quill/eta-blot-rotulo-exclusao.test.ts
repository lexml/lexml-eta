import { expect } from '@open-wc/testing';
import 'quill/dist/quill';
import { configurePrivateQuill } from '../../../src/internal/quill/configure-private-quill';
import { Elemento } from '../../../src/model/elemento';
import { alterarRotuloPenaAction } from '../../../src/model/lexml/acao/penaAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { StateType } from '../../../src/redux/state';
import { EtaContainerTable } from '../../../src/util/eta-quill/eta-container-table';
import { EtaQuill } from '../../../src/util/eta-quill/eta-quill';
import { EtaQuillUtil } from '../../../src/util/eta-quill/eta-quill-util';

const excluido = (tipo: string, rotulo: string): Elemento => {
  const revisao = new RevisaoElemento('', StateType.ElementoRemovido, 'Dispositivo removido', { nome: 'Anônimo' } as any, '', undefined, {});
  return { ...new Elemento(), uuid: 1, tipo, rotulo, conteudo: { texto: 'texto.' }, revisao };
};

describe('Rótulo de dispositivo excluído em revisão', () => {
  let editorHtml: HTMLElement;
  let bufferHtml: HTMLElement;
  let quill: EtaQuill;

  const rotuloExibido = (elemento: Elemento): string => {
    const linha: EtaContainerTable = EtaQuillUtil.criarContainerLinha(elemento);
    linha.insertInto(quill.scroll);
    return linha.domNode.querySelector('label')?.textContent?.trim() ?? '';
  };

  beforeEach(() => {
    configurePrivateQuill();
    editorHtml = document.createElement('div');
    bufferHtml = document.createElement('div');
    document.body.append(editorHtml, bufferHtml);
    quill = new EtaQuill(editorHtml, bufferHtml, {});
  });

  afterEach(() => {
    editorHtml.remove();
    bufferHtml.remove();
  });

  it('a pena excluída mantém o rótulo escolhido', () => {
    expect(rotuloExibido(excluido('Pena', 'Penalidade –'))).to.equal('Penalidade –');
  });

  it('os demais dispositivos excluídos mostram a descrição do tipo', () => {
    expect(rotuloExibido(excluido('Paragrafo', '§ 2º'))).to.equal('Parágrafo');
  });

  it('a pena não excluída mostra o próprio rótulo', () => {
    expect(rotuloExibido({ ...new Elemento(), uuid: 1, tipo: 'Pena', rotulo: 'Infração –', conteudo: { texto: 'multa.' } })).to.equal('Infração –');
  });
});

describe('Rótulo clicável da pena', () => {
  let editorHtml: HTMLElement;
  let bufferHtml: HTMLElement;
  let quill: EtaQuill;

  const elemento = (tipo: string, acoesPossiveis: any[]): Elemento => ({ ...new Elemento(), uuid: 1, tipo, rotulo: 'Pena –', conteudo: { texto: 'multa.' }, acoesPossiveis });

  // Clica no rótulo e devolve se ele é editável e quais eventos de rótulo foram disparados.
  const clica = (e: Elemento): { editavel: boolean; eventos: string[] } => {
    const linha: EtaContainerTable = EtaQuillUtil.criarContainerLinha(e);
    linha.insertInto(quill.scroll);
    const eventos: string[] = [];
    ['rotulo-pena', 'rotulo'].forEach(nome => linha.domNode.addEventListener(nome, () => eventos.push(nome)));
    const rotulo = linha.domNode.querySelector('label') as HTMLElement;
    rotulo.click();
    return { editavel: rotulo.classList.contains('rotulo-pena-editavel'), eventos };
  };

  beforeEach(() => {
    configurePrivateQuill();
    editorHtml = document.createElement('div');
    bufferHtml = document.createElement('div');
    document.body.append(editorHtml, bufferHtml);
    quill = new EtaQuill(editorHtml, bufferHtml, {});
  });

  afterEach(() => {
    editorHtml.remove();
    bufferHtml.remove();
  });

  it('a pena com a ação de alterar o rótulo é editável e o clique dispara "rotulo-pena"', () => {
    expect(clica(elemento('Pena', [alterarRotuloPenaAction]))).to.deep.equal({ editavel: true, eventos: ['rotulo-pena'] });
  });

  it('a pena sem a ação de alterar o rótulo não é editável e o clique não dispara evento', () => {
    expect(clica(elemento('Pena', []))).to.deep.equal({ editavel: false, eventos: [] });
  });

  it('outro dispositivo com a mesma ação não ganha o rótulo editável da pena', () => {
    expect(clica(elemento('Paragrafo', [alterarRotuloPenaAction]))).to.deep.equal({ editavel: false, eventos: [] });
  });
});
