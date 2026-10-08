import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig, LexmlEtaParametrosEdicao } from '../../../src';
import { removerAlerta } from '../../../src/model/alerta/acao/removerAlerta';
import { Proposicao } from '../../../src/model/proposicao/proposicao';
import { TipoMensagem } from '../../../src/model/lexml/util/mensagem';
import { rootStore } from '../../../src/redux/store';

let component: LexmlEtaComponent;

describe('LexmlEtaParametrosEdicao - atributo substitutivo', () => {
  it('deve ter valor padrão false', () => {
    const params = new LexmlEtaParametrosEdicao();
    expect(params.substitutivo).to.be.false;
  });
});

describe('LexmlEtaConfig - atributo justificacaoObrigatoria', () => {
  it('deve ter valor padrão true', () => {
    const config = new LexmlEtaConfig();
    expect(config.justificacaoObrigatoria).to.be.true;
  });
});

describe('LexmlEtaComponent - atributo substitutivo', () => {
  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
  });

  describe('Validação dos parâmetros de inicialização', () => {
    it('deve lançar erro quando sigla não informada', () => {
      const params = new LexmlEtaParametrosEdicao();
      expect(() => (component as any).validarParametrosIdentificacaoProposicao(params)).to.throw('"sigla" é obrigatório');
    });

    it('deve lançar erro quando substitutivo=true e numero não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.ano = '2025';
      params.substitutivo = true;
      expect(() => (component as any).validarParametrosIdentificacaoProposicao(params)).to.throw('"numero" é obrigatório para texto substitutivo');
    });

    it('deve lançar erro quando substitutivo=true e ano não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.numero = '1';
      params.substitutivo = true;
      expect(() => (component as any).validarParametrosIdentificacaoProposicao(params)).to.throw('"ano" é obrigatório para texto substitutivo');
    });

    it('deve preencher numero com "999999" quando substitutivo=false e numero não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      (component as any).validarParametrosIdentificacaoProposicao(params);
      expect(params.numero).to.equal('999999');
    });

    it('deve preencher ano com "9999" quando substitutivo=false e ano não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      (component as any).validarParametrosIdentificacaoProposicao(params);
      expect(params.ano).to.equal('9999');
    });

    it('não deve alterar numero e ano quando ambos já informados e substitutivo=false', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.numero = '42';
      params.ano = '2020';
      (component as any).validarParametrosIdentificacaoProposicao(params);
      expect(params.numero).to.equal('42');
      expect(params.ano).to.equal('2020');
    });
  });

  describe('Cenário: Criar nova proposição (resetaProposicao)', () => {
    it('deve ter substitutivo=false ao criar nova proposição sem informar substitutivo', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      (component as any).resetaProposicao(params);
      expect((component as any).substitutivo).to.be.false;
    });

    it('deve ter substitutivo=true ao criar nova proposição com substitutivo=true', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.numero = '1';
      params.ano = '2025';
      params.substitutivo = true;
      (component as any).resetaProposicao(params);
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

  describe('Validação de justificação via LexmlEtaConfig.justificacaoObrigatoria', () => {
    it('deve incluir pendência de justificação quando obrigatória e vazia', () => {
      component.lexmlEtaConfig = new LexmlEtaConfig();
      component.lexmlEtaConfig.justificacaoObrigatoria = true;

      const pendencias = (component as any).getPendenciasPreenchimento({ justificativa: '' });
      expect(pendencias).to.include('Não foi informado um texto de justificação.');
    });

    it('não deve incluir pendência de justificação quando não obrigatória e vazia', () => {
      component.lexmlEtaConfig = new LexmlEtaConfig();
      component.lexmlEtaConfig.justificacaoObrigatoria = false;

      const pendencias = (component as any).getPendenciasPreenchimento({ justificativa: '' });
      expect(pendencias).to.not.include('Não foi informado um texto de justificação.');
    });

    it('não deve disparar alerta global de justificação quando não obrigatória', () => {
      component.lexmlEtaConfig = new LexmlEtaConfig();
      component.lexmlEtaConfig.justificacaoObrigatoria = false;
      Object.defineProperty(component, '_lexmlJustificativa', { value: { texto: '' } });

      (component as any).buildAlertaJustificativa();

      const alertas = rootStore.getState().elementoReducer.ui?.alertas || [];
      const alerta = alertas.find(a => a.id === 'alerta-global-justificativa');
      expect(alerta).to.be.undefined;
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

  const paramsComJustificativa = (justificativa?: string): LexmlEtaParametrosEdicao => {
    const params = new LexmlEtaParametrosEdicao();
    params.sigla = 'PL';
    if (justificativa !== undefined) {
      params.proposicao = new Proposicao();
      params.proposicao.sigla = 'PL';
      params.proposicao.justificativa = justificativa;
    }
    return params;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).getParlamentares = async (): Promise<[]> => [];
    rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
  });

  it('exibe o alerta ao iniciar uma proposição nova', async () => {
    await component.inicializarEdicao(paramsComJustificativa());
    expect(getAlertasJustificativa()).to.have.length(1);
  });

  it('exibe o alerta ao iniciar com uma proposição sem justificação', async () => {
    await component.inicializarEdicao(paramsComJustificativa(''));
    expect(getAlertasJustificativa()).to.have.length(1);
  });

  it('não exibe o alerta ao iniciar com uma proposição com justificação', async () => {
    await component.inicializarEdicao(paramsComJustificativa('<p>Justificação.</p>'));
    expect(getAlertasJustificativa()).to.be.empty;
  });

  it('não exibe o alerta ao iniciar no modo anexo de parecer', async () => {
    const config = new LexmlEtaConfig();
    config.anexoParecer = true;
    component.lexmlEtaConfig = config;
    await component.inicializarEdicao(paramsComJustificativa(''));
    expect(getAlertasJustificativa()).to.be.empty;
  });
});
