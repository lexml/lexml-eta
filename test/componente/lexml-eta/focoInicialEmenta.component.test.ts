import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

describe('ETA — foco e seleção inicial da ementa', () => {
  let component: LexmlEtaComponent;
  let editor: any;

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    // Aguarda o setTimeout(0) assíncrono de foco e marcação da linha inicial
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('inicia com a ementa selecionada e definida como linhaAtual no Quill', () => {
    expect(editor.quill.linhaAtual).to.be.ok;
    expect(editor.quill.linhaAtual.tipo).to.equal('Ementa');
  });

  it('inicia com a classe container__elemento--ativo na linha da ementa', () => {
    const linhaEmenta = component.querySelector('.elemento-tipo-ementa') as HTMLElement;
    expect(linhaEmenta).to.be.ok;
    expect(linhaEmenta.classList.contains('container__elemento--ativo')).to.be.true;
  });
});
