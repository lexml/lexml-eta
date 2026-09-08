import { expect } from '@open-wc/testing';
import { State, StateType } from '../../../src/redux/state';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { TipoMensagem } from '../../../src/model/lexml/util/mensagem';
import { marcarRemissaoPendenteRevisao, marcarRemissaoRevisada } from '../../../src/redux/elemento/reducer/marcarRemissaoRevisao';
import { MENSAGEM_REMISSAO_TEXTO_PRESERVADO, MENSAGEM_REMISSAO_INVALIDA } from '../../../src/model/remissao/remissao';

function eventosValidados(state: State): any[] {
  return (state.ui?.events ?? []).filter((ev: any) => ev.stateType === StateType.ElementoValidado);
}

function mensagensDoElemento(state: State): any[] {
  const evs = eventosValidados(state);
  return evs.length > 0 ? evs[0].elementos?.[0]?.mensagens ?? [] : [];
}

describe('MARCAR_REMISSAO_PENDENTE_REVISAO', () => {
  let state: State;
  let art1Uuid: number;
  let art2Uuid: number;
  let art3Uuid: number;

  beforeEach(() => {
    const { state: s, artigos } = criaStateComNArtigos(3);
    state = s;
    art1Uuid = artigos[0].uuid!;
    art2Uuid = artigos[1].uuid!;
    art3Uuid = artigos[2].uuid!;
  });

  it('marca revisao:true na entrada correta', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid }],
      },
    };

    const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_1'] });

    expect(novo.remissoes![art1Uuid][0].revisao).to.equal(true);
  });

  it('não afeta outras entradas do mesmo dispositivo', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [
          { refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid },
          { refId: 'ref_2', targetLexmlId: 'art3', targetUuid: art3Uuid },
        ],
      },
    };

    const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_1'] });

    const entries = novo.remissoes![art1Uuid];
    expect(entries[0].revisao).to.equal(true);
    expect(entries[1].revisao).to.be.undefined;
  });

  it('não afeta entradas de outros dispositivos', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid }],
        [art2Uuid]: [{ refId: 'ref_2', targetLexmlId: 'art3', targetUuid: art3Uuid }],
      },
    };

    const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_1'] });

    expect(novo.remissoes![art2Uuid][0].revisao).to.be.undefined;
  });

  it('emite ElementoValidado com WARNING', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid }],
      },
    };

    const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_1'] });

    const evs = eventosValidados(novo);
    expect(evs).to.have.length(1);

    const warning = mensagensDoElemento(novo).find((m: any) => m.tipo === TipoMensagem.WARNING);
    expect(warning).to.exist;
    expect(warning.descricao).to.equal(MENSAGEM_REMISSAO_TEXTO_PRESERVADO);
  });

  it('emite WARNING mesmo sem entries no state (state stale)', () => {
    const base: State = { ...state, remissoes: {} };

    const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_inexistente'] });

    const evs = eventosValidados(novo);
    expect(evs).to.have.length(1);

    const warning = mensagensDoElemento(novo).find((m: any) => m.tipo === TipoMensagem.WARNING);
    expect(warning).to.exist;
    expect(warning.descricao).to.equal(MENSAGEM_REMISSAO_TEXTO_PRESERVADO);
  });

  it('combina ERROR de inválida + WARNING quando há ambas', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [
          { refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, valida: false },
          { refId: 'ref_2', targetLexmlId: 'art3', targetUuid: art3Uuid },
        ],
      },
    };

    const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_2'] });

    const msgs = mensagensDoElemento(novo);
    expect(msgs.find((m: any) => m.tipo === TipoMensagem.ERROR)).to.exist;
    expect(msgs.find((m: any) => m.tipo === TipoMensagem.WARNING)).to.exist;
  });
});

describe('MARCAR_REMISSAO_REVISADA', () => {
  let state: State;
  let art1Uuid: number;
  let art2Uuid: number;

  beforeEach(() => {
    const { state: s, artigos } = criaStateComNArtigos(3);
    state = s;
    art1Uuid = artigos[0].uuid!;
    art2Uuid = artigos[1].uuid!;
  });

  it('remove o flag revisao da entrada', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true }],
      },
    };

    const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_1' });

    expect(novo.remissoes![art1Uuid][0].revisao).to.be.undefined;
  });

  it('emite ElementoValidado SEM WARNING quando não há mais revisões pendentes', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true }],
      },
    };

    const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_1' });

    const evs = eventosValidados(novo);
    expect(evs).to.have.length(1);

    const warning = mensagensDoElemento(novo).find((m: any) => m.tipo === TipoMensagem.WARNING && m.descricao === MENSAGEM_REMISSAO_TEXTO_PRESERVADO);
    expect(warning).to.not.exist;
  });

  it('mantém WARNING quando há outra entrada ainda com revisao:true', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [
          { refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true },
          { refId: 'ref_2', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true },
        ],
      },
    };

    const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_1' });

    const warning = mensagensDoElemento(novo).find((m: any) => m.tipo === TipoMensagem.WARNING && m.descricao === MENSAGEM_REMISSAO_TEXTO_PRESERVADO);
    expect(warning).to.exist;
  });

  it('mantém ERROR de inválida ao revisar texto pendente', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [
          { refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true },
          { refId: 'ref_2', targetLexmlId: 'art2', targetUuid: art2Uuid, valida: false },
        ],
      },
    };

    const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_1' });

    const error = mensagensDoElemento(novo).find((m: any) => m.tipo === TipoMensagem.ERROR && m.descricao === MENSAGEM_REMISSAO_INVALIDA);
    expect(error).to.exist;
  });

  it('não afeta entrada com valida:false', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [
          { refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true },
          { refId: 'ref_2', targetLexmlId: 'art2', targetUuid: art2Uuid, valida: false },
        ],
      },
    };

    const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_1' });

    const entryInvalida = novo.remissoes![art1Uuid].find((r: any) => r.refId === 'ref_2');
    expect(entryInvalida?.valida).to.equal(false);
    expect((entryInvalida as any)?.revisao).to.be.undefined;
  });
});
