import { expect } from '@open-wc/testing';
import 'quill/dist/quill';
import { configurePrivateQuill } from '../../../src/internal/quill/configure-private-quill';
import { Elemento } from '../../../src/model/elemento';
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
});
