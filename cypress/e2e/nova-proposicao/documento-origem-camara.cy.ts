/**
 * Texto de outra proposição na Câmara (Tela 2b) — change 2026-11-16-c01-nova-proposicao-cd-lista-documentos.
 *
 * Cobre, pela UI real, a escolha do documento de origem de um substitutivo/subemenda substitutiva da CD contra o
 * mock da demo (GET /demo-api/materias/{sigla}/{numero}/{ano}/documentos e /demo-api/documentos/{id}/texto,
 * demo/server/handlers.mjs, sem cy.intercept). Massa: PL 4/2025 (6 documentos, o PL 480/2025 sem texto
 * estruturado), PL 4687/2023 (sem documentos) e PL 5008/2023 (sem mock: matéria não encontrada).
 * Viabilidade conforme docs/guia-cypress.md: light DOM + Shoelace, apoio em cypress/support/nova-proposicao.ts.
 */
import { deveEstarDesabilitado, deveEstarHabilitado, digitarEmSl, escolherComissao, escolherItemLista, marcarRadioSl } from '../../support/nova-proposicao';

const BOTAO_NOVA = 'div.lexml-eta-main-header--actions input[type="button"][value="Nova proposição"]';
const MODAL = '#dialogNovaProposicao';
const LISTA = '#np-docs-lista';

const linha = (id: string): string => `${LISTA} .np-doc[data-id="${id}"]`;

const irParaTela2 = (): void => {
  cy.get('#casaEditor').select('CD');
  cy.get(BOTAO_NOVA).click();
  cy.get(`${MODAL}[open]`).should('exist');
  marcarRadioSl('especie', 'subemenda');
  escolherItemLista('#np-sigla-proposicao', 'PL');
  digitarEmSl('#np-numero-proposicao', '4');
  digitarEmSl('#np-ano-proposicao', '2025');
  cy.get('#np-proposicao-verificar').click();
  escolherComissao('CCJC');
  cy.get('#np-continuar').click();
};

const irParaTela2b = (): void => {
  irParaTela2();
  marcarRadioSl('opcaoTexto', 'outra');
  cy.get('#np-continuar').click();
  cy.get('#np-tela-2b').should('exist');
};

describe('Nova proposição na CD — documento de origem (Tela 2b)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('a opção "Texto de outra proposição" não pede sigla, número nem ano e leva à Tela 2b', () => {
    irParaTela2();
    marcarRadioSl('opcaoTexto', 'outra');
    cy.get('#np-sigla-outra').should('not.exist');
    cy.get('#np-numero-outra').should('not.exist');
    cy.get('#np-outra-verificar').should('not.exist');
    deveEstarHabilitado('#np-continuar');

    cy.get('#np-continuar').click();
    cy.get('#np-tela-2b').should('exist');
    cy.get('#np-g-materia').should('contain.text', 'Nesta mesma matéria (PL 4/2025)');
  });

  it('lista os documentos da matéria, filtra, seleciona e abre o editor com o texto do documento', () => {
    irParaTela2b();
    cy.get(`${LISTA} .np-doc`).should('have.length', 6);
    cy.get(linha('prl-1-ccjc-parecer')).should('contain.text', 'Relator: Dep. Beltrano').and('contain.text', '12/08/2025');
    deveEstarDesabilitado('#np-continuar');

    cy.get('#np-docs-filtro').shadow().find('input').type('12/08/2025');
    cy.get(`${LISTA} .np-doc`).should('have.length', 1);
    cy.get(linha('prl-1-ccjc-parecer')).click();
    cy.get('#np-fonte-selecionada').should('contain.text', 'Parecer do relator 1 – CCJC').and('contain.text', 'matéria PL 4/2025');
    deveEstarHabilitado('#np-continuar');

    cy.get('#np-continuar').click();
    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get('lexml-eta').should($el => {
      const urn = ($el[0] as any).getDocumentoArticulado().value.metadado.identificacao.urn;
      expect(urn).to.match(/^urn:lex:br:camara\.deputados:subemenda\.substitutiva;ssp:\d{4};999999$/);
    });
  });

  it('documento sem texto estruturado fica desabilitado e não pode ser selecionado', () => {
    irParaTela2b();
    cy.get(linha('pl-480-2025-apensado')).should('have.attr', 'aria-disabled', 'true').and('contain.text', 'Texto estruturado não disponível');
    cy.get(linha('pl-480-2025-apensado')).click();
    cy.get('#np-fonte-selecionada').should('not.exist');
    deveEstarDesabilitado('#np-continuar');
  });

  it('Trocar descarta a seleção e Voltar retorna à Tela 2 com a opção preservada', () => {
    irParaTela2b();
    cy.get(linha('prl-1-csaude-substitutivo')).click();
    cy.get('#np-fonte-selecionada').should('exist');
    cy.get('#np-trocar').click();
    cy.get('#np-fonte-selecionada').should('not.exist');
    deveEstarDesabilitado('#np-continuar');

    cy.get('#np-voltar').click();
    cy.get('#np-tela-2b').should('not.exist');
    cy.get('sl-radio[name="opcaoTexto"][value="outra"]').should('have.attr', 'checked');
  });

  it('em outra matéria: lista vazia e matéria sem mock informam o resultado', () => {
    irParaTela2b();
    marcarRadioSl('materia', 'outra');
    cy.get(LISTA).should('not.exist');
    escolherItemLista('#np-sigla-materia', 'PL');
    digitarEmSl('#np-numero-materia', '4687');
    digitarEmSl('#np-ano-materia', '2023');
    cy.get('#np-materia-verificar').click();
    cy.get('#np-docs-vazia').should('exist');
    deveEstarDesabilitado('#np-continuar');

    digitarEmSl('#np-numero-materia', '5008');
    cy.get('#np-docs-vazia').should('not.exist');
    cy.get('#np-materia-verificar').click();
    cy.get('#np-materia-nao-encontrada').should('exist');
  });
});
