import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { adicionarElementoAction, adicionarIncisoAntes } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';

let state: State;

const novo = (pai: Dispositivo, tipo: string, texto: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  if (isPena(d)) d.rotulo = 'Pena –';
  return d;
};

// Art. 1º: caput com os incisos I (com pena) e II, pena do caput, § 1º (com pena) e § 2º.
const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Matar alguém:';
  const inc1 = novo(art1, TipoDispositivo.inciso.tipo, 'por motivo fútil:');
  novo(art1, TipoDispositivo.inciso.tipo, 'contra criança:');
  novo(art1, TipoDispositivo.pena.tipo, 'reclusão (caput).');
  const par1 = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é culposo:');
  novo(art1, TipoDispositivo.paragrafo.tipo, 'Outro texto.');
  novo(inc1, TipoDispositivo.pena.tipo, 'multa (I).');
  novo(par1, TipoDispositivo.pena.tipo, 'prisão (§ 1º).');
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;
const idsDosFilhos = (id: string): string[] => dispositivo(id).filhos.map((f: Dispositivo) => f.id!);
const estrutura = (): string[] => getDispositivoAndFilhosAsLista(state.articulacao!).map(d => `${d.id}|${d.rotulo ?? ''}`);
const enter = (id: string, textoNovaLinha = ''): void => {
  state = elementoReducer(state, adicionarElementoAction.execute(createElemento(dispositivo(id)), textoNovaLinha));
};
const referenciaDoEvento = (): string | undefined => state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)?.referencia?.lexmlId;

describe('Pena: Enter na linha da pena', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('na pena do inciso cria o inciso seguinte logo depois da pena, e renumera os demais', () => {
    enter('art1_cpt_inc1_pena');
    expect(idsDosFilhos('art1')).to.deep.equal(['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_inc3', 'art1_cpt_pena', 'art1_par1', 'art1_par2']);
    expect(dispositivo('art1_cpt_inc2').texto).to.equal('');
    expect(dispositivo('art1_cpt_inc3').texto).to.equal('contra criança:');
    expect(dispositivo('art1_cpt_inc3').rotulo).to.equal('III –');
    expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal(['art1_cpt_inc1_pena']);
    expect(referenciaDoEvento()).to.equal('art1_cpt_inc1_pena');
  });

  it('na pena do caput cria o primeiro parágrafo, e o existente passa a ser o § 2º', () => {
    enter('art1_cpt_pena');
    expect(idsDosFilhos('art1')).to.deep.equal(['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_pena', 'art1_par1', 'art1_par2', 'art1_par3']);
    expect(dispositivo('art1_par1').texto).to.equal('');
    expect(dispositivo('art1_par2').texto).to.equal('Se o crime é culposo:');
    expect(dispositivo('art1_par2').rotulo).to.equal('§ 2º');
    expect(idsDosFilhos('art1_par2')).to.deep.equal(['art1_par2_pena']);
    expect(referenciaDoEvento()).to.equal('art1_cpt_pena');
  });

  it('na pena do parágrafo cria o parágrafo seguinte logo depois dele e da pena', () => {
    enter('art1_par1_pena');
    expect(idsDosFilhos('art1').slice(3)).to.deep.equal(['art1_par1', 'art1_par2', 'art1_par3']);
    expect(dispositivo('art1_par2').texto).to.equal('');
    expect(dispositivo('art1_par3').texto).to.equal('Outro texto.');
    expect(referenciaDoEvento()).to.equal('art1_par1_pena');
  });

  it('o dono nunca fica com duas penas', () => {
    enter('art1_cpt_inc1_pena');
    expect(getDispositivoAndFilhosAsLista(state.articulacao!).filter(isPena).length).to.equal(3);
    expect(idsDosFilhos('art1_cpt_inc2')).to.deep.equal([]);
  });

  it('antes do fim do texto (há texto na nova linha) não faz nada', () => {
    const antes = estrutura();
    const passos = state.past?.length ?? 0;
    enter('art1_cpt_inc1_pena', 'parte do texto depois do cursor');
    expect(estrutura()).to.deep.equal(antes);
    expect(state.past?.length ?? 0).to.equal(passos);
  });

  it('no início do texto (ação "antes") não faz nada', () => {
    const antes = estrutura();
    state = elementoReducer(state, adicionarIncisoAntes.execute(createElemento(dispositivo('art1_cpt_inc1_pena')), ''));
    expect(estrutura()).to.deep.equal(antes);
  });

  it('preserva o texto da pena ainda não sincronizado', () => {
    const elemento = createElemento(dispositivo('art1_cpt_inc1_pena'));
    elemento.conteudo!.texto = 'multa, de dois a cinco salários.';
    state = elementoReducer(state, adicionarElementoAction.execute(elemento, ''));
    expect(dispositivo('art1_cpt_inc1_pena').texto).to.equal('multa, de dois a cinco salários.');
    expect(dispositivo('art1_cpt_inc2').texto).to.equal('');
  });

  ['art1_cpt_inc1_pena', 'art1_cpt_pena', 'art1_par1_pena'].forEach(pena => {
    it(`desfazer e refazer (${pena})`, () => {
      const antes = estrutura();
      enter(pena);
      const depois = estrutura();
      state = elementoReducer(state, UndoAction());
      expect(estrutura()).to.deep.equal(antes);
      state = elementoReducer(state, redoAction());
      expect(estrutura()).to.deep.equal(depois);
    });
  });
});
