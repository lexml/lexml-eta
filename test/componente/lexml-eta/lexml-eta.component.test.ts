import { expect, fixture, html } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { removerAlerta } from '../../../src/model/alerta/acao/removerAlerta';
import { Proposicao } from '../../../src/model/proposicao/proposicao';
import { rootStore } from '../../../src/redux/store';

let component: LexmlEtaComponent;

describe('LexmlEtaComponent - atributo substitutivo', () => {
  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
  });

  describe('Cenário: Criar nova proposição (resetaProposicao)', () => {
    it('deve ter substitutivo=false ao criar nova proposição sem informar substitutivo', () => {
      (component as any).resetaProposicao({ substitutivo: false });
      expect((component as any).substitutivo).to.be.false;
    });

    it('deve ter substitutivo=true ao criar nova proposição com substitutivo=true', () => {
      (component as any).resetaProposicao({ substitutivo: true });
      expect((component as any).substitutivo).to.be.true;
    });
  });

  describe('Cenário: Carregar proposição de arquivo (setProposicao)', () => {
    it('deve ter substitutivo=false ao carregar proposição com substitutivo=false', () => {
      const proposicao = new Proposicao();
      proposicao.substitutivo = false;
      (component as any).setProposicao(proposicao);
      expect((component as any).substitutivo).to.be.false;
    });

    it('deve ter substitutivo=true ao carregar proposição com substitutivo=true', () => {
      const proposicao = new Proposicao();
      proposicao.substitutivo = true;
      (component as any).setProposicao(proposicao);
      expect((component as any).substitutivo).to.be.true;
    });

    it('deve sobrescrever substitutivo anterior ao carregar nova proposição', () => {
      const proposicaoSubstitutiva = new Proposicao();
      proposicaoSubstitutiva.substitutivo = true;
      (component as any).setProposicao(proposicaoSubstitutiva);
      expect((component as any).substitutivo).to.be.true;

      const proposicaoNormal = new Proposicao();
      proposicaoNormal.substitutivo = false;
      (component as any).setProposicao(proposicaoNormal);
      expect((component as any).substitutivo).to.be.false;
    });
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
