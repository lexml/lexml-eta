import { expect } from '@open-wc/testing';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { redirecionaRemissao } from '../../../src/redux/elemento/reducer/redirecionaRemissao';
import { State, StateType } from '../../../src/redux/state';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { RemissaoRegistry } from '../../../src/model/remissao/remissaoRegistry';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';

// ---------------------------------------------------------------------------
// C1 — Imutabilidade do state Redux (Bug crítico)
//
// O código atual executa `state.ui.events = []` nas saídas antecipadas,
// mutando diretamente o objeto de entrada. O Redux exige imutabilidade:
// o reducer deve retornar um NOVO objeto, nunca modificar o state recebido.
//
// Linhas afetadas:
//   adicionaRemissaoInterna.ts:41 → state.ui.events = [];
//   adicionaRemissaoInterna.ts:48 → state.ui.events = [];
//   redirecionaRemissao.ts:10     → state.ui.events = [];
//   redirecionaRemissao.ts:17     → state.ui.events = [];
//
// Estes testes estão escritos para o comportamento CORRETO e FALHARÃO
// enquanto o bug existir.
//
// Usa createArticulacao() + criaDispositivo() — sem parsing de MPV_905_2019 —
// para manter o setup leve e evitar timeout do browser.
// ---------------------------------------------------------------------------

const eventoFalso = { stateType: StateType.ElementoSelecionado, elementos: [] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Cria state mínimo com uma articulação real e um artigo sem texto. */
function criarStateMinimal(): { state: State; artigo: Artigo } {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;

  const state: State = {
    articulacao,
    ui: { events: [] },
    emRevisao: false,
    revisoes: [],
    remissoes: new RemissaoRegistry(),
  } as any;

  return { state, artigo };
}

// ---------------------------------------------------------------------------
// adicionaRemissaoInterna
// ---------------------------------------------------------------------------

describe('C1 — Imutabilidade: adicionaRemissaoInterna não deve mutar o state de entrada', () => {
  it('não deve mutar state.ui.events quando uuid não existe (linha 41)', () => {
    const { state } = criarStateMinimal();

    const eventosOriginais = [eventoFalso];
    state.ui = { events: eventosOriginais };

    adicionaRemissaoInterna(state, { atual: { uuid: 999999 } });

    // BUG ATUAL: state.ui.events === [] (referência substituída por mutação)
    // CORRETO:   state.ui.events deve ser a mesma referência do array original
    expect(state.ui!.events).to.equal(eventosOriginais, 'state.ui.events não deve ser substituído por mutação direta');
    expect(state.ui!.events).to.have.length(1, 'o array original deve permanecer com 1 evento');
  });

  it('não deve mutar state.ui.events quando dispositivo não tem texto (linha 41)', () => {
    const { state, artigo } = criarStateMinimal();

    artigo.texto = undefined as any;
    const elemento = createElemento(artigo, true);

    const eventosOriginais = [eventoFalso];
    state.ui = { events: eventosOriginais };

    adicionaRemissaoInterna(state, { atual: elemento });

    // BUG ATUAL: state.ui.events === [] (linha 41)
    expect(state.ui!.events).to.equal(eventosOriginais, 'state.ui.events não deve ser mutado em saída por texto vazio');
  });

  it('não deve mutar state.ui.events quando texto não contém referências (linha 48)', () => {
    const { state, artigo } = criarStateMinimal();

    artigo.texto = 'Parágrafo sem qualquer remissão.';
    const elemento = createElemento(artigo, true);

    const eventosOriginais = [eventoFalso];
    state.ui = { events: eventosOriginais };

    adicionaRemissaoInterna(state, { atual: elemento });

    // BUG ATUAL: state.ui.events === [] (linha 48)
    expect(state.ui!.events).to.equal(eventosOriginais, 'state.ui.events não deve ser mutado quando texto não tem referências');
  });

  it('resultado deve ser um NOVO objeto state (não a mesma referência)', () => {
    const { state } = criarStateMinimal();
    state.ui = { events: [eventoFalso] };

    const result = adicionaRemissaoInterna(state, { atual: { uuid: 999999 } });

    expect(result).to.not.equal(state, 'o reducer deve retornar um novo objeto de state');
    expect(result.ui!.events).to.have.length(0, 'o resultado deve ter events vazio');
    expect(state.ui!.events).to.have.length(1, 'o state original deve continuar inalterado com 1 evento');
  });

  it('state.ui deve ser a mesma referência após saída antecipada (objeto não substituído)', () => {
    const { state, artigo } = criarStateMinimal();

    artigo.texto = undefined as any;
    const elemento = createElemento(artigo, true);

    const uiOriginal = state.ui;

    adicionaRemissaoInterna(state, { atual: elemento });

    // O OBJETO state.ui não deve ter sido tocado — apenas o resultado deve ser novo
    expect(state.ui).to.equal(uiOriginal, 'state.ui deve ser a mesma referência após saída antecipada');
  });
});

// ---------------------------------------------------------------------------
// redirecionaRemissao
// ---------------------------------------------------------------------------

describe('C1 — Imutabilidade: redirecionaRemissao não deve mutar o state de entrada', () => {
  it('não deve mutar state.ui.events quando uuid é undefined (linha 10)', () => {
    const { state } = criarStateMinimal();

    const eventosOriginais = [eventoFalso];
    state.ui = { events: eventosOriginais };

    redirecionaRemissao(state, { uuid: undefined });

    // BUG ATUAL: state.ui.events === [] (linha 10)
    expect(state.ui!.events).to.equal(eventosOriginais, 'state.ui.events não deve ser substituído por mutação direta');
    expect(state.ui!.events).to.have.length(1);
  });

  it('não deve mutar state.ui.events quando action não tem propriedade uuid', () => {
    const { state } = criarStateMinimal();

    const eventosOriginais = [eventoFalso];
    state.ui = { events: eventosOriginais };

    redirecionaRemissao(state, {});

    expect(state.ui!.events).to.equal(eventosOriginais, 'state.ui.events não deve ser mutado');
    expect(state.ui!.events).to.have.length(1);
  });

  it('não deve mutar state.ui.events quando uuid não existe na articulação (linha 17)', () => {
    const { state } = criarStateMinimal();

    const eventosOriginais = [eventoFalso];
    state.ui = { events: eventosOriginais };

    redirecionaRemissao(state, { uuid: 999999 });

    // BUG ATUAL: state.ui.events === [] (linha 17)
    expect(state.ui!.events).to.equal(eventosOriginais, 'state.ui.events não deve ser mutado quando uuid não existe');
    expect(state.ui!.events).to.have.length(1);
  });

  it('resultado deve ser um NOVO objeto state (não a mesma referência)', () => {
    const { state } = criarStateMinimal();
    state.ui = { events: [eventoFalso] };

    const result = redirecionaRemissao(state, { uuid: undefined });

    expect(result).to.not.equal(state, 'o reducer deve retornar um novo objeto de state');
    expect(result.ui!.events).to.have.length(0);
    expect(state.ui!.events).to.have.length(1, 'o state original deve continuar inalterado');
  });

  it('state.ui deve ser a mesma referência após saída antecipada por uuid undefined', () => {
    const { state } = criarStateMinimal();

    const uiOriginal = state.ui;
    redirecionaRemissao(state, { uuid: undefined });
    expect(state.ui).to.equal(uiOriginal, 'state.ui deve ser a mesma referência após saída antecipada');
  });

  it('state.ui deve ser a mesma referência após saída antecipada por uuid inexistente', () => {
    const { state } = criarStateMinimal();

    const uiOriginal = state.ui;
    redirecionaRemissao(state, { uuid: 999999 });
    expect(state.ui).to.equal(uiOriginal, 'state.ui deve ser a mesma referência após saída antecipada');
  });
});
