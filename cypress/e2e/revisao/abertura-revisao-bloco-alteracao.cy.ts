/**
 * Abertura de documento articulado salvo com artigo que altera norma excluído ou movido em revisão.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-10-20-c01-revisao-bloco-alteracao-excluido-movido: o bloco de
 * alteração do artigo (artigo e parágrafos de alteração) deve voltar junto com ele, sob uma única marca de revisão.
 *
 * Fixtures: demo/doc/teste_revisao_exclusao_bloco_alteracao.json e demo/doc/teste_revisao_movido_bloco_alteracao.json,
 * geradas por criarDocumentoArticulado() (mesmo código de produção usado ao salvar) a partir da MPV 1234/2024 — não
 * escritas à mão. A exclusão/movimentação ao vivo pela interface fica sem E2E: depende do menu de contexto
 * (docs/guia-cypress.md, §3 e §4) e do download do arquivo salvo, e é coberta pelos testes de reducer, de montagem
 * (`revisaoArticulacaoBlocoAlteracao.test.ts`) e de ida e volta (`reconstroiRevisoes.test.ts`).
 */

export {};

const SEL_LINHA_EXCLUIDA = 'div.container__elemento[excluido="true"]';
const SEL_MARCA_REVISAO = '.blot__revisao';
const TEXTO_PARAGRAFO_DO_BLOCO = 'trabalhadores domésticos';

const abreFixture = (arquivo: string): void => {
  cy.visit('/');
  cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
  cy.get('#fileUpload').selectFile(`demo/doc/${arquivo}`, { force: true });
  cy.get(SEL_MARCA_REVISAO).should('have.length', 1);
};

describe('Abertura de artigo com bloco de alteração excluído em revisão', () => {
  beforeEach(() => {
    abreFixture('teste_revisao_exclusao_bloco_alteracao.json');
  });

  it('exibe uma única marca de revisão para o artigo e o seu bloco de alteração', () => {
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().should('contain.text', '1');
    cy.get(SEL_MARCA_REVISAO).should('contain.text', 'FT');
  });

  it('exibe o bloco de alteração do artigo excluído, com os parágrafos', () => {
    cy.get('div.container__elemento.elemento-tipo-artigo').first().should('have.attr', 'excluido', 'true');
    cy.contains(SEL_LINHA_EXCLUIDA, TEXTO_PARAGRAFO_DO_BLOCO).should('exist');
    cy.get(SEL_LINHA_EXCLUIDA).should('have.length.at.least', 4);
  });

  it('rejeitar a exclusão devolve o artigo e o bloco de alteração', () => {
    cy.get(SEL_LINHA_EXCLUIDA).first().find('.blot__revisao_recusar').click({ force: true });

    cy.get(SEL_LINHA_EXCLUIDA).should('not.exist');
    cy.contains('div.container__elemento.elemento-tipo-paragrafo', TEXTO_PARAGRAFO_DO_BLOCO).should('exist');
    cy.get('div.container__elemento.elemento-tipo-artigo label').contains('Art. 1º').should('exist');
  });

  // Achado: o estado fica sem revisões (coberto em reconstroiRevisoes.test.ts), mas o botão "FT" da linha restaurada permanece no DOM.
  // Critério de aceite de uma correção futura do editor (indicadorMarcaRevisao ignora ElementoIncluido).
  it.skip('rejeitar a exclusão não deixa marca de revisão na linha restaurada', () => {
    cy.get(SEL_LINHA_EXCLUIDA).first().find('.blot__revisao_recusar').click({ force: true });

    cy.get(SEL_MARCA_REVISAO).should('not.exist');
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().should('contain.text', '0');
  });
});

describe('Abertura de artigo com bloco de alteração movido em revisão', () => {
  beforeEach(() => {
    abreFixture('teste_revisao_movido_bloco_alteracao.json');
  });

  it('exibe uma única marca de movimentação, sem marcas nos dispositivos do bloco', () => {
    cy.get(SEL_MARCA_REVISAO).invoke('attr', 'title').should('contain', 'Dispositivo movido');
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().should('contain.text', '1');
  });

  it('rejeitar a movimentação devolve o artigo e o bloco à posição original', () => {
    cy.get('div.container__elemento[em-revisao="true"]').first().find('.blot__revisao_recusar').click({ force: true });

    cy.get(SEL_MARCA_REVISAO).should('not.exist');
    cy.contains('div.container__elemento.elemento-tipo-paragrafo', TEXTO_PARAGRAFO_DO_BLOCO).should('exist');
    cy.get('div.container__elemento.elemento-tipo-artigo').first().find('label').should('contain.text', 'Art. 1º');
  });
});
