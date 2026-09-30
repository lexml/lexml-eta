/**
 * Grupo M — Forma "único"/numerada do parágrafo em ações que o recriam
 *
 * Change 2026-09-30-c01-preservar-paragrafo-unico-no-undo. Desfazer/refazer recria o parágrafo; ele precisa
 * voltar na mesma forma, senão rótulo, id e texto da remissão divergem ("parágrafo único" virava "§ 1º").
 *
 *   CT-M-01 — mover o art. 2º (parágrafo único referenciado), desfazer e refazer mantém "Parágrafo único."
 *             e o texto "parágrafo único do art. N"
 *   CT-M-02 — "§ 1º" único carregado de arquivo: remover o parágrafo e desfazer mantém "§ 1º"
 *             (não vira "Parágrafo único.")
 *
 * Fixtures geradas a partir de demo/doc/teste_remissao_caput.json (mesma estrutura do grupo L), acrescentando
 * o parágrafo ao art. 2º: a detecção automática não reconhece a forma absoluta, por isso a remissão vem do arquivo.
 */

const SEL_LINK_M = 'a.lexml-remissao-interna';
const SEL_LINK_INVALIDO_M = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_BTN_DESFAZER_M = '.lx-eta-btn-desfazer';
const SEL_BTN_REFAZER_M = 'button.lx-eta-ql-button[title="Refazer (Ctrl+y)"]';
const SEL_PARAGRAFO_M = 'div.container__elemento.elemento-tipo-paragrafo';

const abrirFixtureM = (arquivo: string): void => {
  cy.visit('/');
  cy.get('#fileUpload').selectFile(`demo/doc/${arquivo}`, { force: true });
  cy.getContainerArtigoByNumero(3).should('exist');
};

describe('Forma do parágrafo único ao desfazer/refazer ações que recriam o artigo', () => {
  it('CT-M-01: mover + desfazer + refazer mantém "Parágrafo único." e o texto da remissão', () => {
    abrirFixtureM('teste_remissao_paragrafo_unico.json');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_M).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_par1u').and('contain.text', 'parágrafo único do art. 2º');
    cy.get(SEL_PARAGRAFO_M).find('label').should('contain.text', 'Parágrafo único.');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Mover para cima');
    // A origem desce para art. 2º e o destino sobe para art. 1º.
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_M).should('have.attr', 'data-lexml-ref', 'art1_par1u').and('contain.text', 'parágrafo único do art. 1º');
    cy.get(SEL_PARAGRAFO_M).find('label').should('contain.text', 'Parágrafo único.');

    cy.get(SEL_BTN_DESFAZER_M).click();
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_M).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_par1u').and('contain.text', 'parágrafo único do art. 2º');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_M).should('not.exist');
    cy.get(SEL_PARAGRAFO_M).find('label').should('contain.text', 'Parágrafo único.');

    cy.get(SEL_BTN_REFAZER_M).click();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_M).should('have.attr', 'data-lexml-ref', 'art1_par1u').and('contain.text', 'parágrafo único do art. 1º');
    cy.get(SEL_PARAGRAFO_M).find('label').should('contain.text', 'Parágrafo único.');
  });

  it('CT-M-02: "§ 1º" único carregado permanece "§ 1º" ao remover o parágrafo e desfazer', () => {
    abrirFixtureM('teste_remissao_paragrafo_um.json');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_M).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_par1').and('contain.text', '§ 1º do art. 2º');
    cy.get(SEL_PARAGRAFO_M).find('label').should('contain.text', '§ 1º');

    cy.get(SEL_PARAGRAFO_M).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_M).should('have.length', 1);

    cy.get(SEL_BTN_DESFAZER_M).click();
    cy.get(SEL_PARAGRAFO_M).should('have.length', 1).find('label').should('contain.text', '§ 1º').and('not.contain.text', 'único');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_M).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_M).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_par1').and('contain.text', '§ 1º do art. 2º');
  });
});
