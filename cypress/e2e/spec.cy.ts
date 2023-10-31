import { mpsEmTramitacao } from '../downloads/mps-em-tramitacao';

const urlMpsEmTramitacao = 'https://www3.congressonacional.leg.br/editor-emendas/api/proposicoesEmTramitacao-novo?carregarDatasDeMPs=true&sigla=MPV';
// const urlMps2020 = 'https://www3.congressonacional.leg.br/editor-emendas/api/proposicoes-novo?sigla=MPV&ano=2020&carregarDatasDeMPs=true';

describe('Testando ação de criar nova emenda', () => {
  beforeEach(() => {
    cy.intercept('GET', urlMpsEmTramitacao, mpsEmTramitacao).as('getProposicoesEmTramitacao');
    cy.visit('https://www3.congressonacional.leg.br/editor-emendas/');
    cy.contains('Selecionar Medida Provisória').click();
  });

  it('Clica no botão "Selecionar Medida Provisória" e exibe lista de MPs', () => {
    cy.get('edt-app edt-modal-nova-emenda').shadow().find('sl-dialog').should('exist');
  });

  describe('Testando filtros de MPs', () => {
    it('Procura proposições de 2020', { includeShadowDom: true }, () => {
      const dialog = cy.get('edt-app edt-modal-nova-emenda').shadow().get('sl-dialog');
      cy.wait('@getProposicoesEmTramitacao');
      const input = dialog.shadow().get('sl-input.ano-proposicao');
      expect(input).to.exist;
      // input.type('2020');
      // dialog.shadow().get('#pesquisarButton').click();
      // console.log(11111, input);
      // input.type('2020', { force: true });
      // dialog.shadow().get('#pesquisarButton').click();
    });
  });
});
