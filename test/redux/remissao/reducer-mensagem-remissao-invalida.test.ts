import { expect } from '@open-wc/testing';
import { State, StateType } from '../../../src/redux/state';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { removerRemissaoInvalida } from '../../../src/redux/elemento/reducer/removerRemissaoInvalida';
import { atualizaTextoElemento } from '../../../src/redux/elemento/reducer/atualizaTextoElemento';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { criaStateComNArtigos, montaState, marcaAdicionado } from '../../helpers/dispositivo-helper';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { TipoMensagem } from '../../../src/model/lexml/util/mensagem';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';

const DESCRICAO_REMISSAO_INVALIDA = 'Este dispositivo contém referência para dispositivo que foi excluído.';

/** Filtra eventos ElementoValidado que contêm a mensagem de remissão inválida. */
function eventosComMensagemRemissao(events: any[]): any[] {
  return events
    .filter(ev => ev.stateType === StateType.ElementoValidado)
    .filter(ev => ev.elementos?.some((el: any) => el.mensagens?.some((m: any) => m.descricao === DESCRICAO_REMISSAO_INVALIDA)));
}

describe('Mensagem de remissão inválida', () => {
  // ─────────────────────────────────────────────────────────────
  // remoção de B referenciado por A → ElementoValidado para A
  // ─────────────────────────────────────────────────────────────
  it('deve emitir ElementoValidado com mensagem ERROR para o dispositivo de origem ao remover o destino', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    const stateComRemissoes: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid }],
      },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });

    const eventos = eventosComMensagemRemissao(newState.ui!.events);
    expect(eventos).to.have.length(1);
    expect(eventos[0].elementos![0].uuid).to.equal(art1.uuid);

    const mensagem = eventos[0].elementos![0].mensagens.find((m: any) => m.tipo === TipoMensagem.ERROR);
    expect(mensagem).to.exist;
    expect(mensagem.descricao).to.equal(DESCRICAO_REMISSAO_INVALIDA);
  });

  // ─────────────────────────────────────────────────────────────
  // remoção de B sem remissões → sem mensagem extra
  // ─────────────────────────────────────────────────────────────
  it('não deve emitir ElementoValidado com mensagem de remissão quando não há remissões apontando para o dispositivo removido', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [, art2] = artigos;

    // state.remissoes vazio — nenhuma remissão aponta para art2
    const newState = removeElemento(state, { atual: { uuid: art2.uuid } });

    const eventos = eventosComMensagemRemissao(newState.ui!.events);
    expect(eventos).to.have.length(0);
  });

  // ─────────────────────────────────────────────────────────────
  // remoção do link inválido → ElementoValidado para A sem mensagem de remissão
  // ─────────────────────────────────────────────────────────────
  it('deve emitir ElementoValidado sem mensagem de remissão ao remover o link inválido via REMOVER_REMISSAO_INVALIDA', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    const stateComInvalida: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid, valida: false }],
      },
    };

    // remissoesRestantes vazio — o link foi removido do DOM
    const newState = removerRemissaoInvalida(stateComInvalida, { sourceUuid: art1.uuid, remissoesRestantes: [] });

    const eventosValidados = newState.ui!.events.filter((ev: any) => ev.stateType === StateType.ElementoValidado);
    expect(eventosValidados).to.have.length(1);
    expect(eventosValidados[0].elementos![0].uuid).to.equal(art1.uuid);

    // Não deve conter a mensagem de remissão inválida
    const eventosComRemissao = eventosComMensagemRemissao(newState.ui!.events);
    expect(eventosComRemissao).to.have.length(0);
  });

  // ─────────────────────────────────────────────────────────────
  // state.remissoes[A.uuid] tem valida:false após remoção de B
  // ─────────────────────────────────────────────────────────────
  it('deve persistir valida:false no state.remissoes após remover o dispositivo destino', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    const stateComRemissoes: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid }],
      },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });

    const remissoes = (newState.remissoes as any)[art1.uuid!];
    expect(remissoes).to.have.length(1);
    expect(remissoes[0].valida).to.equal(false);
  });

  // ─────────────────────────────────────────────────────────────
  // undo da exclusão de B → ElementoValidado para A sem mensagem; valida restaurado
  // ─────────────────────────────────────────────────────────────
  it('undo deve emitir ElementoValidado sem mensagem de remissão e restaurar valida para undefined', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    const stateComRemissoes: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid }],
      },
    };

    const stateRemovido = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });
    expect((stateRemovido.remissoes as any)[art1.uuid!][0].valida).to.equal(false, 'pré-condição: valida deve ser false após remoção');

    const stateUndo = undo(stateRemovido);

    // Nenhum evento com mensagem de remissão inválida
    const eventosComRemissao = eventosComMensagemRemissao(stateUndo.ui!.events);
    expect(eventosComRemissao).to.have.length(0);

    // valida deve ter sido restaurado (sem a propriedade ou undefined)
    const remissaoRestaurada = (stateUndo.remissoes as any)?.[art1.uuid!]?.[0];
    expect(remissaoRestaurada).to.exist;
    expect(remissaoRestaurada.valida).to.not.equal(false);
  });

  // ─────────────────────────────────────────────────────────────
  // usuário digita texto no dispositivo de origem → mensagem NÃO deve sumir
  // ─────────────────────────────────────────────────────────────
  it('atualizaTextoElemento deve incluir mensagem de remissão inválida no ElementoValidado quando o dispositivo tem entradas inválidas', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    const stateComInvalida: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid, valida: false }],
      },
    };

    // Simula usuário digitando: art1.texto muda → atualizaTextoElemento deve incluir a mensagem
    const newState = atualizaTextoElemento(stateComInvalida, {
      atual: { uuid: art1.uuid, conteudo: { texto: 'texto atualizado pelo usuário' } },
    });

    const eventosComRemissao = eventosComMensagemRemissao(newState.ui!.events);
    expect(eventosComRemissao).to.have.length.greaterThan(0);
    expect(eventosComRemissao[0].elementos![0].uuid).to.equal(art1.uuid);
  });

  // ─────────────────────────────────────────────────────────────
  // fluxo completo — detecta remissão → remove destino → digita no dispositivo de origem
  // ─────────────────────────────────────────────────────────────
  it('deve manter mensagem de remissão inválida após digitar texto — fluxo completo com detecção automática', () => {
    const { state: state0, artigos } = criaStateComNArtigos(3);
    const [, art2, art3] = artigos;

    // Art. 3 detecta remissão para art. 2 via adicionaRemissaoInterna
    art3.texto = 'conforme o art. 2.';
    const elementoArt3 = createElemento(art3, true);
    const state1 = adicionaRemissaoInterna(state0, { atual: elementoArt3 });
    const remissoesDetectadas = (state1.remissoes as any)[art3.uuid!];
    expect(remissoesDetectadas).to.have.length.greaterThan(0, 'pré-condição: remissão detectada');

    // Remove art. 2 → marca remissão de art. 3 como valida:false
    const state2 = removeElemento(state1, { atual: { uuid: art2.uuid } });
    const remissoesAposRemocao = (state2.remissoes as any)[art3.uuid!];
    expect(remissoesAposRemocao?.some((r: any) => r.valida === false)).to.equal(true, 'pré-condição: valida:false após remoção');

    // Simula dispatch 1: usuário digita texto (dispatch não emite mensagem de remissão)
    const state3 = atualizaTextoElemento(state2, {
      atual: {
        uuid: art3.uuid,
        conteudo: { texto: 'conforme o art. 2. Texto adicional digitado pelo usuário.' },
      },
    });

    // A mensagem de remissão inválida deve estar no ElementoValidado emitido por atualizaTextoElemento
    // (não por adicionaRemissaoInterna — responsabilidade migrada para evitar duplicação)
    const eventosComRemissao = eventosComMensagemRemissao(state3.ui!.events);
    expect(eventosComRemissao).to.have.length.greaterThan(0, 'ElementoValidado deve conter a mensagem de remissão inválida');
    const uuidsAfetados = eventosComRemissao.flatMap((ev: any) => ev.elementos!.map((el: any) => el.uuid));
    expect(uuidsAfetados).to.include(art3.uuid);
  });

  // ─────────────────────────────────────────────────────────────
  // dois dispositivos A e C referenciam B; B excluído → ElementoValidado para ambos
  // ─────────────────────────────────────────────────────────────
  it('deve emitir ElementoValidado com mensagem de remissão para cada dispositivo de origem afetado', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2, art3] = artigos;

    const stateComRemissoes: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref-a', targetLexmlId: art2.id, targetUuid: art2.uuid }],
        [art3.uuid!]: [{ refId: 'ref-b', targetLexmlId: art2.id, targetUuid: art2.uuid }],
      },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });

    const eventos = eventosComMensagemRemissao(newState.ui!.events);
    expect(eventos).to.have.length(2);

    const uuidsAfetados = eventos.map((ev: any) => ev.elementos![0].uuid);
    expect(uuidsAfetados).to.include(art1.uuid);
    expect(uuidsAfetados).to.include(art3.uuid);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Problema 1: Rótulo completo no alerta (ui.alertas)
// ─────────────────────────────────────────────────────────────────────────────
describe('Mensagem de alerta de remissão inválida — rótulo completo', () => {
  it('deve usar apenas o rótulo do artigo quando o dispositivo de origem é um artigo', () => {
    // Usa 3 artigos para que art1 não vire "Artigo único" após remover art3
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, , art3] = artigos;

    const stateComRemissoes: State = {
      ...state,
      remissoes: { [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art3.id, targetUuid: art3.uuid }] },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art3.uuid } });

    const alerta = newState.ui?.alertas?.find((a: any) => a.id === `alerta-remissao-invalida-${art1.uuid}`);
    expect(alerta).to.exist;
    // "Art. 1º." → "Art. 1º" (sem ponto final)
    expect(alerta!.mensagem).to.include('Art. 1º');
    expect(alerta!.mensagem).to.not.include('Art. 1º.');
  });

  it('deve exibir caminho completo "Art. Xº, inciso Y" quando o dispositivo de origem é um inciso', () => {
    // Monta articulação com 3 artigos + inciso no caput do art. 1
    // 3 artigos evitam que art1 vire "Artigo único" após remover o alvo
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, 'Artigo');
    const art2 = criaDispositivo(articulacao, 'Artigo');
    const art3 = criaDispositivo(articulacao, 'Artigo');
    const inciso = criaDispositivo((art1 as any).caput!, 'Inciso');

    articulacao.renumeraFilhos();
    articulacao.artigos.forEach((a: any) => a.createRotulo(a));
    (art1 as any).caput!.renumeraFilhos();
    inciso.createRotulo(inciso);
    updateIdDispositivoAndFilhos(articulacao);
    [art1, art2, art3, inciso].forEach(marcaAdicionado);

    const state = montaState(articulacao);
    const stateComRemissoes: State = {
      ...state,
      remissoes: { [inciso.uuid!]: [{ refId: 'ref1', targetLexmlId: (art3 as any).id, targetUuid: art3.uuid }] },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art3.uuid } });

    const alerta = newState.ui?.alertas?.find((a: any) => a.id === `alerta-remissao-invalida-${inciso.uuid}`);
    expect(alerta).to.exist;
    // Deve conter o artigo E o inciso, não apenas o rótulo isolado do inciso ("I –")
    expect(alerta!.mensagem).to.include('Art. 1º');
    expect(alerta!.mensagem).to.include('inciso I');
    expect(alerta!.mensagem).to.not.include('I –', 'não deve exibir o rótulo bruto do inciso sem contexto');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Problema 2: Alerta removido do ui.alertas após undo
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção de alerta de remissão inválida no undo', () => {
  it('deve remover o alerta de ui.alertas ao fazer undo da exclusão', () => {
    const { state, artigos } = criaStateComNArtigos(2);
    const [art1, art2] = artigos;

    const stateComRemissoes: State = {
      ...state,
      remissoes: { [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid }] },
    };

    const stateRemovido = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });

    const alertaId = `alerta-remissao-invalida-${art1.uuid}`;
    const alertaAposRemocao = stateRemovido.ui?.alertas?.find((a: any) => a.id === alertaId);
    expect(alertaAposRemocao).to.exist;

    const stateUndo = undo(stateRemovido);

    const alertaAposUndo = stateUndo.ui?.alertas?.find((a: any) => a.id === alertaId);
    expect(alertaAposUndo).to.not.exist;
  });

  it('deve manter outros alertas ao remover apenas o alerta de remissão inválida no undo', () => {
    const { state, artigos } = criaStateComNArtigos(2);
    const [art1, art2] = artigos;

    const alertaOutro = { id: 'alerta-outro', tipo: TipoMensagem.ERROR, mensagem: 'Outro alerta', podeFechar: true };
    const stateComRemissoes: State = {
      ...state,
      remissoes: { [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid }] },
      ui: { events: [], alertas: [alertaOutro] },
    };

    const stateRemovido = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });
    const stateUndo = undo(stateRemovido);

    // Alerta de remissão inválida removido, mas o outro permanece
    const alertaRemissao = stateUndo.ui?.alertas?.find((a: any) => a.id === `alerta-remissao-invalida-${art1.uuid}`);
    const alertaMantifo = stateUndo.ui?.alertas?.find((a: any) => a.id === 'alerta-outro');
    expect(alertaRemissao).to.not.exist;
    expect(alertaMantifo).to.exist;
  });
});
