/**
 * Abertura de documento com numeração repetida (change 2026-11-23-c01-validacao-numeracao-flexivel, #1066).
 *
 * Fixture: demo/doc/teste_numeracao_repetida.json, gerada por criarDocumentoArticulado() (mesmo código de produção
 * usado ao salvar), não escrita à mão: "Art. 5º", "Art. 5º" (com dois incisos) e "Art. 6º".
 * O modo flexível é ligado no objeto de configuração da demo antes de abrir o arquivo (o `#fileUpload` da demo lê o
 * arquivo com o mesmo modo do componente).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_numeracao_repetida.json';
const ERRO = 'Dispositivo com numeração repetida';
const ALERTA = 'Existem dispositivos com numeração repetida.';

const SEL_ARTIGO = 'div.container__elemento.elemento-tipo-artigo';
const artigo = (indice: number): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(SEL_ARTIGO).eq(indice);
// Conta com retry (e aceita zero): cy.get('div.mensagem') exigiria ao menos uma mensagem na tela.
const esperarMensagensDeNumeracao = (quantidade: number): Cypress.Chainable<JQuery<HTMLElement>> =>
  cy.get<HTMLElement>('body').should($body => {
    const mensagens = $body.find('div.mensagem').filter((_, el) => (el.textContent ?? '').includes(ERRO));
    expect(mensagens).to.have.length(quantidade);
  });
const textoDosAlertas = (): Cypress.Chainable<string> => cy.get('lexml-eta-alertas').then($el => $el[0].shadowRoot?.textContent ?? '');

const ligarModoFlexivel = (): void => {
  cy.get('demo-view').then($el => {
    ($el[0] as any).etaConfig.validacaoNumeracao = 'flexivel';
  });
};

describe('Abertura de documento com numeração repetida', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
  });

  describe('modo flexível', () => {
    beforeEach(() => {
      ligarModoFlexivel();
      cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
      cy.get(SEL_ARTIGO).should('have.length', 3);
    });

    it('exibe o alerta global e o erro só no segundo "Art. 5º"', () => {
      cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').to.include(ALERTA));
      cy.get('lexml-eta-alertas').shadow().find('sl-alert').contains(ALERTA).find('.alert__close-button').should('not.exist');

      artigo(0).find('div.mensagem').should('not.exist');
      artigo(1).find('div.mensagem').should('contain.text', ERRO);
      artigo(2).find('div.mensagem').should('not.exist');
      // Os incisos do segundo artigo repetem o id só por herança: não recebem o erro.
      cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 2).find('div.mensagem').should('not.exist');
      esperarMensagensDeNumeracao(1);
    });

    it('"Corrigir agora" renumera os artigos, retira o erro e o alerta', () => {
      // O clique age na linha do cursor: a linha do segundo artigo é marcada antes (guia, seção 4).
      artigo(1).getOpcoesDeMenuDoDispositivo();
      artigo(1).find('.mensagem__fix').click();

      cy.get(SEL_ARTIGO).should($artigos => {
        expect($artigos.toArray().map(a => a.querySelector('label')?.textContent?.trim())).to.deep.equal(['Art. 1º', 'Art. 2º', 'Art. 3º']);
      });
      esperarMensagensDeNumeracao(0);
      cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').not.to.include(ALERTA));
    });

    it('desfazer devolve os dois "Art. 5º", o erro e o alerta', () => {
      artigo(1).getOpcoesDeMenuDoDispositivo();
      artigo(1).find('.mensagem__fix').click();
      cy.get(SEL_ARTIGO).eq(2).find('label').should('contain.text', 'Art. 3º');

      cy.get('.lx-eta-btn-desfazer').click({ force: true });

      cy.get(SEL_ARTIGO).should($artigos => {
        expect($artigos.toArray().map(a => a.querySelector('label')?.textContent?.trim())).to.deep.equal(['Art. 5º', 'Art. 5º', 'Art. 6º']);
      });
      esperarMensagensDeNumeracao(1);
      cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').to.include(ALERTA));
    });
  });

  describe('modo rígido (padrão)', () => {
    it('recusa o mesmo arquivo e não abre o documento', () => {
      cy.window().then(win => cy.stub(win, 'alert').as('alerta'));

      cy.get('#fileUpload').selectFile(FIXTURE, { force: true });

      cy.get('@alerta').should('have.been.calledWithMatch', /repetidos/);
      cy.get(SEL_ARTIGO).should('not.exist');
      textoDosAlertas().should('not.include', ALERTA);
    });
  });
});
