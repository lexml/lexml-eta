// #1097: os botões ficavam habilitados com o modo de revisão desligado e longe da chave "Marcas de revisão".
export {};

const BARRA = 'lexml-eta-proposicao-editor #lx-eta-barra-ferramenta';
const TITULOS = ['Ir para o próximo dispositivo revisado', 'Ir para o dispositivo revisado anterior'];

const retangulo = (el: Element): DOMRect => el.getBoundingClientRect();
const centroVertical = (r: DOMRect): number => r.top + r.height / 2;

describe('Botões de navegação entre dispositivos revisados (#1097)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('com o modo desligado ficam desabilitados, em cinza, com a seta e ao lado da chave', () => {
    cy.get(`${BARRA} .button-navegacao-marca`).should($botoes => {
      expect($botoes.toArray().map(b => b.getAttribute('title'))).to.deep.equal(TITULOS);
      $botoes.toArray().forEach(b => {
        expect((b as HTMLButtonElement).disabled, `${b.title} desabilitado`).to.be.true;
        expect(getComputedStyle(b).cursor, `${b.title} cursor`).to.equal('default');
        expect(getComputedStyle(b).color, `${b.title} cor`).to.equal('rgb(185, 185, 185)');
      });
    });

    cy.get(BARRA).then($barra => {
      const barra = $barra[0];
      const [proximo, anterior] = Array.from(barra.querySelectorAll('.button-navegacao-marca')).map(retangulo);
      const comentario = retangulo(barra.querySelector('.button-comentario-articulacao')!);
      const chave = retangulo(barra.querySelector('#chk-em-revisao')!);

      expect(proximo.left, 'à direita do "Adicionar comentário"').to.be.greaterThan(comentario.right);
      expect(anterior.left, 'anterior depois do próximo').to.be.greaterThan(proximo.left);
      expect(chave.left - anterior.right, 'logo à esquerda da chave').to.be.within(0, 20);
      expect(Math.abs(centroVertical(proximo) - centroVertical(chave)), 'na linha da chave').to.be.lessThan(10);
    });
  });

  it('ligar o modo de revisão os habilita, com a mão', () => {
    cy.ativarRevisaoDispositivo();
    cy.get(`${BARRA} .button-navegacao-marca`).should($botoes => {
      $botoes.toArray().forEach(b => {
        expect((b as HTMLButtonElement).disabled, `${b.title} habilitado`).to.be.false;
        expect(getComputedStyle(b).cursor, `${b.title} cursor`).to.equal('pointer');
      });
    });
  });
});
