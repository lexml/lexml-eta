import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaConfig } from '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { removerAlerta } from '../../../src/model/alerta/acao/removerAlerta';
import { TipoMensagem } from '../../../src/model/lexml/util/mensagem';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';
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
      Object.defineProperty(component, '_lexmlJustificativa', { value: { texto: '' } });

      (component as any).buildAlertaJustificativa();

      const alertas = rootStore.getState().elementoReducer.ui?.alertas || [];
      expect(alertas.find(a => a.id === 'alerta-global-justificativa')).to.not.be.undefined;
    });

    it('não deve disparar alerta global de justificação no modo anexo de parecer', () => {
      (component as any).anexoParecer = true;
      Object.defineProperty(component, '_lexmlJustificativa', { value: { texto: '' } });

      (component as any).buildAlertaJustificativa();

      const alertas = rootStore.getState().elementoReducer.ui?.alertas || [];
      expect(alertas.find(a => a.id === 'alerta-global-justificativa')).to.be.undefined;
    });
  });
});

describe('LexmlEtaComponent - alerta de justificação não informada', () => {
  const MENSAGEM = 'Não foi informado um texto de justificação.';

  const definirJustificativa = (texto: string): void => {
    Object.defineProperty(component, '_lexmlJustificativa', { value: { texto } });
  };

  const getAlertasJustificativa = (): any[] => (rootStore.getState().elementoReducer.ui?.alertas || []).filter(a => a.id === 'alerta-global-justificativa');

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
    component.lexmlEtaConfig = new LexmlEtaConfig();
  });

  it('exibe alerta crítico não fechável com o texto da pendência quando a justificação está vazia', () => {
    definirJustificativa('');
    (component as any).buildAlertaJustificativa();

    const alertas = getAlertasJustificativa();
    expect(alertas).to.have.length(1);
    expect(alertas[0].mensagem).to.equal(MENSAGEM);
    expect(alertas[0].tipo).to.equal(TipoMensagem.CRITICAL);
    expect(alertas[0].podeFechar).to.be.false;
  });

  ['<p><br></p>', '<p>&nbsp;</p>', '<p>   </p><p><br></p>'].forEach(texto => {
    it(`exibe alerta quando a justificação só tem marcação ou espaços (${texto})`, () => {
      definirJustificativa(texto);
      (component as any).buildAlertaJustificativa();
      expect(getAlertasJustificativa()).to.have.length(1);
    });
  });

  it('não exibe alerta quando a justificação tem texto', () => {
    definirJustificativa('<p>Justificação.</p>');
    (component as any).buildAlertaJustificativa();
    expect(getAlertasJustificativa()).to.be.empty;
  });

  it('remove o alerta quando a justificação passa a ter texto', () => {
    definirJustificativa('');
    (component as any).buildAlertaJustificativa();
    (component as any)._lexmlJustificativa.texto = '<p>Justificação.</p>';
    (component as any).buildAlertaJustificativa();
    expect(getAlertasJustificativa()).to.be.empty;
  });

  it('não duplica o alerta ao reavaliar várias vezes', () => {
    definirJustificativa('');
    (component as any).buildAlertaJustificativa();
    (component as any).buildAlertaJustificativa();
    expect(getAlertasJustificativa()).to.have.length(1);
  });

  it('não exibe alerta no modo anexo de parecer', () => {
    definirJustificativa('');
    (component as any).anexoParecer = true;
    (component as any).buildAlertaJustificativa();
    expect(getAlertasJustificativa()).to.be.empty;
  });

  ['', '<p><br></p>', '<p>Justificação.</p>'].forEach(texto => {
    it(`alerta e pendência coincidem para a justificação "${texto}"`, () => {
      definirJustificativa(texto);
      (component as any).buildAlertaJustificativa();
      const pendencias = (component as any).getPendenciasPreenchimento({ justificativa: texto });
      expect(getAlertasJustificativa().length > 0).to.equal(pendencias.includes(MENSAGEM));
    });
  });
});

describe('LexmlEtaComponent - alerta de justificação ao iniciar a edição', () => {
  const getAlertasJustificativa = (): any[] => (rootStore.getState().elementoReducer.ui?.alertas || []).filter(a => a.id === 'alerta-global-justificativa');

  const URN = 'urn:lex:br:senado.federal:projeto.lei;pl:9999;999999';

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).getParlamentares = async (): Promise<[]> => [];
    rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
  });

  it('exibe o alerta ao iniciar uma proposição nova', async () => {
    await component.novaProposicao({ urn: URN, epigrafe: 'PROJETO DE LEI', preambulo: '' });
    expect(getAlertasJustificativa()).to.have.length(1);
  });

  it('exibe o alerta ao abrir um documento sem justificação', async () => {
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    expect(getAlertasJustificativa()).to.have.length(1);
  });

  it('não exibe o alerta ao abrir um documento com justificação', async () => {
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    (component as any)._lexmlJustificativa.setContent('<p>Justificação.</p>');
    (component as any)._lexmlJustificativa.updateApenasTexto();
    const salvo = component.getDocumentoArticulado();

    await component.abrirDocumentoArticulado(salvo);
    expect(getAlertasJustificativa()).to.be.empty;
  });

  it('não exibe o alerta ao iniciar no modo anexo de parecer', async () => {
    await component.novaProposicao({ urn: URN, epigrafe: 'PROJETO DE LEI', preambulo: '', anexoParecer: true });
    expect(getAlertasJustificativa()).to.be.empty;
  });
});
