import { expect, fixture, html } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { removerAlerta } from '../../../src/model/alerta/acao/removerAlerta';
import { rootStore } from '../../../src/redux/store';

let component: LexmlEtaComponent;

describe('LexmlEtaComponent', () => {
  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
  });

  describe('Validação de justificação', () => {
    it('deve incluir pendência de justificação quando vazia', () => {
      const pendencias = (component as any).getPendenciasPreenchimento({ justificativa: '' });
      expect(pendencias).to.include('Não foi informado um texto de justificação.');
    });

    it('deve disparar alerta global de justificação quando o editor está vazio', () => {
      Object.defineProperty(component, '_lexmlJustificativa', { value: { isEditorVazio: () => true } });

      (component as any).buildAlertaJustificativa();

      const alertas = rootStore.getState().elementoReducer.ui?.alertas || [];
      expect(alertas.find(a => a.id === 'alerta-global-justificativa')).to.not.be.undefined;
    });

    it('não deve disparar alerta global de justificação no modo anexo de parecer', () => {
      (component as any).anexoParecer = true;
      Object.defineProperty(component, '_lexmlJustificativa', { value: { isEditorVazio: () => true } });

      (component as any).buildAlertaJustificativa();

      const alertas = rootStore.getState().elementoReducer.ui?.alertas || [];
      expect(alertas.find(a => a.id === 'alerta-global-justificativa')).to.be.undefined;
    });
  });
});
