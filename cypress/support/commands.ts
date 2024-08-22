/// <reference types="cypress" />
import { LexmlEmendaComponent } from '../../src';
import { Emenda, ModoEdicaoEmenda } from '../../src/model/emenda/emenda';
import { removeAllHtmlTags } from '../../src/util/string-util';

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

const regexEspaco = /\s+|&nbsp;/g;

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

Cypress.Commands.add('getContainerArtigoByRotulo', (rotulo: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  const regex = new RegExp(`${rotulo}`);
  return cy.get('div.container__elemento.elemento-tipo-artigo div.container__texto--nivel0 label').contains(regex).first().closest('div.container__elemento.elemento-tipo-artigo');
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
  wrapSubject.closest('lexml-eta-editor').then($eta => {
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
  cy.get('#editor-texto-rico-justificativa-inner > .ql-editor')
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
  return cy.get('lexml-eta lexml-switch-revisao.revisao-container').as('switchRevisaoDispositivo');
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
  cy.wait(tempoDeEsperaMaior).then(() => {
    cy.get('lexml-emenda').then($lexmlEmenda => {
      const emendaAux = emenda ?? ($lexmlEmenda[0] as LexmlEmendaComponent).getEmenda();
      fnChecarComandoCabecalho(emendaAux);
      fnChecarComandoCitacao(emendaAux);
    });
  });
});

Cypress.Commands.add('checarTextoPresenteEmComandoEmenda', (texto: string): void => {
  cy.get('lexml-emenda lexml-emenda-comando').shadow().find('div.lexml-emenda-comando').find('div.lexml-emenda-citacaoComando').contains(texto);
});

Cypress.Commands.add('checarDadosAposAbrirEmenda', (payload: ChecarDadosAposAbrirEmendaPayloadCypress) => {
  const emenda = payload.emenda;
  fnChecarTituloMpv(emenda);
  emenda.modoEdicao === ModoEdicaoEmenda.EMENDA && fnChecarEmentaMpv(emenda);
  fnChecarDadosEmendaAbaTexto(emenda);
  fnChecarDadosEmendaAbaJustificativa(emenda);
  fnChecarDadosEmendaAbaAutoria(emenda);
  emenda.modoEdicao !== ModoEdicaoEmenda.EMENDA_TEXTO_LIVRE && fnChecarDadosEmendaLateralComando(emenda);
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
  // TODO: Verificar outros modos de edição

  // Verificar modoEdicao. Testar de acordo com o modo.
  emenda.modoEdicao === ModoEdicaoEmenda.EMENDA && fnChecarDadosEmendaAbaTextoEmendaPadrao();
  emenda.modoEdicao === ModoEdicaoEmenda.EMENDA_ARTIGO_ONDE_COUBER && fnChecarDadosEmendaAbaTextoEmendaArtigoOndeCouber(emenda);
  emenda.modoEdicao === ModoEdicaoEmenda.EMENDA_TEXTO_LIVRE && fnChecarDadosEmendaAbaTextoEmendaTextoLivre();
};

const fnChecarDadosEmendaAbaTextoEmendaPadrao = (): void => {
  cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length.greaterThan', 0);
};

const fnChecarDadosEmendaAbaTextoEmendaArtigoOndeCouber = (emenda: Emenda): void => {
  cy.get('div.container__elemento.elemento-tipo-artigo  div.container__texto--nivel0').should('have.length', emenda.componentes[0].dispositivos.dispositivosAdicionados.length);

  emenda.componentes[0].dispositivos.dispositivosAdicionados.forEach((da, index) => {
    const textoDoCaputDoArtigo = removeAllHtmlTags(da.filhos?.find(f => f.tipo === 'Caput')?.texto ?? '').replace(regexEspaco, '');
    cy.get('div.container__elemento.elemento-tipo-artigo')
      .eq(index)
      .find('div.container__texto p.texto__dispositivo')
      .then($p => {
        expect($p.text().replace(regexEspaco, '')).equal(textoDoCaputDoArtigo);
      });
  });
};

const fnChecarDadosEmendaAbaTextoEmendaTextoLivre = (): void => {
  cy.get('editor-texto-rico[modo="textoLivre"]').should('exist').should('have.attr', 'style', 'display: block');
};

const fnChecarDadosEmendaAbaJustificativa = (emenda: Emenda): void => {
  const justificativa = removeAllHtmlTags(emenda.justificativa ?? '').replace(regexEspaco, '');
  cy.get('#sl-tab-2').click();
  cy.get('#editor-texto-rico-justificativa-inner > .ql-editor').then($el => {
    expect($el.text().replace(regexEspaco, '')).equal(justificativa);
  });
};

const fnGetArrayNomeComissao = (emenda: Emenda): string[] => {
  if (emenda.proposicao.sigla === 'MPV') {
    if (emenda.colegiadoApreciador.siglaComissao === 'CMO') {
      return [`CMO - Comissão Mista de Planos, Orçamentos Públicos e Fiscalização`];
    } else {
      const nomeEstendido = `${emenda.colegiadoApreciador.siglaComissao} - Comissão Mista da Medida Provisória n° ${emenda.proposicao.numero}, de ${emenda.proposicao.ano}`;
      return [`${emenda.colegiadoApreciador.siglaComissao}`, nomeEstendido, nomeEstendido.toUpperCase()];
    }
  }

  return [`${emenda.colegiadoApreciador.siglaComissao}`];
};

const fnChecarDadosEmendaAbaAutoria = (emenda: Emenda): void => {
  // Verificar o clique na aba Destino, Data, Autoria e Impressão
  cy.get('#sl-tab-3').click();

  // Verificar a seleção do tipo Órgão destino
  cy.get('lexml-destino').shadow().find('sl-radio-group#tipoColegiado').find('sl-radio').contains(emenda.colegiadoApreciador.tipoColegiado).should('have.attr', 'checked');

  // Verificar o preenchimento do nome do Órgão destino
  cy.get('lexml-destino')
    .shadow()
    .find('autocomplete-async')
    .should($el => {
      expect(fnGetArrayNomeComissao(emenda)).to.include($el[0].value);
    });

  // Verificar a seleção do radio Data e o preenchimento do valor
  if (emenda.data) {
    cy.get('lexml-data').shadow().find('sl-radio[value="1"]').should('not.have.attr', 'checked');
    cy.get('lexml-data').shadow().find('sl-radio[value="2"]').should('have.attr', 'checked');
    cy.get('lexml-data').shadow().find('sl-radio[value="2"] sl-input#input-data').should('have.value', emenda.data);
  } else {
    cy.get('lexml-data').shadow().find('sl-radio[value="1"]').should('have.attr', 'checked');
    cy.get('lexml-data').shadow().find('sl-radio[value="2"]').should('not.have.attr', 'checked');
  }

  // Verificar o preenchimento dos campos da seção Autoria
  // Verificar o preenchimento do campo Parlamentar e Cargo
  const sParlamentares = emenda.autoria.parlamentares.map(p => `${p.nome} - ${p.cargo ?? ''}`).join('; ');
  cy.get('lexml-autoria')
    .shadow()
    .find('div.autoria-grid:not(.autoria-labels)')
    .then($divs => {
      const sParlamentaresAux = $divs.map((index, div) => {
        const nome = div.querySelector('lexml-autocomplete')?.value;
        const cargo = (div.querySelector('sl-input#tex-cargo') as any)?.value;
        return nome ? `${nome} - ${cargo}` : '';
      });

      expect(sParlamentaresAux.get().join('; ')).equal(sParlamentares);
    });

  // Verificar o preenchimento do campo Quantidade de assinaturas adicionais de Senadores
  cy.get('lexml-autoria').shadow().find('#num-assinaturas-adicionais-senadores').should('have.value', emenda.autoria.quantidadeAssinaturasAdicionaisSenadores);

  // Verificar o preenchimento do campo Quantidade de assinaturas adicionais de Deputados Federais
  cy.get('lexml-autoria').shadow().find('#num-assinaturas-adicionais-deputados').should('have.value', emenda.autoria.quantidadeAssinaturasAdicionaisDeputados);

  // Verificar o checkbox de imprimir partido e UF para os signatários
  cy.get('lexml-autoria')
    .shadow()
    .find('input#chk-exibir-partido-uf')
    .should((emenda.autoria.imprimirPartidoUF ? '' : 'not.') + 'have.attr', 'checked');

  // Verificar o preenchimento dos campos da seção Opções de impressão
  // Verificar a seleção de imprimir brasão
  cy.get('lexml-opcoes-impressao')
    .shadow()
    .find('input#chk-imprimir-brasao')
    .should((emenda.opcoesImpressao.imprimirBrasao ? '' : 'not.') + 'have.attr', 'checked');

  // Verificar a seleção do campo tamanho da letra
  cy.get('lexml-opcoes-impressao')
    .shadow()
    .find('sl-select#select-tamanho-fonte')
    .should('have.value', emenda.opcoesImpressao.tamanhoFonte ?? '');

  // Verificar a seleção de reduzir espaçamento entre linhas
  cy.get('lexml-opcoes-impressao')
    .shadow()
    .find('input#chk-reduzir-espaco')
    .should((emenda.opcoesImpressao.reduzirEspacoEntreLinhas ? '' : 'not.') + 'have.attr', 'checked');
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
        .replaceAll(regexEspaco, ' ')
        .trim();
      const innerHTML = div[0].innerHTML
        .replace(/<\/?[^>]*>?/g, '')
        .replace(regexEspaco, ' ')
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
