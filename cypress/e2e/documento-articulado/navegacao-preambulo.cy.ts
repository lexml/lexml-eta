/**
 * Setas pulam o preâmbulo, que não recebe o cursor.
 *
 * Cobre, pela UI real, a change 2026-11-04-c02-preambulo-sem-cursor (issue #1037). Sem fixture: a proposição
 * nova (PL) tem o preâmbulo padrão. O clique sobre o preâmbulo fica no teste de componente
 * (navegacaoCursor.component.test.ts), porque o clique sintético do Cypress não move a seleção do Quill.
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const SEL_EMENTA = '.elemento-tipo-ementa';
const SEL_PREAMBULO = '.elemento-tipo-preambulo';
const SEL_ARTIGO = '.elemento-tipo-artigo';
const ATIVO = 'container__elemento--ativo';

const textoDe = (seletor: string): string => `${seletor} p.texto__dispositivo`;

describe('Navegação pelas setas com preâmbulo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get(SEL_PREAMBULO).should('exist');
  });

  it('o texto do preâmbulo não é editável', () => {
    cy.get(textoDe(SEL_PREAMBULO)).should('have.attr', 'contenteditable', 'false');
  });

  it('seta para baixo no fim da ementa pula o preâmbulo e vai ao Art. 1º; seta para cima volta à ementa', () => {
    // Marca a ementa como atual (o clique sintético não dispara selection-change no Quill).
    cy.get(SEL_EMENTA).getOpcoesDeMenuDoDispositivo();
    cy.get(SEL_EMENTA).should('have.class', ATIVO);

    cy.get(textoDe(SEL_EMENTA)).type('{end}{downarrow}', { force: true });
    cy.get(SEL_ARTIGO).first().should('have.class', ATIVO);
    cy.get(SEL_PREAMBULO).should('not.have.class', ATIVO);

    cy.get(textoDe(SEL_ARTIGO)).first().type('{home}{uparrow}', { force: true });
    cy.get(SEL_EMENTA).should('have.class', ATIVO);
    cy.get(SEL_PREAMBULO).should('not.have.class', ATIVO);
  });
});
