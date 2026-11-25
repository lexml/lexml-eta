import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const aguardar = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// #1084: com o menu de contexto numa linha acima, o texto lido por getText ficava deslocado dos índices dos blots,
// e a remissão sem posição conhecida (manual) era desenhada no trecho errado.
describe('ETA — remissão interna sem posição com o menu de contexto acima', () => {
  let editor: any;
  let quill: any;
  let caput: any;
  let paragrafo: any;

  beforeEach(async () => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await aguardar(50);
    quill = editor.quill;
    for (let l = quill.getPrimeiraLinha(); l; l = l.next) {
      if (l.tipo === 'Artigo') caput = l;
      if (l.tipo === 'Paragrafo') paragrafo = l;
    }
    quill.setSelection(quill.getIndex(caput.blotConteudo), 0, 'user');
    await aguardar(100);
  });

  afterEach(() => editor?.cancelarTimerOnChangePendente?.());

  it('o menu de contexto está na linha do artigo, acima do parágrafo', () => {
    expect(!!caput.domNode.querySelector('sl-dropdown.lx-eta-dropdown')).to.be.true;
    expect(!!paragrafo.domNode.querySelector('sl-dropdown.lx-eta-dropdown')).to.be.false;
  });

  it('desenha o link sobre o texto da remissão', () => {
    const remissao = { refId: 'ri-1084', targetLexmlId: 'art1', targetUuid: caput.uuid, textoRef: 'território nacional' };

    quill.getModule('remissaoInterna').renderizarRemissoesDoState({ [paragrafo.uuid]: [remissao] }, paragrafo.uuid);

    const links = Array.from(paragrafo.blotConteudo.domNode.querySelectorAll('a.lexml-remissao-interna')).map((a: any) => a.textContent);
    expect(links).to.deep.equal(['território nacional']);
  });
});
