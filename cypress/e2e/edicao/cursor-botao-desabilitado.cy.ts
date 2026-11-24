// #1098: botão desabilitado da barra mostrava a mão, como se o clique fizesse alguma coisa.
// Seleção por duplo clique nativo (CDP): a sintética não habilita o botão de remissão.
import { duploCliqueNativo } from '../../support/eventos-nativos';

describe('Cursor dos botões desabilitados das barras de ferramentas (#1098)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.wait(1000);
  });

  it('"Adicionar remissão" mostra a seta sem texto selecionado e a mão com texto selecionado', () => {
    cy.get('lexml-eta-proposicao-editor .btn-remissao-interna').should('be.disabled').and('have.css', 'cursor', 'default');

    cy.getContainerArtigoByNumero(1)
      .find('p.texto__dispositivo')
      .then($p => {
        const r = $p[0].getBoundingClientRect();
        return cy.window().then(win => duploCliqueNativo(win, r.left + 20, r.top + 8));
      });
    cy.get('lexml-eta-proposicao-editor .btn-remissao-interna').should('not.be.disabled').and('have.css', 'cursor', 'pointer');
  });

  it('"Adicionar comentário" da justificação mostra a seta sem texto selecionado', () => {
    cy.get('lexml-eta-editor-texto-rico .ql-lexml-eta-comentario').should('be.disabled').and('have.css', 'cursor', 'default');
  });
});
