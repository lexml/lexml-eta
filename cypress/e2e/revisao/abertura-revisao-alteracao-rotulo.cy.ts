/**
 * Abertura de documento articulado salvo com a revisão de alteração de rótulo (alteracaoRotulo).
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-10-07-c01-revisao-alteracao-rotulo: um arquivo com um
 * parágrafo "§ 4º-A" (com um inciso filho) renumerado em revisão para "§ 4º-B" deve reaplicar a marca, e
 * aceitar ou rejeitar a revisão deve manter ou devolver o rótulo e os ids sem nenhuma edição ao vivo.
 *
 * Fixture: demo/doc/teste_revisao_alteracao_rotulo.json, gerada por criarDocumentoArticulado() (mesmo código de
 * produção usado ao salvar) a partir da MPV 1234/2024 — não escrita à mão. A renumeração ao vivo pelo diálogo
 * "Informar numeração" fica sem E2E: depende do menu de contexto e de sl-dialog (docs/guia-cypress.md, §3, §4 e §12)
 * e o risco que cobriria (produtor e rejeição) já é coberto pelos testes de reducer.
 */

const SEL_LINHA_PARAGRAFO_EM_REVISAO = 'div.container__elemento.elemento-tipo-paragrafo[em-revisao="true"]';
const SEL_MARCA_ROTULO = '.blot__revisao';
const TEXTO_INCISO_ROTULO = 'inciso do parágrafo incluído.';
const ID_PARAGRAFO_4A = 'art1_cpt_alt1_art4_par4-1';
const ID_PARAGRAFO_4B = 'art1_cpt_alt1_art4_par4-2';

// O lexmlId vive no blot da linha (EtaContainerTable), não no DOM.
const lexmlIdDaLinhaComTexto = (win: Cypress.AUTWindow, texto: string): string | undefined => {
  const editor = win.document.querySelector('lexml-eta-proposicao-editor') as any;
  const p = Array.from(win.document.querySelectorAll('p.texto__dispositivo')).find(el => el.textContent?.includes(texto));
  return p ? editor.quill.constructor.find(p)?.parent?.parent?.parent?.lexmlId : undefined;
};

describe('Abertura da revisão de alteração de rótulo persistida', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
    cy.get('#fileUpload').selectFile('demo/doc/teste_revisao_alteracao_rotulo.json', { force: true });
    cy.get(SEL_MARCA_ROTULO).should('have.length', 1);
  });

  it('reaplica a marca no parágrafo renumerado, com o autor e a descrição do rótulo anterior', () => {
    cy.get(SEL_LINHA_PARAGRAFO_EM_REVISAO).should('have.length', 1).find('label').should('contain.text', '§ 4º-B');
    cy.get(SEL_MARCA_ROTULO).should('contain.text', 'FT');
    cy.get(SEL_MARCA_ROTULO).invoke('attr', 'title').should('contain', 'Rótulo do dispositivo foi alterado (rótulo antes era "§ 4º-A.")').and('contain', 'Usuário: Fulano de Tal');
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().should('contain.text', '1');
  });

  it('o inciso filho acompanha o id do parágrafo renumerado', () => {
    cy.window().should(win => {
      expect(lexmlIdDaLinhaComTexto(win, TEXTO_INCISO_ROTULO)).to.match(new RegExp(`^${ID_PARAGRAFO_4B}_inc`));
    });
  });

  it('rejeitar a revisão devolve o rótulo e os ids originais ao parágrafo e ao inciso filho', () => {
    cy.get(SEL_LINHA_PARAGRAFO_EM_REVISAO).find('.blot__revisao_recusar').click({ force: true });

    cy.get(SEL_MARCA_ROTULO).should('not.exist');
    cy.get('div.container__elemento.elemento-tipo-paragrafo label').contains('§ 4º-A').should('exist');
    cy.get('div.container__elemento.elemento-tipo-paragrafo label').contains('§ 4º-B').should('not.exist');
    cy.window().should(win => {
      expect(lexmlIdDaLinhaComTexto(win, TEXTO_INCISO_ROTULO)).to.match(new RegExp(`^${ID_PARAGRAFO_4A}_inc`));
    });
  });

  it('aceitar a revisão mantém o rótulo "§ 4º-B" e remove a marca', () => {
    cy.get(SEL_LINHA_PARAGRAFO_EM_REVISAO).find('.blot__revisao_aceitar').click({ force: true });

    cy.get(SEL_MARCA_ROTULO).should('not.exist');
    cy.get('div.container__elemento.elemento-tipo-paragrafo label').contains('§ 4º-B').should('exist');
    cy.get('div.container__elemento.elemento-tipo-paragrafo label').contains('§ 4º-A').should('not.exist');
    cy.window().should(win => {
      expect(lexmlIdDaLinhaComTexto(win, TEXTO_INCISO_ROTULO)).to.match(new RegExp(`^${ID_PARAGRAFO_4B}_inc`));
    });
  });
});
