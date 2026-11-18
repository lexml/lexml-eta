import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

// Documento com o artigo dentro de um capítulo.
const documentoComCapitulo = (): any => {
  const documento = novoDocumentoArticulado();
  const articulacao = documento.value.projetoNorma.norma.articulacao;
  articulacao.lXhier = [
    {
      name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'Capitulo' },
      value: {
        TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
        id: 'cap1',
        rotulo: 'CAPÍTULO I',
        nomeAgrupador: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['DISPOSIÇÕES GERAIS'] },
        lXhier: articulacao.lXhier,
      },
    },
  ];
  return documento;
};

// #1073: o cursor parava na quebra de linha entre o rótulo e o nome do agrupador (↑ a partir do nome, Ctrl+Shift+←),
// e o texto digitado ficava ao lado do rótulo. O Quill não aceita setSelection ali: só a seleção nativa chega.
describe('ETA — cursor na quebra de linha do agrupador vai ao nome', () => {
  let quill: any;
  let capitulo: any;
  let br: HTMLElement;
  let nome: Text;

  const inicio = (): number => quill.getIndex(capitulo.blotConteudo);
  const tamanho = (): number => capitulo.blotConteudo.tamanho;
  // Atualiza a seleção do Quill a partir da nativa, como no selectionchange do navegador.
  const selecionarNativo = (no: Node, offset: number, noFoco: Node = no, offsetFoco: number = offset): void => {
    document.getSelection()!.setBaseAndExtent(no, offset, noFoco, offsetFoco);
    quill.selection.update('user');
  };

  beforeEach(async () => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComCapitulo());
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await new Promise(resolve => setTimeout(resolve, 50));
    quill = editor.quill;
    capitulo = quill.linhaAtual;
    while (capitulo && capitulo.tipo !== 'Capitulo') {
      capitulo = capitulo.next;
    }
    quill.setSelection(inicio() + 5, 0, 'user');
    br = capitulo.blotConteudo.prev.domNode;
    nome = capitulo.blotConteudo.domNode.firstChild;
  });

  it('o capítulo tem a quebra de linha entre o rótulo e o nome', () => {
    expect(capitulo.blotConteudo.prev.instanceBlotName).to.equal('EtaBlotQuebraLinha');
    expect(nome.textContent).to.equal('DISPOSIÇÕES GERAIS');
  });

  it('cursor na quebra de linha vai ao início do nome', () => {
    selecionarNativo(br, 0);

    expect(quill.getSelection()).to.deep.equal({ index: inicio(), length: 0 });
  });

  it('cursor logo antes da quebra de linha vai ao início do nome', () => {
    selecionarNativo(br.parentNode!, Array.from(br.parentNode!.childNodes).indexOf(br));

    expect(quill.getSelection()).to.deep.equal({ index: inicio(), length: 0 });
  });

  it('seleção para trás, do fim do nome até a quebra de linha, seleciona todo o nome', () => {
    selecionarNativo(nome, nome.length, br, 0);

    expect(quill.getSelection()).to.deep.equal({ index: inicio(), length: tamanho() });
  });

  it('seleção para frente, da quebra de linha ao meio do nome, começa no início do nome', () => {
    selecionarNativo(br, 0, nome, 5);

    expect(quill.getSelection()).to.deep.equal({ index: inicio(), length: 5 });
  });
});
