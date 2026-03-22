/// <reference types="cypress" />

// Seletores confirmados via inspeção DOM (light DOM — sem shadow())
const SEL_BTN_ADICIONAR_REMISSAO = '.btn-remissao-interna';
const SEL_BTN_REMOVER_REMISSAO = '.btn-remover-remissao';
const SEL_LINK_REMISSAO = 'a.lexml-remissao-interna';
const SEL_LINK_REMISSAO_INVALIDA = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_DESTAQUE_REMISSAO = '.lexml-remissao-destaque';

/**
 * Clica no botão "Adicionar remissão" na toolbar.
 */
Cypress.Commands.add('clicarAdicionarRemissao', (): void => {
  cy.get(SEL_BTN_ADICIONAR_REMISSAO).click();
});

/**
 * Clica no botão "Remover remissão" na toolbar (só habilitado quando cursor está sobre um link).
 */
Cypress.Commands.add('clicarRemoverRemissao', (): void => {
  cy.get(SEL_BTN_REMOVER_REMISSAO).should('not.be.disabled').click();
});

/**
 * Retorna o botão "Adicionar remissão".
 */
Cypress.Commands.add('getBotaoAdicionarRemissao', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_BTN_ADICIONAR_REMISSAO);
});

/**
 * Retorna o botão "Remover remissão".
 */
Cypress.Commands.add('getBotaoRemoverRemissao', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_BTN_REMOVER_REMISSAO);
});

/**
 * Retorna todos os links de remissão presentes no documento.
 */
Cypress.Commands.add('getLinksRemissao', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_LINK_REMISSAO);
});

/**
 * Retorna links de remissão inválidos (com classe lexml-remissao-invalida).
 */
Cypress.Commands.add('getLinksRemissaoInvalidos', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_LINK_REMISSAO_INVALIDA);
});

/**
 * Retorna um link de remissão pelo seu data-ref-id.
 */
Cypress.Commands.add('getLinkRemissaoPorRefId', (refId: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(`${SEL_LINK_REMISSAO}[data-ref-id="${refId}"]`);
});

/**
 * Retorna o elemento com destaque de navegação após clicar num link de remissão.
 */
Cypress.Commands.add('getDestinoRemissaoDestacado', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_DESTAQUE_REMISSAO);
});

/**
 * Insere texto no modelo Quill do dispositivo atual (linhaAtual).
 * Usa quill.insertText() para atualizar tanto o delta do Quill quanto o DOM,
 * garantindo que quill.getText() retorne o texto correto em renderizarRemissoesDoState.
 * NÃO usar alterarTextoDoDispositivo — ele bypassa o Quill e não aciona a detecção.
 */
Cypress.Commands.add('digitarTextoRemissao', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, texto: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.window().then(win => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
    const quill = editorEl?.quill;
    if (!quill) return;

    // Localiza o p.texto__dispositivo diretamente pelo container (subject)
    const p = subject[0]?.querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
    if (!p) return;

    // Usa o construtor herdado (EtaQuill extends Quill) para encontrar o blot via Quill.find()
    const EtaQuillClass = quill.constructor as any;
    const blot = EtaQuillClass.find(p);
    if (!blot) return;

    const blotStart = blot.offset(quill.scroll);

    // Insere o texto no Quill (atualiza delta + DOM simultaneamente).
    quill.insertText(blotStart, texto, 'silent');

    // Atualiza linhaAtual para o dispositivo onde o texto foi inserido,
    // pois linhaAtual pode ainda apontar para o dispositivo anterior.
    const uuidStr = p.id?.replace('texto__dispositivo', '');
    const uuid = uuidStr ? parseInt(uuidStr, 10) : NaN;
    if (!isNaN(uuid) && quill.getLinha) {
      const linha = quill.getLinha(uuid);
      if (linha) {
        quill.atualizarLinhaCorrente(linha);
      }
    }
  });
  return cy.wrap(subject);
});

/**
 * Dispara detecção de remissão via cy.window(), chamando emitirEventoOnChange no componente
 * editor. Esta abordagem é mais robusta que depender de cursor move em elementos de largura 0
 * ou de bugs no Quill (verificarMudouLinha retorna false em range.index === 0).
 *
 * Pré-condição: quill.linhaAtual deve ser o dispositivo cujo texto queremos detectar.
 * Após selecionarOpcaoDeMenuDoDispositivo, o linhaAtual é automaticamente o novo dispositivo.
 */
Cypress.Commands.add('dispararDeteccaoRemissao', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.window().then(win => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
    if (editorEl) {
      // Força htmlAnt = '' para garantir alterado = true, depois dispara detecção
      const lc = editorEl.quill?.linhaAtual;
      if (lc?.blotConteudo) {
        lc.blotConteudo.htmlAnt = '';
      }
      editorEl.emitirEventoOnChange?.('cypress');
    }
  });
  return cy.wrap(subject);
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      clicarAdicionarRemissao(): void;
      clicarRemoverRemissao(): void;
      getBotaoAdicionarRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getBotaoRemoverRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getLinksRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getLinksRemissaoInvalidos(): Cypress.Chainable<JQuery<HTMLElement>>;
      getLinkRemissaoPorRefId(refId: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getDestinoRemissaoDestacado(): Cypress.Chainable<JQuery<HTMLElement>>;
      digitarTextoRemissao(texto: string): Cypress.Chainable<JQuery<HTMLElement>>;
      dispararDeteccaoRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
