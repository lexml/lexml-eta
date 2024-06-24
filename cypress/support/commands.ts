/// <reference types="cypress" />

import { LexmlEmendaComponent } from '../../src';
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

Cypress.Commands.add('ignorarErro', (text: string) => {
  Cypress.on('uncaught:exception', err => {
    if (err.message.includes(text)) {
      console.log('ERRO IGNORADO:', text);
      return false;
    }
  });
});

Cypress.Commands.add('irParaPagina', (numeroPagina: number): void => {
  cy.get('#selectPaginaArticulacao').select(numeroPagina.toString());
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
  // cy.wait(500);
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

Cypress.Commands.add('getContainerArtigoByRotulo', (rotulo: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const regex = new RegExp(`${rotulo}`);
  return cy.get('div.container__elemento.elemento-tipo-artigo div.container__texto--nivel0 label').contains(regex).first().closest('div.container__elemento.elemento-tipo-artigo');
});

Cypress.Commands.add('selecionarOpcaoDeMenuDoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, opcaoDeMenu: string): void => {
  cy.wrap(subject).click().find('div.container__menu > sl-dropdown').click().find('sl-menu > sl-menu-item').contains(opcaoDeMenu).click();
});

Cypress.Commands.add('getOpcoesDeMenuDoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.wrap(subject).click().find('div.container__menu > sl-dropdown sl-menu > sl-menu-item');
});

Cypress.Commands.add('focusOnConteudo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.wrap(subject).find('div.container__texto p.texto__dispositivo').click({ force: true }).focus();
  return cy.wrap(subject);
});

Cypress.Commands.add('inserirTextoNoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, texto: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  // Obs:
  // O comando "type" deveria adicionar o texto ao parágrafo.
  // Tem hora que funciona, tem hora que não.
  // Por isso, foi necessário usar o comando "invoke" para setar o texto.
  // cy.wrap(subject).type(texto, { force: true, delay: 0 });

  const wrapSubject = cy.wrap(subject);
  wrapSubject.find('div.container__texto p.texto__dispositivo').invoke('text', texto);
  wrapSubject.closest('lexml-eta-editor').then($eta => {
    const eta = $eta[0];
    (eta as any).emitirEventoOnChange('cypress');
  });
  return wrapSubject;
});

Cypress.Commands.add('getSwitchRevisaoDispositivo', () => {
  return cy.get('lexml-eta lexml-switch-revisao.revisao-container').as('switchRevisaoDispositivo');
});

Cypress.Commands.add('getCheckRevisao', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  // Este comando deve ser encadeado com o comando "getSwitchRevisaoDispositivo" ou "getSwitchRevisaoTextoLivre"
  // return cy.getSwitchRevisaoDispositivo().find('#chk-em-revisao').as('chkRevisaoDispositivo');
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
  cy.get('@chkRevisaoDispositivo').click().should('have.attr', 'checked');
  cy.wait(500);
});

Cypress.Commands.add('desativarRevisaoDispositivo', (): void => {
  cy.getSwitchRevisaoDispositivo().getCheckRevisao().as('chkRevisaoDispositivo').should('have.attr', 'checked');
  cy.get('@chkRevisaoDispositivo').click().should('not.have.attr', 'checked');
  cy.wait(500);
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

  cy.get('lexml-emenda').should('exist');

  // lexml-eta deve existir e estar visível
  cy.get('lexml-eta').should('exist').should('have.attr', 'style', 'display: block');

  // editor-texto-rico deve existir e estar oculto
  cy.get('editor-texto-rico[modo="textoLivre"]').should('exist').should('have.attr', 'style', 'display: none');

  cy.get('lexml-emenda-comando').should('exist');

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

Cypress.Commands.add('checarComandoEmenda', (emenda?: Emenda): void => {
  cy.wait(500);
  cy.get('lexml-emenda').then($lexmlEmenda => {
    const emendaAux = emenda ?? ($lexmlEmenda[0] as LexmlEmendaComponent).getEmenda();
    fnChecarComandoCabecalho(emendaAux);
    fnChecarComandoCitacao(emendaAux);
  });
});

Cypress.Commands.add('checarTextoPresenteEmComandoEmenda', (texto: string): void => {
  cy.get('lexml-emenda lexml-emenda-comando').shadow().find('div.lexml-emenda-comando').find('div.lexml-emenda-citacaoComando').contains(texto);
});

Cypress.Commands.add('checarDadosAposAbrirEmenda', (payload: ChecarDadosAposAbrirEmendaPayloadCypress) => {
  const emenda = payload.emenda;
  fnChecarTituloMpv(emenda);
  fnChecarEmentaMpv(emenda);
  fnChecarDadosEmendaAbaTexto(emenda);
  fnChecarDadosEmendaAbaJustificativa(emenda);
  fnChecarDadosEmendaAbaAutoria(emenda);
  fnChecarDadosEmendaLateralComando(emenda);
  fnChecarDadosNotasRodape(emenda);
  cy.get('#sl-tab-1').click();
});

const fnChecarTituloMpv = (emenda: Emenda): void => {
  const pr = emenda.proposicao;
  cy.get('.nome-proposicao').contains(`${pr.sigla} ${pr.numero}/${pr.ano}`);
};

const fnChecarEmentaMpv = (emenda: Emenda): void => {
  // Verifica se o texto do elemento com classe 'ementa' contém a ementa da proposição
  cy.get('.ementa')
    .invoke('text')
    .then(texto => {
      expect(texto.replace(/ /g, '')).to.contain(emenda.proposicao.ementa.replace(/ /g, ''));
    });
};

const fnChecarDadosEmendaAbaTexto = (emenda: Emenda): void => {
  // Verificar modoEdicao. Testar de acordo com o modo.
  emenda.modoEdicao === 'emenda' && fnChecarDadosEmendaAbaTextoPadrao(emenda);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fnChecarDadosEmendaAbaTextoPadrao = (emenda: Emenda): void => {
  // TODO: Implementar
  // // Verificar o texto do Art 1º alterado
  // const textoDispositivoAlterado = 'e para mulheres em situação de violência doméstica e familiar';
  // cy.get('texto__dispositivo6').contains(textoDispositivoAlterado);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fnChecarDadosEmendaAbaJustificativa = (emenda: Emenda): void => {
  // TODO: Implementar

  cy.get('#sl-tab-2').click();
  cy.get('#editor-texto-rico-justificativa-inner > .ql-editor > :nth-child(1)'); //.contains(emenda.justificativa);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fnChecarDadosEmendaAbaAutoria = (emenda: Emenda): void => {
  // TODO: Implementar

  // Verificar o clique na aba Destino, Data, Autoria e Impressão
  cy.get('#sl-tab-3').click();

  // Verificar a seleção do tipo Órgão destino
  cy.get('lexml-destino').shadow().find('fieldset.lexml-destino').find('div').find('sl-radio-group#tipoColegiado').find('sl-radio').contains('Comissão');

  // Verificar o preenchimento do nome do Órgão destino
  cy.get('lexml-destino')
    .shadow()
    .find('fieldset.lexml-destino')
    .find('div')
    .find('autocomplete-async#auto-complete-async')
    .shadow()
    .find('slot#dropdown-input')
    .find('sl-input#defaultInput.lexml-autocomplete-input')
    .shadow()
    .find('div.form-control.form-control--medium.form-control--has-label')
    .find('div.form-control-input')
    .find('div.input.input--medium.input--standard.input--disabled')
    .find('input#input.input__control');

  // Verificar a seleção do radio Data e o preenchimento do valor
  cy.get('lexml-data').shadow().find('div.lexml-data').find('sl-radio-group').find('sl-radio').shadow().find('label.radio.radio--checked');

  cy.get('lexml-data')
    .shadow()
    .find('div.lexml-data')
    .find('sl-radio-group')
    .find('sl-radio')
    .find('sl-input#input-data')
    .shadow()
    .find('div.form-control.form-control--medium.form-control--has-label')
    .find('div.form-control-input')
    .find('div.input.input--medium.input--standard.input')
    .find('input#input.input__control');

  // Verificar o preenchimento dos campos da seção Autoria
  // Verificar o preenchimento do campo Parlamentar
  cy.get('lexml-autoria')
    .shadow()
    .find('fieldset > div.autoria-list')
    .find('div.autoria-grid')
    .find('div.autoria-grid--col1')
    .find('lexml-autocomplete.lexml-autocomplete')
    .shadow()
    .find('slot#dropdown-input')
    .find('sl-input#defaultInput.lexml-autocomplete-input')
    .shadow()
    .find('div.form-control.form-control--small')
    .find('div.form-control-input')
    .find('div.input.input--small.input--standard')
    .find('input#input.input__control');

  // Verificar o preenchimento do campo Cargo
  cy.get('lexml-autoria')
    .shadow()
    .find('fieldset > div.autoria-list')
    .find('div.autoria-grid')
    .find('div.autoria-grid--col2')
    .find('sl-input#tex-cargo.autoria-input')
    .shadow()
    .find('div.form-control.form-control--small')
    .find('div.form-control-input')
    .find('div.input.input--small.input--standard.input--empty')
    .find('input#input.input__control');

  // Verificar o preenchimento do campo Quantidade de assinaturas adicionais de Senadores
  cy.get('lexml-autoria')
    .shadow()
    .find('div.assinaturas-adicionais')
    .find('sl-input#num-assinaturas-adicionais-senadores.autoria-input')
    .shadow()
    .find('div.form-control.form-control--small.form-control--has-label')
    .find('div.form-control-input')
    .find('div.input.input--small.input--standard.input')
    .find('input#input.input__control');

  // Verificar o preenchimento do campo Quantidade de assinaturas adicionais de Deputados Federais
  cy.get('lexml-autoria')
    .shadow()
    .find('div.assinaturas-adicionais')
    .find('sl-input#num-assinaturas-adicionais-deputados.autoria-input')
    .shadow()
    .find('div.form-control.form-control--small.form-control--has-label')
    .find('div.form-control-input')
    .find('div.input.input--small.input--standard.input')
    .find('input#input.input__control');

  // Verificar o checkbox de imprimir partido e UF para os signatários
  cy.get('lexml-autoria').shadow().find('div.assinaturas-adicionais').find('label').find('input#chk-exibir-partido-uf');

  // Verificar o preenchimento dos campos da seção Opções de impressão
  // Verificar o preenchimento do checkbox Opções de impressão
  cy.get('lexml-opcoes-impressao').shadow().find('div').find('#chk-imprimir-brasao[checked]');

  // Verificar a seleção do campo tamanho da letra
  cy.get('lexml-opcoes-impressao')
    .shadow()
    .find('div')
    .find('sl-select#select-tamanho-fonte')
    .shadow()
    .find('div.form-control.form-control--small.form-control--has-label')
    .find('div.form-control-input')
    .find('sl-dropdown.select.select--standard.select--small');

  // Verificar a seleção de imprimir brasão
  cy.get('lexml-opcoes-impressao').shadow().find('div').find('#chk-imprimir-brasao');

  // Verificar a seleção de reduzir espaçamento entre linhas
  cy.get('lexml-opcoes-impressao').shadow().find('div').find('#chk-reduzir-espaco');
};

const fnChecarDadosEmendaLateralComando = (emenda: any): void => {
  fnChecarComandoCabecalho(emenda);
  fnChecarComandoCitacao(emenda);
};

const fnChecarComandoCabecalho = (emenda: any): void => {
  const cabecalho = emenda.comandoEmenda.comandos[0].cabecalho;
  cy.get('lexml-emenda-comando').shadow().find('div.lexml-emenda-comando').find('div.lexml-emenda-cabecalhoComando').contains(cabecalho);
};

const fnChecarComandoCitacao = (emenda: any): void => {
  const citacao = emenda.comandoEmenda.comandos[0].citacao;
  cy.get('lexml-emenda lexml-emenda-comando')
    .shadow()
    .find('div.lexml-emenda-comando')
    .find('div.lexml-emenda-citacaoComando')
    .then(div => {
      const aux = citacao
        .replace(/<\/?[^>]*>?/g, '')
        .replaceAll(/\s+/g, ' ')
        .trim();
      const innerHTML = div[0].innerHTML
        .replace(/<\/?[^>]*>?/g, '')
        .replace(/\s+/g, ' ')
        .replace('...............................................', '')
        .trim();
      expect(innerHTML).equal(aux);
    });
};

const fnChecarDadosNotasRodape = (emenda: Emenda): void => {
  const textoNotaRodape = emenda.notasRodape[0]?.texto;
  if (textoNotaRodape) {
    cy.get('#sl-tab-14 > #badgeAtalhos').click();
    cy.get('.notas-texto > p').contains(textoNotaRodape);
  }
};

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
      getContainerArtigoByRotulo(rotulo: string): Cypress.Chainable<JQuery<HTMLElement>>;
      focusOnConteudo(): Cypress.Chainable<JQuery<HTMLElement>>;
      selecionarOpcaoDeMenuDoDispositivo(opcaoDeMenu: string): void;
      getOpcoesDeMenuDoDispositivo(): Cypress.Chainable<JQuery<HTMLElement>>;
      inserirTextoNoDispositivo(texto: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getSwitchRevisaoDispositivo(): Cypress.Chainable<JQuery<HTMLElement>>;
      getCheckRevisao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getContadorRevisao(): Cypress.Chainable<JQuery<HTMLElement>>;
      ativarRevisaoDispositivo(ocultarDisclaimerRevisao?: boolean): void;
      desativarRevisaoDispositivo(): void;
    }
  }
}

export {};
