import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { adicionarElementoAction, adicionarIncisoDepois } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { atualizarTextoElementoAction } from '../../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { removerElementoAction } from '../../../../src/model/lexml/acao/removerElementoAction';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';
import { RemissaoInternaValue } from '../../../../src/model/remissao';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';

let state: State;

const novo = (pai: Dispositivo, tipo: string, texto: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  if (isPena(d)) d.rotulo = 'Pena –';
  return d;
};

// § 1º com os incisos I e II (o II termina em ":") e a pena; o inciso I tem pena própria.
const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Texto.';
  const par1 = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido:');
  const inc1 = novo(par1, TipoDispositivo.inciso.tipo, 'primeiro;');
  novo(par1, TipoDispositivo.inciso.tipo, 'segundo:');
  novo(par1, TipoDispositivo.pena.tipo, 'reclusão.');
  novo(inc1, TipoDispositivo.pena.tipo, 'multa.');
  novo(art1, TipoDispositivo.paragrafo.tipo, 'Outro texto.');
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;

// Mensagens do último evento de validação/inclusão que cita o dispositivo.
const mensagensNosEventos = (uuid?: number): string[] | undefined => {
  let achou: string[] | undefined;
  state.ui!.events.forEach(e => {
    if (![StateType.ElementoValidado, StateType.ElementoIncluido, StateType.ElementoModificado].includes(e.stateType)) return;
    e.elementos?.filter(el => el.uuid === uuid).forEach(el => (achou = (el.mensagens ?? []).map(m => m.descricao ?? '')));
  });
  return achou;
};
const pedeDoisPontos = (msgs?: string[]): boolean => !!msgs?.some(m => m.includes('dois pontos'));
const pedePontoEVirgula = (msgs?: string[]): boolean => !!msgs?.some(m => m.includes('ponto e vírgula'));

describe('Pena: revalidação do dispositivo anterior por outras operações', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('incluir o inciso III depois do II: o II volta a pedir ";" e o III pede ":", nos eventos', () => {
    const inc2 = dispositivo('art1_par1_inc2');
    state = elementoReducer(state, adicionarIncisoDepois.execute(createElemento(inc2), ''));
    const inc3 = dispositivo('art1_par1_inc3');
    expect(inc3.texto).to.equal('');
    expect(pedePontoEVirgula(mensagensNosEventos(inc2.uuid))).to.equal(true);
    expect(pedeDoisPontos(mensagensNosEventos(inc2.uuid))).to.equal(false);
    const el3 = createElemento(inc3);
    el3.conteudo!.texto = 'terceiro.';
    state = elementoReducer(state, atualizarTextoElementoAction.execute(el3));
    expect(pedeDoisPontos(mensagensNosEventos(inc3.uuid))).to.equal(true);
  });

  it('remover o III: o II volta a pedir ":" (e deixa de pedir ";"), nos eventos', () => {
    state = elementoReducer(state, adicionarIncisoDepois.execute(createElemento(dispositivo('art1_par1_inc2')), ''));
    const inc2 = dispositivo('art1_par1_inc2');
    (inc2 as any).texto = 'segundo;';
    state.ui = { events: [] } as any;
    state = elementoReducer(state, removerElementoAction.execute(createElemento(dispositivo('art1_par1_inc3')), undefined));
    expect(dispositivo('art1_par1').filhos.length).to.equal(3);
    expect(pedeDoisPontos(mensagensNosEventos(inc2.uuid))).to.equal(true);
    expect(pedePontoEVirgula(mensagensNosEventos(inc2.uuid))).to.equal(false);
  });
});

describe('Pena: remissão depois do Enter na pena', () => {
  it('a remissão ao inciso II passa a inciso III depois do Enter na pena do inciso I', () => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
    const origem = dispositivo('art1_cpt');
    const destino = dispositivo('art1_par1_inc2');
    origem.texto = 'Conforme o inciso II do § 1º, aplica-se.';
    const entrada: RemissaoInternaValue = {
      refId: 'ref_teste',
      sourceUuid: origem.uuid,
      targetUuid: destino.uuid,
      targetLexmlId: destino.id,
      textoRef: 'inciso II do § 1º',
      inicio: 'Conforme o '.length,
    };
    state.remissoes = { [origem.uuid!]: [entrada] };

    state = elementoReducer(state, adicionarElementoAction.execute(createElemento(dispositivo('art1_par1_inc1_pena')), ''));

    expect(destino.id).to.equal('art1_par1_inc3');
    const atualizada = state.remissoes![origem.uuid!][0];
    expect(atualizada.targetLexmlId).to.equal('art1_par1_inc3');
    expect(atualizada.textoRef).to.equal('inciso III do § 1º do art. 1º');
  });
});
