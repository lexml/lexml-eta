import { expect, fixture } from '@open-wc/testing';
import { restore, spy } from 'sinon';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const TOTAL_ARTIGOS = 40;

// Documento maior que a área do editor: o artigo do modelo repetido, com ids e rótulos próprios.
const documentoComMuitosArtigos = (): any => {
  const documento = novoDocumentoArticulado();
  const articulacao = documento.value.projetoNorma.norma.articulacao;
  const modelo = JSON.stringify(articulacao.lXhier[0]);
  articulacao.lXhier = Array.from({ length: TOTAL_ARTIGOS }, (_, i) => {
    const n = i + 1;
    const artigo = JSON.parse(modelo.split('art1').join(`art${n}`));
    artigo.value.rotulo = `Art. ${n}${n < 10 ? 'º' : '.'}`;
    return artigo;
  });
  return documento;
};

// #1077: com o foco no <p> do dispositivo, o root.focus() do Quill rolava a tela para o início.
describe('ETA — reposicionar o cursor não rola a tela', () => {
  let component: LexmlEtaComponent;
  let quill: any;
  let root: HTMLElement;
  let artigo: any;

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComMuitosArtigos());
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await new Promise(resolve => setTimeout(resolve, 50));
    quill = editor.quill;
    root = quill.root;
    root.style.height = '300px';
    root.style.overflowY = 'auto';

    artigo = quill.linhaAtual;
    while (artigo && artigo.numero !== '20') {
      artigo = artigo.next;
    }
    root.scrollTop = artigo.domNode.offsetTop - 100;
  });

  afterEach(() => restore());

  it('o documento é maior que a área do editor', () => {
    expect(root.scrollHeight > root.clientHeight).to.be.true;
    expect(root.scrollTop > 0).to.be.true;
  });

  it('com o cursor nativo no rótulo e o foco no texto, devolver o cursor ao início do texto não rola a tela', () => {
    const conteudo: HTMLElement = artigo.blotConteudo.domNode;
    conteudo.focus({ preventScroll: true });
    const rotulo = artigo.domNode.querySelector('label.texto__rotulo').firstChild;
    document.getSelection()!.setBaseAndExtent(rotulo, 0, rotulo, 0);
    const rolagem = root.scrollTop;

    quill.setSelection(quill.getIndex(artigo.blotConteudo), 0, 'silent');

    expect(root.scrollTop).to.equal(rolagem);
    expect(quill.getSelection().index).to.equal(quill.getIndex(artigo.blotConteudo));
  });

  it('o focus do root sem opções usa preventScroll e repassa as opções recebidas', () => {
    const focus = spy(HTMLElement.prototype, 'focus');

    root.focus();
    root.focus({ preventScroll: false });

    expect(focus.firstCall.args[0]).to.deep.equal({ preventScroll: true });
    expect(focus.secondCall.args[0]).to.deep.equal({ preventScroll: false });
  });
});
