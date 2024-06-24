import { Emenda } from '../../../src/model/emenda/emenda';

describe('Abrir emenda', () => {
  it('Emenda padrão (mpv_1160_2023_emenda_006.json)', () => {
    cy.abrirEmenda({ fixtureEmendaJson: 'mpv_1160_2023_emenda_006.json' }).then((emenda: Emenda) => {
      cy.getContainerArtigoByRotulo('Art. 3º-1').checarMensagem('Como interpretar sufixos');
      cy.checarDadosAposAbrirEmenda({ emenda });
    });
  });
});
