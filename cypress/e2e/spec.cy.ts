import { mpsEmTramitacao } from '../fixtures/mps-em-tramitacao';
import { mps2020 } from '../fixtures/mps-2020';

const urlMpsEmTramitacao = 'https://www3.congressonacional.leg.br/editor-emendas/api/proposicoesEmTramitacao-novo?carregarDatasDeMPs=true&sigla=MPV';
const urlMps2020 = 'https://www3.congressonacional.leg.br/editor-emendas/api/proposicoes-novo?sigla=MPV&ano=2020&carregarDatasDeMPs=true';
let dialog;

describe('Testando edt-modal-nova-emenda', () => {
  beforeEach(() => {
    cy.intercept('GET', urlMpsEmTramitacao, mpsEmTramitacao).as('getProposicoesEmTramitacao');
    cy.intercept('GET', urlMps2020, mps2020).as('getProposicoes2020');
    cy.visit('https://www3.congressonacional.leg.br/editor-emendas/');
  });

  describe('Clica no botão "Selecionar Medida Provisória" e exibe lista de MPs', () => {
    beforeEach(() => {
      cy.contains('Selecionar Medida Provisória').click();
      cy.wait('@getProposicoesEmTramitacao');
      dialog = cy.get('edt-app edt-modal-nova-emenda').shadow().get('sl-dialog');
    });

    it('Deveria exibir lista de MPs em tramitação', { includeShadowDom: true }, () => {
      cy.get('edt-app edt-modal-nova-emenda').shadow().find('sl-dialog').should('exist');
    });

    it('Lista de MPs deveria conter MPV 1178/2023', { includeShadowDom: true }, () => {
      dialog.shadow().get('table tbody').contains('td', 'MPV 1178/2023').should('exist');
    });

    describe('Testando filtros de MPs procurando proposições de 2020', () => {
      beforeEach(() => {
        dialog.shadow().get('sl-input.ano-proposicao').invoke('val', '2020').trigger('input');
        dialog.shadow().get('#pesquisarButton').click();
        cy.wait('@getProposicoes2020').its('response.statusCode').should('eq', 200);
      });

      it('Deveria encontrar MPV 930/2020 na tabela', { includeShadowDom: true }, () => {
        dialog.shadow().get('table tbody').contains('td', 'MPV 930/2020').should('exist');
      });

      describe('Testando ação de selecionar MPV 930/2020', () => {
        beforeEach(() => {
          dialog.shadow().get('table tbody').contains('td', 'MPV 930/2020').click();
        });

        it('Elemento TR deveria possuir atributo selected igual a true', { includeShadowDom: true }, () => {
          dialog.shadow().get('table tbody').contains('td', 'MPV 930/2020').parent().should('have.attr', 'selected', 'true');
        });

        it('Elemento div.ementa deveria possuir label com texto "Ementa MPV 930/2020"', { includeShadowDom: true }, () => {
          dialog.shadow().get('div.ementa label').contains('Ementa MPV 930/2020').should('exist');
        });

        it('Elemento div.ementa deveria possuir textarea com conteúdo da ementa', { includeShadowDom: true }, () => {
          dialog.shadow().get('div.ementa textarea').should('not.be.empty');
          dialog
            .shadow()
            .get('div.ementa textarea')
            .should(
              'have.value',
              'Dispõe sobre o tratamento tributário incidente sobre a variação cambial do valor de investimentos realizados por instituições financeiras e demais instituições autorizadas a funcionar pelo Banco Central do Brasil em sociedade controlada domiciliada no exterior e sobre a proteção legal oferecida aos integrantes do Banco Central do Brasil no exercício de suas atribuições e altera a Lei nº 12.865, de 9 de outubro de 2013, que dispõe, dentre outras matérias, sobre os arranjos de pagamento e sobre as instituições de pagamento integrantes do Sistema de Pagamentos Brasileiro.'
            );
        });
      });
    });
  });
});
