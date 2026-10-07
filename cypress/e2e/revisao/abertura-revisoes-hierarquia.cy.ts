/**
 * Abertura de documento articulado salvo com revisões da hierarquia.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-10-06-c02-salvar-abrir-revisoes-hierarquia:
 * abrir um arquivo com adição, exclusão com filhos, alteração de texto, movimentação e
 * transformação deve reaplicar as marcas de revisão sem nenhuma edição ao vivo.
 *
 * Fixture: demo/doc/teste_revisoes_hierarquia.json, gerada por criarDocumentoArticulado() (mesmo
 * código de produção usado ao salvar) a partir de demo/doc/prs_92_2023.json — não escrita à mão.
 * O lado de salvar não tem E2E (sem infraestrutura de download, ver docs/guia-cypress.md); fica
 * coberto pelos testes de integração com o CLI real.
 */

const SEL_LINHA_EM_REVISAO = 'div.container__elemento[em-revisao="true"]';
const SEL_LINHA_EXCLUIDA = 'div.container__elemento[excluido="true"]';
const SEL_MARCA_REVISAO = '.blot__revisao';
const TEXTO_ARTIGO_ALTERADO = 'alterado em revisão';

describe('Abertura de revisões da hierarquia persistidas', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
    cy.get('#fileUpload').selectFile('demo/doc/teste_revisoes_hierarquia.json', { force: true });
    cy.get(SEL_MARCA_REVISAO).should('have.length', 5);
  });

  it('reaplica as marcas com o autor e a data, e mostra o contador de revisões', () => {
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().should('contain.text', '5');
    cy.get(SEL_MARCA_REVISAO).each($marca => {
      expect($marca.text().trim()).to.equal('FT');
      expect($marca.attr('title')).to.match(/Usuário: Fulano de Tal \| Data\/Hora: \S+/);
    });
  });

  it('exibe o dispositivo excluído, com filhos, na posição original', () => {
    cy.get('div.container__elemento.elemento-tipo-artigo').first().should('have.attr', 'excluido', 'true');
    cy.get(SEL_LINHA_EXCLUIDA).should('have.length.at.least', 2);
    cy.get(SEL_LINHA_EM_REVISAO).contains(TEXTO_ARTIGO_ALTERADO).should('exist');
  });

  it('rejeitar a exclusão devolve o artigo e seus filhos', () => {
    cy.get(SEL_LINHA_EXCLUIDA).first().find('.blot__revisao_recusar').click({ force: true });

    cy.get(SEL_LINHA_EXCLUIDA).should('not.exist');
    cy.get(SEL_MARCA_REVISAO).should('have.length', 4);
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().should('contain.text', '4');
  });

  it('aceitar a alteração remove a marca e mantém o texto', () => {
    cy.contains('div.container__elemento', TEXTO_ARTIGO_ALTERADO).find('.blot__revisao_aceitar').click({ force: true });

    cy.contains('div.container__elemento', TEXTO_ARTIGO_ALTERADO).should('not.have.attr', 'em-revisao');
    cy.get(SEL_MARCA_REVISAO).should('have.length', 4);
  });
});
