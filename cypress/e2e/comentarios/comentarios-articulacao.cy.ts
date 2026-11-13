/**
 * Comentários na articulação (change 2026-11-08-c01-comentarios-articulacao).
 *
 * A linha é marcada com getOpcoesDeMenuDoDispositivo antes de agir: o clique sintético não marca a linha atual do Quill.
 * Os modais ficam fora das abas (contêiner .comentarios-modais no body).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_justificacao.json';
const SEL_PARAGRAFO = 'div.container__elemento.elemento-tipo-paragrafo';
const SEL_BOTAO = '#lx-eta-barra-ferramenta .button-comentario-articulacao';
const SEL_MODAIS = '.comentarios-modais';
const SEL_CARD = 'lexml-eta-comentarios .comentario-sequencia';
const SEL_ICONE = `${SEL_PARAGRAFO} .blot__opcoes_comentario`;

// sl-button: o clique é disparado direto, sem depender do shadow DOM já renderizado.
const clicarSlButton = (seletor: string): void => {
  cy.get(seletor).then($botao => $botao[0].dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true })));
};

const marcarParagrafo = (): void => {
  cy.get(SEL_PARAGRAFO).first().getOpcoesDeMenuDoDispositivo();
};

const comentarParagrafo = (texto: string): void => {
  marcarParagrafo();
  cy.get(SEL_BOTAO).should('not.be.disabled').click();
  cy.get(`${SEL_MODAIS} .comentario-modal__trecho-texto`).should('have.text', 'parágrafo único do art. 1º');
  cy.get(`${SEL_MODAIS} #textarea-comentario`).should('be.visible').type(texto, { delay: 0 });
  clicarSlButton(`${SEL_MODAIS} #btn-confirmar-comentario`);
  cy.get(`${SEL_MODAIS} #dlg-comentario`).should('not.have.attr', 'open');
};

describe('Comentários na articulação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
    cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('comenta um dispositivo pela barra, acompanha a renumeração e o clique no ícone', () => {
    comentarParagrafo('Revisar a redação.');

    cy.get(SEL_ICONE).should('have.length', 1);
    cy.get('sl-tab[panel="comentarios"]').should('have.attr', 'active');
    cy.get(SEL_CARD).should('have.length', 1).and('have.class', 'comentario-sequencia--selecionada');
    cy.get(`${SEL_CARD} .comentario-sequencia__origem`).should('have.text', 'No texto');
    cy.get(`${SEL_CARD} .comentario-sequencia__trecho-texto`).should('have.text', 'parágrafo único do art. 1º');
    cy.get(`${SEL_CARD} .comentario-item__texto`).should('have.text', 'Revisar a redação.');

    // O botão fica desabilitado no dispositivo já comentado.
    marcarParagrafo();
    cy.get(SEL_BOTAO).should('be.disabled').and('have.attr', 'title', 'Este dispositivo já possui comentário');

    // Um artigo antes do art. 1º renumera o dispositivo comentado.
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.get(`${SEL_CARD} .comentario-sequencia__trecho-texto`).should('have.text', 'parágrafo único do art. 2º');
    cy.get(SEL_ICONE).should('have.length', 1);

    // O ícone exibe a aba de comentários com a sequência destacada.
    cy.get('sl-tab[panel="notas"]').click();
    cy.get(SEL_CARD).should('not.have.class', 'comentario-sequencia--selecionada');
    cy.get(SEL_ICONE).click({ force: true });
    cy.get('sl-tab[panel="comentarios"]').should('have.attr', 'active');
    cy.get(SEL_CARD).should('have.class', 'comentario-sequencia--selecionada');
  });

  it('excluir o dispositivo remove a sequência, e desfazer não a recria', () => {
    comentarParagrafo('Revisar.');
    cy.get(SEL_CARD).should('have.length', 1);

    cy.get(SEL_PARAGRAFO).first().selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.get(SEL_PARAGRAFO).should('not.exist');
    cy.get(SEL_CARD).should('not.exist');
    cy.get('lexml-eta-comentarios').should('contain.text', 'Não há comentários registrados.');

    cy.get('.lx-eta-btn-desfazer').click();
    cy.get(SEL_PARAGRAFO).should('have.length', 1);
    cy.get(SEL_ICONE).should('not.exist');
    cy.get(SEL_CARD).should('not.exist');
  });

  describe('em tela de celular', () => {
    beforeEach(() => {
      cy.viewport(700, 800);
    });

    it('o botão "Comentários" da barra do texto articulado abre o modal da lista', () => {
      cy.get('lexml-eta-proposicao-editor .mobile-buttons .btn-comentarios').should('be.visible').click();
      cy.get(`${SEL_MODAIS} #dlg-lista-comentarios`).should('have.attr', 'open');
      cy.get(`${SEL_MODAIS} #dlg-lista-comentarios`).should('contain.text', 'Não há comentários registrados.');
      clicarSlButton('#btn-fechar-lista-comentarios');
      cy.get(`${SEL_MODAIS} #dlg-lista-comentarios`).should('not.have.attr', 'open');
    });
  });
});
