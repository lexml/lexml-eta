/// <reference types="cypress" />
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

//import './../../demo/components/demoview';

const path_mpv_905_2019 = './../../demo/doc/mpv_905_2019.json';
const path_emenda_3 = './cypress/fixtures/emenda_3_mpv_905_2019.json';

Cypress.Commands.add('configurarInterceptadores', () => {
   cy.readFile(path_mpv_905_2019).as('getMpv_905_2019');
});

 Cypress.Commands.add('abrirEmenda', (payload: any) => {   
    // Mock showOpenFilePicker
    cy.get('[value="Abrir"]').click();
    cy.get('#fileUpload').selectFile(path_emenda_3, {force: true}).as('payload');
  });


  Cypress.Commands.add('checarDadosAposAbrirEmenda', (payload: any) => {
    cy.fixture(payload).then(emenda => {
      fnChecarTituloMpv(emenda);
      fnChecarEmentaMpv(emenda);
      fnChecarDadosEmendaAbaTexto(emenda);
      fnChecarDadosEmendaAbaJustificativa(emenda);
      fnChecarDadosEmendaAbaAutoria(emenda);
      fnChecarDadosEmendaLateralComando(emenda);
      fnChecarDadosNotasRodape(emenda);
    });
  });
 
  const fnChecarTituloMpv = (emenda: any): void => {
    const pr = emenda.proposicao;
    cy.get('.nome-proposicao').contains(`${pr.sigla} ${pr.numero}/${pr.ano}`);
  };
  
  const fnChecarEmentaMpv = (emenda: any): void => {
    cy.get('#texto__dispositivo2').contains(emenda.proposicao.ementa);
  };
  
  const fnChecarDadosEmendaAbaTexto = (emenda: any): void => {
    // Verificar modoEdicao. Testar de acordo com o modo.
    emenda.modoEdicao === 'emenda' && fnChecarDadosEmendaAbaTextoPadrao(emenda);
  };
  
  const fnChecarDadosEmendaAbaTextoPadrao = (emenda: any): void => {
    // Verificar o texto do Art 1º alterado
    const textoDispositivoAlterado = 'e para mulheres em situação de violência doméstica e familiar'; 
    cy.get('texto__dispositivo6').contains(textoDispositivoAlterado);
 };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fnChecarDadosEmendaAbaJustificativa = (emenda: any): void => {
    cy.get('#sl-tab-2').click();
    cy.get('#editor-texto-rico-justificativa-inner > .ql-editor > :nth-child(1)')
      .contains('A presente emenda visa incluir no programa governamental as mulheres');
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fnChecarDadosEmendaAbaAutoria = (emenda: any): void => {
    // Verificar o clique na aba Destino, Data, Autoria e Impressão
    cy.get('#sl-tab-3').click();
  
    // Verificar a seleção do tipo Órgão destino
    cy.get('lexml-destino')
      .shadow()
      .find('fieldset.lexml-destino')
      .find('div')
      .find('sl-radio-group#tipoColegiado')
      .find('sl-radio')
      .contains('Comissão');
  
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
    cy.get('lexml-data').shadow().find('div.lexml-data').find('sl-radio-group')
      .find('sl-radio').shadow().find('label.radio.radio--checked');
  
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
      .find('sl-radio-group.lexml-autoria')
      .find('div.autoria-list')
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
      .find('sl-radio-group.lexml-autoria')
      .find('div.autoria-list')
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
      .find('sl-radio-group.lexml-autoria')
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
      .find('sl-radio-group.lexml-autoria')
      .find('div.assinaturas-adicionais')
      .find('sl-input#num-assinaturas-adicionais-deputados.autoria-input')
      .shadow()
      .find('div.form-control.form-control--small.form-control--has-label')
      .find('div.form-control-input')
      .find('div.input.input--small.input--standard.input')
      .find('input#input.input__control');
  
    // Verificar o checkbox de imprimir partido e UF para os signatários
    cy.get('lexml-autoria')
      .shadow()
      .find('sl-radio-group.lexml-autoria')
      .find('div.assinaturas-adicionais')
      .find('label')
      .find('input#chk-exibir-partido-uf');
  
    // Verificar o preenchimento dos campos da seção Opções de impressão
    // Verificar o preenchimento do checkbox Opções de impressão
    cy.get('lexml-opcoes-impressao')
      .shadow()
      .find('sl-radio-group.lexml-opcoes-impressao')
      .find('div')
      .find('sl-checkbox#chk-imprimir-brasao')
      .shadow()
      .find('label.checkbox.checkbox--checked')
      .find('span.checkbox__control');
  
    // Verificar a seleção do campo tamanho da letra
    cy.get('lexml-opcoes-impressao')
      .shadow()
      .find('sl-radio-group.lexml-opcoes-impressao')
      .find('div')
      .find('sl-select#select-tamanho-fonte')
      .shadow()
      .find('div.form-control.form-control--small.form-control--has-label')
      .find('div.form-control-input')
      .find('sl-dropdown.select.select--standard.select--small');

    // Verificar a seleção de imprimir brasão
    cy.get('lexml-opcoes-impressao')
      .shadow()
      .find('sl-radio-group.lexml-opcoes-impressao')
      .find('div')
      .find('sl-checkbox#chk-imprimir-brasao')
      .shadow()
      .find('label.checkbox.checkbox--checked')
      .find('span.checkbox__control');


    // Verificar a seleção de reduzir espaçamento entre linhas
    cy.get('lexml-opcoes-impressao')
      .shadow()
      .find('sl-radio-group.lexml-opcoes-impressao')
      .find('div')
      .find('sl-checkbox#chk-reduzir-espaco')
      .shadow()
      .find('label.checkbox.checkbox--checked')
      .find('span.checkbox__control');
  };
  
  const fnChecarDadosEmendaLateralComando = (emenda: any): void => {
    fnChecarComandoCabecalho(emenda);
    fnChecarComandoCitacao(emenda);
  };
  
  const fnChecarComandoCabecalho = (emenda: any): void => {
    const cabecalho = emenda.comandoEmenda.comandos[0].cabecalho;
    cy.get('lexml-emenda-comando').shadow()
      .find('div.lexml-emenda-comando')
      .find('div.lexml-emenda-cabecalhoComando').contains(cabecalho);
  };
  
  const fnChecarComandoCitacao = (emenda: any): void => {
    const citacao = emenda.comandoEmenda.comandos[0].citacao;
    cy.get('edt-app lexml-emenda-comando')
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

    
  const fnChecarDadosNotasRodape = (emenda: any): void => {
    const textoNotaRodape = emenda.componentes[0].notas.rodapé;
    cy.get('#sl-tab-14 > #badgeAtalhos').click();
    cy.get('.notas-texto > p').contains(textoNotaRodape);
  };
      

 declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
      interface Chainable {
        configurarInterceptadores(): Chainable<void>;
        abrirEmenda(payload: any): Chainable<void>;
        checarDadosAposAbrirEmenda(payload: any): Chainable<void>;
      }
    }
  }