import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { adicionarPenaAction, alterarRotuloPenaAction } from '../../../../src/model/lexml/acao/penaAction';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { adicionarElementoAction } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { removerElementoAction } from '../../../../src/model/lexml/acao/removerElementoAction';
import { removerElementoSemTextoAction } from '../../../../src/model/lexml/acao/removerElementoSemTextoAction';
import { TransformarElemento } from '../../../../src/model/lexml/acao/transformarElementoAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';

let state: State;

const novo = (pai: Dispositivo, tipo: string, texto: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  return d;
};

const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Matar alguém:';
  novo(art1, TipoDispositivo.inciso.tipo, 'por motivo fútil;');
  const inc2 = novo(art1, TipoDispositivo.inciso.tipo, 'contra criança:');
  const ali = novo(inc2, TipoDispositivo.alinea.tipo, 'com arma;');
  novo(ali, TipoDispositivo.item.tipo, 'de fogo;');
  const par1 = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é culposo:');
  novo(par1, TipoDispositivo.inciso.tipo, 'no trânsito:');
  novo(art1, TipoDispositivo.paragrafo.tipo, 'Outro texto.');
  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art2.caput as any).texto = 'Esta Lei entra em vigor.';
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;
const penas = (): Dispositivo[] => getDispositivoAndFilhosAsLista(state.articulacao!).filter(isPena);
const idsDosFilhos = (id: string): string[] => dispositivo(id).filhos.map((f: Dispositivo) => f.id!);
const nomesDasAcoes = (id: string): string[] =>
  dispositivo(id)
    .getAcoesPossiveis(dispositivo(id))
    .map((a: any) => a.descricao);

const executa = (acao: any, id: string, rotulo?: string): void => {
  state = elementoReducer(state, acao.execute(createElemento(dispositivo(id)), rotulo));
};
const desfaz = (): void => {
  state = elementoReducer(state, UndoAction());
};
const refaz = (): void => {
  state = elementoReducer(state, redoAction());
};
const passos = (): number => state.past?.length ?? 0;
const eventosDoTipo = (tipo: StateType): any[] => state.ui!.events.filter(e => e.stateType === tipo).flatMap(e => e.elementos ?? []);

const ADICIONAR = 'Adicionar pena, medida administrativa e outros';

describe('Pena: ações de menu', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('oferece adicionar pena no artigo e no parágrafo que não têm pena', () => {
    expect(nomesDasAcoes('art1')).to.include(ADICIONAR);
    expect(nomesDasAcoes('art1_par1')).to.include(ADICIONAR);
  });

  it('não oferece adicionar pena quando o dono já tem pena', () => {
    executa(adicionarPenaAction, 'art1');
    executa(adicionarPenaAction, 'art1_par1');
    expect(nomesDasAcoes('art1')).not.to.include(ADICIONAR);
    expect(nomesDasAcoes('art1_par1')).not.to.include(ADICIONAR);
    expect(nomesDasAcoes('art1_par2')).to.include(ADICIONAR);
  });

  it('não oferece adicionar pena em dispositivo bloqueado', () => {
    dispositivo('art1_par1').bloqueado = true;
    expect(nomesDasAcoes('art1_par1')).not.to.include(ADICIONAR);
  });

  it('não oferece adicionar pena no artigo que carrega bloco de alteração', () => {
    createAlteracao(dispositivo('art2'));
    criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, dispositivo('art2').alteracoes);
    expect(nomesDasAcoes('art2')).not.to.include(ADICIONAR);
  });

  it('oferece adicionar pena em dispositivo de bloco de alteração', () => {
    createAlteracao(dispositivo('art2'));
    const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, dispositivo('art2').alteracoes);
    expect(cabeca.getAcoesPossiveis(cabeca).map((a: any) => a.descricao)).to.include(ADICIONAR);
  });

  it('o menu da pena só tem Remover e Alterar rótulo', () => {
    executa(adicionarPenaAction, 'art1_par1');
    expect(nomesDasAcoes('art1_par1_pena')).to.deep.equal(['Alterar rótulo', 'Remover']);
  });

  it('o menu da pena bloqueada fica vazio', () => {
    executa(adicionarPenaAction, 'art1_par1');
    dispositivo('art1_par1_pena').bloqueado = true;
    expect(nomesDasAcoes('art1_par1_pena')).to.deep.equal([]);
  });

  it('Tab em Inciso, Alínea e Item não oferece transformação em pena', () => {
    ['art1_cpt_inc2', 'art1_cpt_inc2_ali1', 'art1_cpt_inc2_ali1_ite1'].forEach(id => {
      const transformacoes = dispositivo(id)
        .getAcoesPossiveis(dispositivo(id))
        .filter((a: any) => a instanceof TransformarElemento);
      expect(
        transformacoes.some((a: any) => a.nomeAcao.endsWith('EmPena')),
        id
      ).to.be.false;
      expect(dispositivo(id).getAcaoPossivelTab(dispositivo(id))?.nomeAcao?.endsWith('EmPena') ?? false, id).to.be.false;
    });
  });
});

describe('Pena: adicionar', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('pelo artigo, cria a pena no caput, depois dos incisos e antes do § 1º', () => {
    executa(adicionarPenaAction, 'art1');
    const pena = penas()[0];
    expect(pena.id).to.equal('art1_cpt_pena');
    expect(pena.pai!.tipo).to.equal('Caput');
    expect(pena.rotulo).to.equal('Pena –');
    expect(pena.texto).to.equal('');
    expect(idsDosFilhos('art1')).to.deep.equal(['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_pena', 'art1_par1', 'art1_par2']);
    const incluidos = eventosDoTipo(StateType.ElementoIncluido);
    expect(incluidos.map(e => e.lexmlId)).to.deep.equal(['art1_cpt_pena']);
    expect(state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!.referencia!.lexmlId).to.equal('art1_cpt_inc2_ali1_ite1');
    expect(eventosDoTipo(StateType.ElementoMarcado).map(e => e.lexmlId)).to.include('art1_cpt_pena');
  });

  it('pelo artigo sem filhos no caput, a linha entra depois do artigo', () => {
    executa(adicionarPenaAction, 'art2');
    expect(penas()[0].id).to.equal('art2_cpt_pena');
    expect(state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!.referencia!.lexmlId).to.equal('art2');
  });

  it('pelo parágrafo, cria a pena depois dos incisos', () => {
    executa(adicionarPenaAction, 'art1_par1');
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_pena']);
    expect(state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!.referencia!.lexmlId).to.equal('art1_par1_inc1');
  });

  it('usa o rótulo informado', () => {
    executa(adicionarPenaAction, 'art1_par1', 'Infração -');
    expect(penas()[0].rotulo).to.equal('Infração –');
  });

  it('sem rótulo informado, usa o da primeira pena do documento', () => {
    executa(adicionarPenaAction, 'art1', 'Medida Administrativa');
    executa(adicionarPenaAction, 'art1_par1');
    expect(penas().map(p => p.rotulo)).to.deep.equal(['Medida Administrativa –', 'Medida Administrativa –']);
  });

  it('a primeira pena na ordem de leitura vale, mesmo que não seja a primeira criada', () => {
    executa(adicionarPenaAction, 'art1_par1', 'Infração');
    executa(adicionarPenaAction, 'art1', 'Medida Administrativa');
    executa(adicionarPenaAction, 'art2');
    expect(penas().map(p => p.id)).to.deep.equal(['art1_cpt_pena', 'art1_par1_pena', 'art2_cpt_pena']);
    expect(penas().map(p => p.rotulo)).to.deep.equal(['Medida Administrativa –', 'Infração –', 'Medida Administrativa –']);
  });

  it('o dono nunca fica com duas penas', () => {
    executa(adicionarPenaAction, 'art1');
    const antes = passos();
    executa(adicionarPenaAction, 'art1');
    expect(penas().length).to.equal(1);
    expect(passos()).to.equal(antes);
    expect(state.ui!.message?.descricao).to.contain('não é possível adicionar pena');
  });

  it('não altera a numeração dos irmãos', () => {
    executa(adicionarPenaAction, 'art1');
    expect(dispositivo('art1_par2').rotulo).to.equal('§ 2º');
    expect(dispositivo('art1_cpt_inc2').rotulo).to.equal('II –');
  });

  it('é um único passo do histórico; desfazer e refazer', () => {
    const antes = passos();
    executa(adicionarPenaAction, 'art1_par1', 'Infração');
    expect(passos()).to.equal(antes + 1);
    desfaz();
    expect(penas().length).to.equal(0);
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1']);
    refaz();
    expect(penas().map(p => p.id)).to.deep.equal(['art1_par1_pena']);
    expect(penas()[0].rotulo).to.equal('Infração –');
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_pena']);
  });

  it('desfazer e refazer a pena do caput a mantém no caput, antes dos parágrafos', () => {
    executa(adicionarPenaAction, 'art1');
    desfaz();
    expect(penas().length).to.equal(0);
    refaz();
    expect(penas()[0].pai!.tipo).to.equal('Caput');
    expect(idsDosFilhos('art1')).to.deep.equal(['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_pena', 'art1_par1', 'art1_par2']);
  });
});

describe('Pena: remover', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    executa(adicionarPenaAction, 'art1_par1');
    state.ui = { events: [] } as any;
  });

  it('remove a pena e preserva o dono e os demais filhos', () => {
    state = elementoReducer(state, removerElementoAction.execute(createElemento(dispositivo('art1_par1_pena')), undefined));
    expect(penas().length).to.equal(0);
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1']);
    expect(dispositivo('art1_par1').texto).to.equal('Se o crime é culposo:');
    expect(eventosDoTipo(StateType.ElementoRemovido).map(e => e.lexmlId)).to.deep.equal(['art1_par1_pena']);
  });

  it('desfaz e refaz a remoção, mantendo rótulo e posição', () => {
    executa(alterarRotuloPenaAction, 'art1_par1_pena', 'Infração');
    state = elementoReducer(state, removerElementoAction.execute(createElemento(dispositivo('art1_par1_pena')), undefined));
    desfaz();
    expect(penas().map(p => p.rotulo)).to.deep.equal(['Infração –']);
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_pena']);
    refaz();
    expect(penas().length).to.equal(0);
  });

  it('remover o dono leva a pena junto', () => {
    state = elementoReducer(state, removerElementoAction.execute(createElemento(dispositivo('art1_par1')), undefined));
    expect(penas().length).to.equal(0);
  });
});

describe('Pena: alterar rótulo', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    executa(adicionarPenaAction, 'art1');
    executa(adicionarPenaAction, 'art1_par1');
    state.ui = { events: [] } as any;
  });

  it('altera só a pena escolhida', () => {
    executa(alterarRotuloPenaAction, 'art1_par1_pena', 'Medida Administrativa');
    expect(penas().map(p => p.rotulo)).to.deep.equal(['Pena –', 'Medida Administrativa –']);
    expect(eventosDoTipo(StateType.ElementoModificado).map(e => e.rotulo)).to.deep.equal(['Medida Administrativa –']);
  });

  it('aceita rótulo livre e normaliza o separador', () => {
    executa(alterarRotuloPenaAction, 'art1_cpt_pena', 'Sanção -');
    expect(dispositivo('art1_cpt_pena').rotulo).to.equal('Sanção –');
  });

  it('não registra passo quando o rótulo não muda', () => {
    const antes = passos();
    executa(alterarRotuloPenaAction, 'art1_cpt_pena', 'Pena –');
    executa(alterarRotuloPenaAction, 'art1_cpt_pena', 'Pena -');
    expect(passos()).to.equal(antes);
    expect(state.ui!.events).to.deep.equal([]);
  });

  it('é um passo do histórico por alteração, desfeito e refeito isoladamente', () => {
    const antes = passos();
    executa(alterarRotuloPenaAction, 'art1_cpt_pena', 'Infração');
    executa(alterarRotuloPenaAction, 'art1_cpt_pena', 'Penalidade');
    expect(passos()).to.equal(antes + 2);
    desfaz();
    expect(dispositivo('art1_cpt_pena').rotulo).to.equal('Infração –');
    desfaz();
    expect(dispositivo('art1_cpt_pena').rotulo).to.equal('Pena –');
    refaz();
    expect(dispositivo('art1_cpt_pena').rotulo).to.equal('Infração –');
    refaz();
    expect(dispositivo('art1_cpt_pena').rotulo).to.equal('Penalidade –');
  });

  it('não vale para dispositivo que não é pena', () => {
    const antes = passos();
    executa(alterarRotuloPenaAction, 'art1_par1', 'Infração');
    expect(passos()).to.equal(antes);
    expect(dispositivo('art1_par1').rotulo).to.equal('§ 1º');
  });
});

describe('Pena: remoção sem texto e Enter', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    executa(adicionarPenaAction, 'art1_par1');
    state.ui = { events: [] } as any;
  });

  ['Backspace', 'Delete'].forEach(tecla => {
    it(`${tecla} na pena sem texto remove a pena e preserva o dono`, () => {
      state = elementoReducer(state, removerElementoSemTextoAction.execute(createElemento(dispositivo('art1_par1_pena')), tecla));
      expect(penas().length).to.equal(0);
      expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1']);
      expect(dispositivo('art1_par1').texto).to.equal('Se o crime é culposo:');
    });
  });

  it('desfaz e refaz a remoção sem texto', () => {
    state = elementoReducer(state, removerElementoSemTextoAction.execute(createElemento(dispositivo('art1_par1_pena')), 'Delete'));
    desfaz();
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_pena']);
    refaz();
    expect(penas().length).to.equal(0);
  });

  it('Enter na pena nunca cria uma segunda pena no dono', () => {
    state = elementoReducer(state, adicionarElementoAction.execute(createElemento(dispositivo('art1_par1_pena')), ''));
    expect(penas().length).to.equal(1);
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_pena']);
  });
});

describe('Pena: mensagens de pontuação atualizadas na hora', () => {
  const mensagensValidadas = (id: string): string[] | undefined =>
    eventosDoTipo(StateType.ElementoValidado)
      .filter(e => e.lexmlId === id)
      .pop()
      ?.mensagens?.map((m: any) => m.descricao);
  const DOIS_PONTOS = (nome: string): string => `${nome} deveria terminar com dois pontos.`;

  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('adicionar pena ao artigo cujo caput termina em ponto revalida o artigo, que passa a pedir dois-pontos', () => {
    executa(adicionarPenaAction, 'art2');
    expect(mensagensValidadas('art2')).to.include(DOIS_PONTOS('Artigo'));
  });

  it('remover a pena revalida o artigo, que deixa de pedir dois-pontos', () => {
    executa(adicionarPenaAction, 'art2');
    state = elementoReducer(state, removerElementoAction.execute(createElemento(dispositivo('art2_cpt_pena')), undefined));
    expect(mensagensValidadas('art2')).not.to.include(DOIS_PONTOS('Artigo'));
    expect(mensagensValidadas('art2')).to.be.an('array');
  });

  it('desfazer e refazer a adição reavaliam a mensagem', () => {
    executa(adicionarPenaAction, 'art2');
    desfaz();
    expect(mensagensValidadas('art2')).not.to.include(DOIS_PONTOS('Artigo'));
    refaz();
    expect(mensagensValidadas('art2')).to.include(DOIS_PONTOS('Artigo'));
  });

  it('adicionar pena ao parágrafo revalida o último inciso, que termina em ponto', () => {
    (dispositivo('art1_par1_inc1') as any).texto = 'no trânsito.';
    executa(adicionarPenaAction, 'art1_par1');
    expect(mensagensValidadas('art1_par1_inc1')).to.deep.equal([DOIS_PONTOS('Inciso')]);
  });
});
