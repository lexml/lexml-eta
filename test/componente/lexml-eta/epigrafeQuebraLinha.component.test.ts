import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { criaElementoBr } from '../../../src/model/lexml/documento/conversor/epigrafe';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const documentoComQuebra = (): any => {
  const documento = novoDocumentoArticulado();
  documento.value.projetoNorma.norma.parteInicial.epigrafe.content = ['PRIMEIRA LINHA', criaElementoBr(), '(segunda linha)'];
  return documento;
};

describe('ETA — quebra de linha na epígrafe', () => {
  let component: LexmlEtaComponent;
  let quill: any;
  let epigrafe: any;
  let ementa: any;

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComQuebra());
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    // Aguarda o foco inicial na ementa (setTimeout).
    await new Promise(resolve => setTimeout(resolve, 50));
    quill = editor.quill;
    ementa = quill.linhaAtual;
    epigrafe = ementa.prev;
  });

  it('a linha da epígrafe tem o blot de quebra entre os dois trechos', () => {
    const conteudo: HTMLElement = epigrafe.blotConteudo.domNode;
    const quebras = conteudo.querySelectorAll('br.eta-quebra-linha');
    expect(quebras.length).to.equal(1);
    expect(conteudo.textContent).to.equal('PRIMEIRA LINHA(segunda linha)');
    expect(quebras[0].previousSibling?.textContent).to.equal('PRIMEIRA LINHA');
    expect(quebras[0].nextSibling?.textContent).to.equal('(segunda linha)');
  });

  it('a primeira linha fica em negrito e a segunda não (#1060)', () => {
    const quebra = epigrafe.blotConteudo.domNode.querySelector('br.eta-quebra-linha')!;
    const primeira = quebra.previousSibling as HTMLElement;
    const segunda = quebra.nextSibling!;
    const peso = (no: Node): number => parseInt(getComputedStyle((no.nodeType === Node.TEXT_NODE ? no.parentElement : no) as Element).fontWeight);
    expect(primeira.nodeName).to.equal('B');
    expect(peso(primeira)).to.be.at.least(700);
    expect(segunda.nodeType).to.equal(Node.TEXT_NODE);
    expect(peso(segunda)).to.be.below(700);
  });

  it('exibe os dois trechos em linhas diferentes', () => {
    const quebra = epigrafe.blotConteudo.domNode.querySelector('br.eta-quebra-linha')!;
    const topo = (no: Node): number => {
      const range = document.createRange();
      range.selectNodeContents(no);
      return range.getBoundingClientRect().top;
    };
    expect(topo(quebra.nextSibling!)).to.be.greaterThan(topo(quebra.previousSibling!));
  });

  it('o texto da epígrafe no estado mantém o <br/>', () => {
    expect(component.getProposicao().epigrafe.texto).to.equal('PRIMEIRA LINHA<br/>(segunda linha)');
  });

  it('salvar grava o elemento br na epígrafe', () => {
    const salvo: any = component.getDocumentoArticulado();
    const content = salvo.value.projetoNorma.norma.parteInicial.epigrafe.content;
    expect(content.map((e: any) => (typeof e === 'string' ? e : e.name.localPart))).to.deep.equal(['PRIMEIRA LINHA', 'br', '(segunda linha)']);
    expect(JSON.stringify(content)).not.to.match(/"b"|strong/i);
  });
});
