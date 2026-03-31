import { expect } from '@open-wc/testing';
import { State, StateType } from '../../../src/redux/state';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { removerRemissaoInvalida } from '../../../src/redux/elemento/reducer/removerRemissaoInvalida';
import { atualizaTextoElemento } from '../../../src/redux/elemento/reducer/atualizaTextoElemento';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { TipoMensagem } from '../../../src/model/lexml/util/mensagem';
import { RemissaoInternaValue } from '../../../src/model/remissao';

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
  it('adicionaRemissaoInterna deve emitir ElementoValidado com mensagem quando há entradas inválidas preservadas', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    // Estado com remissão inválida (destino excluído)
    const stateComInvalida: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: art2.id, targetUuid: art2.uuid, valida: false }],
      },
    };

    // adicionaRemissaoInterna re-detecta referências; art2 não existe mais → 0 novas detecções
    // Mas oldInvalidas.length > 0 → deve emitir ElementoValidado com mensagem
    const elementoArt1 = createElemento(art1, true);
    const newState = adicionaRemissaoInterna(stateComInvalida, { atual: elementoArt1 });

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

    // Simula dispatch 3: re-detecção de remissões (art2 não existe → 0 novas, mas oldInvalidas > 0)
    const elementoArt3Atualizado = createElemento(art3, true);
    const newState = adicionaRemissaoInterna(state3, { atual: elementoArt3Atualizado });

    // A mensagem de remissão inválida deve estar no ElementoValidado emitido por adicionaRemissaoInterna
    const eventosComRemissao = eventosComMensagemRemissao(newState.ui!.events);
    expect(eventosComRemissao).to.have.length.greaterThan(0, 'ElementoValidado deve conter a mensagem de remissão inválida');
    const uuidsAfetados = eventosComRemissao.flatMap((ev: any) => ev.elementos!.map((el: any) => el.uuid));
    expect(uuidsAfetados).to.include(art3.uuid);
  });

  // ─────────────────────────────────────────────────────────────
  // fluxo real do editor — 3 dispatches sequenciais ao digitar texto
  //
  // Simula o que editor.component.ts:atualizarTextoElemento faz:
  //   1. dispatch ATUALIZAR_TEXTO_ELEMENTO
  //   2. dispatch REMOVER_REMISSAO_INVALIDA (com remissões restantes do DOM)
  //   3. dispatch ADICIONAR_REMISSAO_INTERNA
  //
  // O bug: após o 3o dispatch, a mensagem de remissão inválida SOME
  // porque ADICIONAR_REMISSAO_INTERNA emite apenas AtualizaRemissaoInterna
  // — sem ElementoValidado com a mensagem de remissão inválida.
  // ─────────────────────────────────────────────────────────────
  it('deve manter mensagem de remissão inválida após fluxo completo de 3 dispatches ao digitar texto', () => {
    const { state: state0, artigos } = criaStateComNArtigos(3);
    const [art2, art3] = artigos;

    // art3 tem remissão automática para art2
    art3.texto = 'conforme o art. 2.';
    const elementoArt3 = createElemento(art3, true);
    const state1 = adicionaRemissaoInterna(state0, { atual: elementoArt3 });
    const remissaoArt3 = (state1.remissoes as any)[art3.uuid!];
    expect(remissaoArt3).to.have.length.greaterThan(0, 'pré-condição: remissão detectada');

    // Remove art2 → marca remissão de art3 como invalida
    const state2 = removeElemento(state1, { atual: { uuid: art2.uuid } });
    const remissaoAposRemocao = (state2.remissoes as any)[art3.uuid!];
    expect(remissaoAposRemocao?.some((r: any) => r.valida === false)).to.equal(true, 'pré-condição: valida:false após remoção');

    // ── Passo 1: ATUALIZAR_TEXTO_ELEMENTO (usuário digita texto no art3) ──
    const state3 = atualizaTextoElemento(state2, {
      atual: {
        uuid: art3.uuid,
        conteudo: { texto: 'conforme o art. 2. Texto adicional.' },
      },
    });

    // Passo 1 não emite mensagem de remissão (responsabilidade do passo 3).
    // Verifica apenas que state.remissoes preserva valida:false.
    expect((state3.remissoes as any)[art3.uuid!].some((r: any) => r.valida === false)).to.equal(true, 'após passo 1: valida:false persiste');

    // ── Passo 2: REMOVER_REMISSAO_INVALIDA (link ainda está no DOM → nenhuma inválida removida) ──
    // Simula remissaoModule.getRemissoes() — o link inválido ainda existe no DOM
    const remissoesRestantesNoDom: RemissaoInternaValue[] = (state3.remissoes as any)[art3.uuid!];
    const state4 = removerRemissaoInvalida(state3, {
      sourceUuid: art3.uuid,
      remissoesRestantes: remissoesRestantesNoDom,
    });

    // O link inválido ainda está no DOM → nenhuma foi removida → early return
    // state4 deve manter a mensagem
    expect((state4.remissoes as any)[art3.uuid!].some((r: any) => r.valida === false)).to.equal(true, 'após passo 2: valida:false persiste');

    // ── Passo 3: ADICIONAR_REMISSAO_INTERNA (re-detecção) ──
    // O texto ainda contém "art. 2" — mas art2 foi removido, então detecção NÃO encontra destino
    // No entanto, o link inválido permanece no Quill como blot (não é removido pela detecção)
    const elementoArt3Atualizado = createElemento(art3, true);
    const state5 = adicionaRemissaoInterna(state4, { atual: elementoArt3Atualizado });

    // ── Verificação final: a mensagem deve persistir ──
    // BUG ESPERADO: state5.ui.events contém apenas AtualizaRemissaoInterna,
    // sem ElementoValidado com mensagem de remissão inválida.
    // O reducer anterior (passo 1) emitiu a mensagem, mas o passo 3
    // sobrescreve state.ui.events sem incluí-la.
    const eventosAposPasso3 = eventosComMensagemRemissao(state5.ui!.events);
    expect(eventosAposPasso3).to.have.length.greaterThan(0, 'após passo 3: mensagem de remissão DEVE persistir');

    // Também verifica que state.remissoes ainda tem valida:false
    expect((state5.remissoes as any)[art3.uuid!].some((r: any) => r.valida === false)).to.equal(true, 'após passo 3: valida:false DEVE persistir no registry');
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
