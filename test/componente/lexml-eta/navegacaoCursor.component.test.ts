import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { criaElementoBr } from '../../../src/model/lexml/documento/conversor/epigrafe';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

// A quebra de linha da epígrafe (#1053) acrescenta um blot à linha; a navegação não pode mudar.
const documentoComQuebraNaEpigrafe = (): any => {
  const documento = novoDocumentoArticulado();
  documento.value.projetoNorma.norma.parteInicial.epigrafe.content = ['PRIMEIRA LINHA', criaElementoBr(), '(segunda linha)'];
  return documento;
};

// O clique sintético não move a seleção do Quill: a seleção que o clique produziria é simulada com setSelection('user').
[
  { caso: 'epígrafe sem quebra', documento: novoDocumentoArticulado },
  { caso: 'epígrafe com quebra de linha', documento: documentoComQuebraNaEpigrafe },
].forEach(({ caso, documento }) =>
  describe(`ETA — cursor nas linhas não editáveis (epígrafe e preâmbulo; ${caso})`, () => {
    let component: LexmlEtaComponent;
    let quill: any;
    let epigrafe: any;
    let ementa: any;
    let preambulo: any;
    let artigo: any;

    const inicio = (linha: any): number => quill.getIndex(linha.blotConteudo);
    const fim = (linha: any): number => inicio(linha) + linha.blotConteudo.tamanho;
    const posicionar = (indice: number): void => quill.setSelection(indice, 0, 'user');
    const teclar = (key: string): void => {
      quill.root.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    };

    beforeEach(async () => {
      component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
      (component as any).getParlamentares = async (): Promise<[]> => [];
      await component.abrirDocumentoArticulado(documento());
      const editor: any = component.querySelector('lexml-eta-proposicao-editor');
      await editor.aguardarCarregamentoDasLinhas();
      // Aguarda o foco inicial na ementa (setTimeout).
      await new Promise(resolve => setTimeout(resolve, 50));
      quill = editor.quill;
      ementa = quill.linhaAtual;
      epigrafe = ementa.prev;
      preambulo = ementa.next;
      artigo = preambulo.next;
    });

    it('a ordem das linhas é epígrafe, ementa, preâmbulo e artigo', () => {
      expect([epigrafe.tipo, ementa.tipo, preambulo.tipo, artigo.tipo]).to.deep.equal(['Articulacao', 'Ementa', 'Preambulo', 'Artigo']);
    });

    it('o conteúdo do preâmbulo e o da epígrafe não são editáveis', () => {
      expect(preambulo.blotConteudo.domNode.getAttribute('contenteditable')).to.equal('false');
      expect(epigrafe.blotConteudo.domNode.getAttribute('contenteditable')).to.equal('false');
      expect(ementa.blotConteudo.domNode.getAttribute('contenteditable')).to.equal('true');
    });

    ['ArrowDown', 'ArrowRight'].forEach(tecla => {
      it(`${tecla} no fim da ementa pula o preâmbulo e vai ao início do Art. 1º`, () => {
        posicionar(fim(ementa));

        teclar(tecla);

        expect(quill.linhaAtual).to.equal(artigo);
        expect(quill.getSelection().index).to.equal(inicio(artigo));
      });
    });

    ['ArrowUp', 'ArrowLeft'].forEach(tecla => {
      it(`${tecla} no início do Art. 1º pula o preâmbulo e vai ao fim da ementa`, () => {
        posicionar(inicio(artigo));

        teclar(tecla);

        expect(quill.linhaAtual).to.equal(ementa);
        expect(quill.getSelection().index).to.equal(fim(ementa));
      });

      it(`${tecla} no início da ementa não entra na epígrafe`, () => {
        posicionar(inicio(ementa));

        teclar(tecla);

        expect(quill.linhaAtual).to.equal(ementa);
        expect(quill.getSelection().index).to.equal(inicio(ementa));
      });
    });

    it('a seleção levada ao preâmbulo volta para o Art. 1º, que continua a linha atual', () => {
      posicionar(inicio(artigo) + 2);

      posicionar(inicio(preambulo) + 3);

      expect(quill.linhaAtual).to.equal(artigo);
      expect(quill.getSelection().index).to.equal(inicio(artigo) + 2);
      expect(preambulo.domNode.classList.contains('container__elemento--ativo')).to.be.false;
    });

    it('a seleção levada à epígrafe volta para a ementa', () => {
      posicionar(inicio(ementa) + 1);

      posicionar(inicio(epigrafe) + 1);

      expect(quill.linhaAtual).to.equal(ementa);
      expect(quill.getSelection().index).to.equal(inicio(ementa) + 1);
    });
  })
);
