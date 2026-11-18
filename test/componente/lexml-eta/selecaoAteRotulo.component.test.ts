import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const ultimoNoDeTexto = (elemento: Node): Text => {
  const percurso = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT);
  let no: Text | undefined;
  while (percurso.nextNode()) {
    no = percurso.currentNode as Text;
  }
  return no!;
};

// A seleção nativa está para trás quando o foco vem antes da âncora.
const selecaoParaTras = (selecao: Selection): boolean => {
  const intervalo = document.createRange();
  intervalo.setStart(selecao.focusNode!, selecao.focusOffset);
  intervalo.setEnd(selecao.anchorNode!, selecao.anchorOffset);
  return !intervalo.collapsed;
};

// #1070: a seleção que se estende até o rótulo era trocada por um cursor no início do texto.
describe('ETA — seleção que alcança o rótulo fica no texto', () => {
  let quill: any;
  let artigo: any;
  let rotulo: Text;
  let fimDoTexto: Text;

  const inicio = (): number => quill.getIndex(artigo.blotConteudo);
  const tamanho = (): number => artigo.blotConteudo.tamanho;
  // Atualiza a seleção do Quill a partir da nativa, como no selectionchange do navegador.
  const atualizarSelecao = (): void => quill.selection.update('user');

  beforeEach(async () => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await new Promise(resolve => setTimeout(resolve, 50));
    quill = editor.quill;
    artigo = quill.linhaAtual;
    while (artigo && artigo.tipo !== 'Artigo') {
      artigo = artigo.next;
    }
    quill.setSelection(inicio(), 0, 'user');
    rotulo = artigo.domNode.querySelector('label.texto__rotulo').firstChild;
    fimDoTexto = ultimoNoDeTexto(artigo.blotConteudo.domNode);
  });

  it('o artigo tem texto', () => {
    expect(tamanho() > 10).to.be.true;
  });

  it('seleção para trás, do fim do texto até o rótulo, seleciona todo o texto e continua para trás', () => {
    document.getSelection()!.setBaseAndExtent(fimDoTexto, fimDoTexto.length, rotulo, 0);
    atualizarSelecao();

    expect(quill.getSelection()).to.deep.equal({ index: inicio(), length: tamanho() });
    expect(selecaoParaTras(document.getSelection()!)).to.be.true;
  });

  it('seleção para frente, do rótulo ao meio do texto, fica do início do texto ao meio', () => {
    document.getSelection()!.setBaseAndExtent(rotulo, 0, fimDoTexto, 5);
    atualizarSelecao();

    const selecao = quill.getSelection();
    expect(selecao.index).to.equal(inicio());
    expect(selecao.index + selecao.length).to.equal(quill.getIndex(quill.constructor.find(fimDoTexto)) + 5);
    expect(selecaoParaTras(document.getSelection()!)).to.be.false;
  });

  it('cursor sem seleção no rótulo vai ao início do texto', () => {
    document.getSelection()!.setBaseAndExtent(rotulo, 0, rotulo, 0);
    atualizarSelecao();

    expect(quill.getSelection()).to.deep.equal({ index: inicio(), length: 0 });
  });
});
