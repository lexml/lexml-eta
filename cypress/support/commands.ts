/// <reference types="cypress" />
import { Emenda } from '../../src/model/emenda/emenda';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

export type TipoMensagemContainerDispositivo = 'warning' | 'danger';
export interface AbrirEmendaPayloadCypress {
  fixtureEmendaJson: string;
}
export interface NovaEmendaPayloadCypress {
  projetoNormaSelectValue: string;
  modoEmendaSelectValue: string;
  naoMostrarExplicacaoSufixo?: boolean;
}

export interface ChecarDadosAposAbrirEmendaPayloadCypress {
  emenda: Emenda;
  checarMensagemRenumeracao?: boolean;
}

export interface ChecarEstadoInicialAoCriarNovaEmenda {
  nomeProposicao: string;
  totalElementos?: number;
}

const tempoDeEsperaPadrao = 100;
const tempoDeEsperaMaior = 1000;

Cypress.Commands.add('ignorarErro', (text: string) => {
  Cypress.on('uncaught:exception', err => {
    if (err.message.includes(text)) {
      console.log('ERRO IGNORADO:', text);
      return false;
    }
  });
});

Cypress.Commands.add('irParaPagina', (numeroPagina: number): void => {
  cy.get('#selectPaginaArticulacao').select(numeroPagina + '');
});

Cypress.Commands.add('abrirEmenda', (payload: AbrirEmendaPayloadCypress): Cypress.Chainable<Emenda> => {
  const baseFolder = 'cypress/fixtures/';
  return cy.fixture(payload.fixtureEmendaJson).then((emenda: Emenda) => {
    cy.get('#fileUpload').selectFile(baseFolder + payload.fixtureEmendaJson, { force: true });
    return cy.wrap(emenda);
  });
});

Cypress.Commands.add('novaEmenda', (payload: NovaEmendaPayloadCypress): Cypress.Chainable<any> => {
  if (payload.naoMostrarExplicacaoSufixo ?? true) {
    cy.window().then(win => {
      win.localStorage.setItem('naoMostrarExplicacaoSufixo', 'true');
    });
  }
  cy.get('#projetoNorma').select(payload.projetoNormaSelectValue);
  cy.get('#modo').select(payload.modoEmendaSelectValue);
  cy.get('div.lexml-eta-main-header--selecao input[type="button"][value="Ok"]').click();
  return cy.wrap(true);
});

Cypress.Commands.add('getContainerArtigoByNumero', (numero: number): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get('div.container__elemento.elemento-tipo-artigo div.container__texto--nivel0 label').then($labels => {
    const regex = new RegExp(`^Art\\. ${numero}(\\.|º)$`);
    const $matchingLabel = $labels.filter((index, label) => regex.test(label.textContent || '')); // Filtra os labels que correspondem ao número do artigo
    if ($matchingLabel.length) {
      return cy.wrap($matchingLabel).closest('div.container__elemento.elemento-tipo-artigo');
    } else {
      return cy.wrap(Cypress.$()); // Retorna um objeto jQuery vazio dentro de um Chainable
    }
  });
});

Cypress.Commands.add('getContainerArtigoNormaByNumero', (numero: number): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get('div.container__elemento.elemento-tipo-artigo div.container__texto--nivel1 label').then($labels => {
    const regex = new RegExp(`^Art\\. ${numero}(\\.|º)$`);
    const $matchingLabel = $labels.filter((index, label) => regex.test(label.textContent || '')); // Filtra os labels que correspondem ao número do artigo
    if ($matchingLabel.length) {
      return cy.wrap($matchingLabel).closest('div.container__elemento.elemento-tipo-artigo');
    } else {
      return cy.wrap(Cypress.$()); // Retorna um objeto jQuery vazio dentro de um Chainable
    }
  });
});

Cypress.Commands.add('getContainerArtigoByRotulo', (rotulo: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const regex = new RegExp(`${rotulo}`);
  return cy.get('div.container__elemento.elemento-tipo-artigo div.container__texto--nivel0 label').contains(regex).first().closest('div.container__elemento.elemento-tipo-artigo');
});

Cypress.Commands.add('getContainerArtigoNormaByRotulo', (rotulo: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const regex = new RegExp(`${rotulo}`);
  return cy.get('div.container__elemento.elemento-tipo-artigo div.container__texto--nivel1 label').contains(regex).first().closest('div.container__elemento.elemento-tipo-artigo');
});

Cypress.Commands.add('getContainerParagrafoNormaByRotulo', (rotulo: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const regex = new RegExp(`${rotulo}`);
  return cy
    .get('div.container__elemento.elemento-tipo-paragrafo div.container__texto--nivel2 label')
    .contains(regex)
    .first()
    .closest('div.container__elemento.elemento-tipo-paragrafo');
});

Cypress.Commands.add('getContainerIncisoNormaByRotulo', (rotulo: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const regex = new RegExp(`${rotulo}`);
  return cy.get('div.container__elemento.elemento-tipo-inciso div.container__texto--nivel3 label').contains(regex).first().closest('div.container__elemento.elemento-tipo-inciso');
});

Cypress.Commands.add('getContainerAlineaNormaByRotulo', (rotulo: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const regex = new RegExp(`${rotulo}`);
  return cy.get('div.container__elemento.elemento-tipo-alinea div.container__texto--nivel4 label').contains(regex).first().closest('div.container__elemento.elemento-tipo-alinea');
});

Cypress.Commands.add('selecionarOpcaoDeMenuDoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, opcaoDeMenu: string): void => {
  cy.wrap(subject).click().find('div.container__menu > sl-dropdown').click().find('sl-menu > sl-menu-item').contains(opcaoDeMenu).click();
});

Cypress.Commands.add('getOpcoesDeMenuDoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.wrap(subject).get('.lx-eta-dropbtn');
});

Cypress.Commands.add('focusOnConteudo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.wrap(subject).find('div.container__texto p.texto__dispositivo').click({ force: true }).focus();
  return cy.wrap(subject);
});

Cypress.Commands.add('alterarTextoDoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, texto: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const wrapSubject = cy.wrap(subject);
  wrapSubject.find('div.container__texto p.texto__dispositivo').invoke('text', texto);
  wrapSubject.closest('lexml-eta-proposicao-editor').then($eta => {
    const eta = $eta[0];
    (eta as any).emitirEventoOnChange('cypress');
  });
  return wrapSubject;
});

Cypress.Commands.add('digitarNoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, texto: string, replace = false): Cypress.Chainable<JQuery<HTMLElement>> => {
  /* OBSERVAÇÃO
    - O uso de "type" para "digitar" texto no dispositivo está inconsistente. Às vezes, o texto é digitado, às vezes não.
    - Se o objetivo for apenas alterar o texto, o comando "alterarTextoDoDispositivo" é mais confiável.
    - Use esse comando apenas quando quiser simular a digitação de teclas de controle, como "Enter", "Tab", "End", "Home", "Alt + seta para cima", etc.
  */

  // cy.wrap(subject).as('containerDispositivo').find('div.container__texto p.texto__dispositivo').focus().type(texto, { force: true });
  cy.wrap(subject)
    .as('containerDispositivo')
    .find('div.container__texto p.texto__dispositivo')
    .as('pTextoDispositivo')
    // .focus()
    .then($p => {
      replace && $p.text('');
      cy.wrap($p)
        .wait(Cypress.config('isInteractive') ? tempoDeEsperaPadrao : tempoDeEsperaMaior)
        .type(texto, { delay: 5 });
    });
  return cy.get('@containerDispositivo');
});

Cypress.Commands.add('inserirTextoNaJustificacao', (texto: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.get('#sl-tab-2').click();
  cy.get('#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor')
    .as('qlJustificacao')
    .should('be.visible')
    .focus()
    .then($el => {
      cy.wrap($el).type(texto, { force: true, delay: 0 });
    });
  return cy.get('@qlJustificacao');
});

Cypress.Commands.add('getTextoDoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<string> => {
  return cy.wrap(subject).find('div.container__texto p.texto__dispositivo').invoke('text');
});

Cypress.Commands.add('getSwitchRevisaoDispositivo', () => {
  return cy.get('lexml-eta-emenda lexml-eta-switch-revisao.revisao-container').as('switchRevisaoDispositivo');
});

Cypress.Commands.add('getCheckRevisao', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  // Este comando deve ser encadeado com o comando "getSwitchRevisaoDispositivo" ou "getSwitchRevisaoTextoLivre"
  return cy.wrap(subject).find('#chk-em-revisao') as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
});

Cypress.Commands.add('getContadorRevisao', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  // Este comando deve ser encadeado com o comando "getSwitchRevisaoDispositivo" ou "getSwitchRevisaoTextoLivre"
  return cy.wrap(subject).find('sl-badge') as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
});

Cypress.Commands.add('ativarRevisaoDispositivo', (ocultarDisclaimerRevisao = true): void => {
  if (ocultarDisclaimerRevisao) {
    cy.window().then(win => {
      win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true');
    });
  }
  cy.getSwitchRevisaoDispositivo().getCheckRevisao().as('chkRevisaoDispositivo').should('not.have.attr', 'checked');
  cy.wait(tempoDeEsperaPadrao);
  cy.get('@chkRevisaoDispositivo').click().should('have.attr', 'checked');
  cy.wait(tempoDeEsperaMaior);
});

Cypress.Commands.add('desativarRevisaoDispositivo', (): void => {
  cy.getSwitchRevisaoDispositivo().getCheckRevisao().as('chkRevisaoDispositivo').should('have.attr', 'checked');
  cy.wait(tempoDeEsperaPadrao);
  cy.get('@chkRevisaoDispositivo').click().should('not.have.attr', 'checked');
  cy.wait(tempoDeEsperaMaior);
});

Cypress.Commands.add(
  'checarMensagem',
  { prevSubject: 'element' },
  (subject: JQuery<HTMLElement>, mensagem: string, tipo?: TipoMensagemContainerDispositivo): Cypress.Chainable<JQuery<HTMLElement>> => {
    const seletor = `div.container__texto--mensagem div.mensagem${tipo ? `.mensagem--${tipo}` : ''}`;
    cy.wrap(subject).find(seletor).contains(mensagem);
    return cy.wrap(subject);
  }
);

Cypress.Commands.add('checarEstadoInicialAoCriarNovaEmendaEstruturada', (payload: ChecarEstadoInicialAoCriarNovaEmenda): void => {
  // Título da proposição
  cy.get('div.nome-proposicao').contains(payload.nomeProposicao).should('exist');

  cy.get('lexml-eta').should('exist');

  // lexml-eta deve existir e estar visível
  cy.get('lexml-eta-proposicao').should('exist').should('have.attr', 'style', 'display: block');

  // lexml-eta-editor-texto-rico deve existir e estar oculto
  cy.get('lexml-eta-editor-texto-rico[modo="textoLivre"]').should('exist').should('have.attr', 'style', 'display: none');

  payload.totalElementos && cy.get('div.container__elemento').should('have.length', payload.totalElementos);
});

Cypress.Commands.add('checarEstadoInicialAoCriarNovaEmendaOndeCouber', (payload: ChecarEstadoInicialAoCriarNovaEmenda): void => {
  cy.checarEstadoInicialAoCriarNovaEmendaEstruturada(payload);

  // Dispositivo "ementa" não deveria existir
  cy.get('div.ementa.container__elemento--ativo').should('not.exist');

  // Rótulo do artigo
  cy.get('div.container__elemento.elemento-tipo-artigo').get('label').contains('Art.');
});

Cypress.Commands.add('checarEstadoInicialAoCriarNovaEmendaPadrao', (payload: ChecarEstadoInicialAoCriarNovaEmenda): void => {
  cy.checarEstadoInicialAoCriarNovaEmendaEstruturada(payload);

  // Dispositivo "ementa" deve estar "ativo"
  cy.get('div.ementa.container__elemento--ativo').should('exist');
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      // configurarInterceptadores(): Chainable<void>;
      ignorarErro(text: string): void;
      irParaPagina(numeroPagina: number): void;
      abrirEmenda(payload: AbrirEmendaPayloadCypress): Cypress.Chainable<Emenda>;
      novaEmenda(payload: NovaEmendaPayloadCypress): Cypress.Chainable<any>;
      checarMensagem(mensagem: string, tipo?: TipoMensagemContainerDispositivo): Cypress.Chainable<JQuery<HTMLElement>>;
      checarEstadoInicialAoCriarNovaEmendaEstruturada(payload: ChecarEstadoInicialAoCriarNovaEmenda): void;
      checarEstadoInicialAoCriarNovaEmendaPadrao(payload: ChecarEstadoInicialAoCriarNovaEmenda): void;
      checarEstadoInicialAoCriarNovaEmendaOndeCouber(payload: ChecarEstadoInicialAoCriarNovaEmenda): void;
      checarComandoEmenda(emenda?: Emenda): void;
      checarTextoPresenteEmComandoEmenda(texto: string): void;
      checarDadosAposAbrirEmenda(payload: ChecarDadosAposAbrirEmendaPayloadCypress): Chainable<void>;
      getContainerArtigoByNumero(numero: number): Cypress.Chainable<JQuery<HTMLElement>>;
      getContainerArtigoNormaByNumero(numero: number): Cypress.Chainable<JQuery<HTMLElement>>;
      getContainerArtigoByRotulo(rotulo: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getContainerArtigoNormaByRotulo(rotulo: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getContainerParagrafoNormaByRotulo(rotulo: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getContainerIncisoNormaByRotulo(rotulo: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getContainerAlineaNormaByRotulo(rotulo: string): Cypress.Chainable<JQuery<HTMLElement>>;
      focusOnConteudo(): Cypress.Chainable<JQuery<HTMLElement>>;
      selecionarOpcaoDeMenuDoDispositivo(opcaoDeMenu: string): void;
      getOpcoesDeMenuDoDispositivo(): Cypress.Chainable<JQuery<HTMLElement>>;
      getTextoDoDispositivo(): Cypress.Chainable<string>;
      alterarTextoDoDispositivo(texto: string): Cypress.Chainable<JQuery<HTMLElement>>;
      digitarNoDispositivo(texto: string, replace?: boolean): Cypress.Chainable<JQuery<HTMLElement>>;
      inserirTextoNaJustificacao(texto: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getSwitchRevisaoDispositivo(): Cypress.Chainable<JQuery<HTMLElement>>;
      getCheckRevisao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getContadorRevisao(): Cypress.Chainable<JQuery<HTMLElement>>;
      ativarRevisaoDispositivo(ocultarDisclaimerRevisao?: boolean): void;
      desativarRevisaoDispositivo(): void;
    }
  }
}

export {};
