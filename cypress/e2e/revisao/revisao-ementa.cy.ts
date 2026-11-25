/**
 * Revisão da ementa não trava as demais ações em revisão (#1107).
 *
 * Com uma revisão de texto na ementa, adicionar ou recusar um artigo lançava erro e deixava a
 * revisão do artigo sem como aceitar ou recusar. O Cypress falha o teste se a aplicação lançar
 * uma exceção não tratada.
 */
export {};

const SEL_EMENTA = '.elemento-tipo-ementa';
const SEL_ACEITAR = '.blot__revisao_aceitar';
const SEL_RECUSAR = '.blot__revisao_recusar';

describe('Revisão: alterar a ementa e depois aceitar ou recusar um artigo adicionado', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_885_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.ativarRevisaoDispositivo();

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(1).find(SEL_RECUSAR).should('exist');

    cy.get(SEL_EMENTA).digitarTextoRemissao('Texto acrescentado. ');
    cy.get(SEL_EMENTA).dispararDeteccaoRemissao();
    cy.get(SEL_EMENTA).find(SEL_RECUSAR).should('exist');
  });

  it('recusar o artigo adicionado remove o artigo e mantém a revisão da ementa', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_RECUSAR).click({ force: true });
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'passa a vigorar');
    cy.getContainerArtigoByNumero(1).find(SEL_RECUSAR).should('not.exist');
    cy.get(SEL_EMENTA).find(SEL_RECUSAR).should('exist');
  });

  it('aceitar o artigo adicionado mantém o artigo e a revisão da ementa', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_ACEITAR).click({ force: true });

    cy.getContainerArtigoByNumero(1).find(SEL_ACEITAR).should('not.exist');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'passa a vigorar');
    cy.get(SEL_EMENTA).find(SEL_ACEITAR).should('exist');
  });
});
