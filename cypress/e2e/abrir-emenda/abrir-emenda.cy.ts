import { Emenda } from '../../../src/model/emenda/emenda';

describe('Abrir emenda', () => {
  it('Emenda padrão (mpv_1160_2023_emenda_006.json)', () => {
    cy.abrirEmenda({ fixtureEmendaJson: 'mpv_1160_2023_emenda_006.json' }).then((emenda: Emenda) => {
      cy.getContainerArtigoByRotulo('Art. 3º-1').checarMensagem('Como interpretar sufixos');
      cy.checarDadosAposAbrirEmenda({ emenda });
    });
  });

  it('Emenda "artigo onde couber" (mpv_1232_2024_emenda_024.json)', () => {
    cy.abrirEmenda({ fixtureEmendaJson: 'mpv_1232_2024_emenda_024.json' }).then((emenda: Emenda) => {
      cy.checarDadosAposAbrirEmenda({ emenda });
    });
  });

  it('Emenda texto livre (mpv_1232_2024_emenda_045.json)', () => {
    cy.abrirEmenda({ fixtureEmendaJson: 'mpv_1232_2024_emenda_045.json' }).then((emenda: Emenda) => {
      cy.checarDadosAposAbrirEmenda({ emenda });
    });
  });
});
