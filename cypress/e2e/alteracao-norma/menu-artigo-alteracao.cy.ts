/**
 * Menu do artigo de alteração de norma (change 2026-09-29-c01, #264505)
 *
 * Artigo de alteração só tem o bloco de alteração: o menu não oferece "Adicionar inciso" nem
 * "Adicionar parágrafo". Um artigo comum continua oferecendo as duas ações.
 */

const OPCOES_FILHO_PROPRIO_BA = ['Adicionar inciso', 'Adicionar parágrafo'];

// getOpcoesDeMenuDoDispositivo devolve o botão do menu; os itens são os sl-menu-item do mesmo container.
const textosDoMenuBA = ($botao: JQuery<HTMLElement>): string[] =>
  $botao
    .closest('div.container__elemento')
    .find('sl-menu-item')
    .toArray()
    .map(el => (el.textContent || '').replace(/\s+/g, ' ').trim());

describe('Menu do artigo de alteração de norma', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    // O artigo inicial do bloco de alteração também é um container de artigo: 3 no total
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar alteração de norma');
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
  });

  it('artigo com bloco de alteração não oferece adicionar inciso nem parágrafo', () => {
    cy.getContainerArtigoByNumero(1)
      .getOpcoesDeMenuDoDispositivo()
      .should('exist')
      .then($botao => {
        const textos = textosDoMenuBA($botao);
        expect(textos, 'itens do menu').to.include('Remover (Ctrl+D)'); // garante que o menu foi lido de fato
        OPCOES_FILHO_PROPRIO_BA.forEach(
          opcao =>
            expect(
              textos.some(t => t.startsWith(opcao)),
              opcao
            ).to.be.false
        );
      });
  });

  it('artigo sem bloco de alteração continua oferecendo as duas ações', () => {
    cy.getContainerArtigoByNumero(2)
      .getOpcoesDeMenuDoDispositivo()
      .should('exist')
      .then($botao => {
        const textos = textosDoMenuBA($botao);
        OPCOES_FILHO_PROPRIO_BA.forEach(
          opcao =>
            expect(
              textos.some(t => t.startsWith(opcao)),
              opcao
            ).to.be.true
        );
      });
  });
});
