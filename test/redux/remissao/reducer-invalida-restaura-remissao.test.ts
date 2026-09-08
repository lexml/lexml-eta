import { expect } from '@open-wc/testing';
import { State, StateType } from '../../../src/redux/state';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { adicionarArtigoAntes } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

describe('Invalidação e Restauração de Remissões', () => {
  let state: State;

  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
  });

  describe('RemissaoInvalidada', () => {
    it('deve emitir evento RemissaoInvalidada quando remove dispositivo', () => {
      const artigo2 = state.articulacao!.filhos[1];
      const action = { atual: { uuid: artigo2.uuid } };

      const newState = removeElemento(state, action);

      const eventoRemissaoInvalidada = newState.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      expect(eventoRemissaoInvalidada).to.exist;
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.lexmlId).to.equal('art2');
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.uuid).to.equal(artigo2.uuid);
    });

    it('deve incluir lexmlId e uuid no evento RemissaoInvalidada', () => {
      const artigo1 = state.articulacao!.filhos[0];
      const action = { atual: { uuid: artigo1.uuid } };

      const newState = removeElemento(state, action);

      const eventoRemissaoInvalidada = newState.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      expect(eventoRemissaoInvalidada).to.exist;
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao).to.exist;
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.lexmlId).to.be.a('string');
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.uuid).to.be.a('number');
    });

    it('não deve emitir evento RemissaoInvalidada se dispositivo não tem id', () => {
      // Cria um dispositivo sem id (caso hipotético)
      const artigo3 = state.articulacao!.filhos[2];
      delete (artigo3 as any).id;

      const action = { atual: { uuid: artigo3.uuid } };
      const newState = removeElemento(state, action);

      const eventoRemissaoInvalidada = newState.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      expect(eventoRemissaoInvalidada).to.not.exist;
    });
  });

  describe('RemissaoRestaurada', () => {
    it('deve emitir evento RemissaoRestaurada quando faz undo de remoção', () => {
      const artigo2 = state.articulacao!.filhos[1];
      const action = { atual: { uuid: artigo2.uuid } };

      // Remove o dispositivo
      const stateRemoved = removeElemento(state, action);

      // Faz undo da remoção
      const stateUndo = undo(stateRemoved);

      const eventoRemissaoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);

      expect(eventoRemissaoRestaurada).to.exist;
      expect(eventoRemissaoRestaurada?.remissaoInvalidacao?.lexmlId).to.equal('art2');
      expect(eventoRemissaoRestaurada?.remissaoInvalidacao?.uuid).to.equal(artigo2.uuid);
    });

    it('deve restaurar remissão com mesmo lexmlId e uuid da invalidação', () => {
      const artigo1 = state.articulacao!.filhos[0];
      const action = { atual: { uuid: artigo1.uuid } };

      const stateRemoved = removeElemento(state, action);
      const eventoInvalidada = stateRemoved.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      const stateUndo = undo(stateRemoved);
      const eventoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);

      expect(eventoRestaurada).to.exist;
      expect(eventoRestaurada?.remissaoInvalidacao?.lexmlId).to.equal(eventoInvalidada?.remissaoInvalidacao?.lexmlId);
      expect(eventoRestaurada?.remissaoInvalidacao?.uuid).to.equal(eventoInvalidada?.remissaoInvalidacao?.uuid);
    });

    it('não deve emitir evento RemissaoRestaurada se não havia RemissaoInvalidada', () => {
      // Cria um estado sem evento de invalidação no passado
      const artigo3 = state.articulacao!.filhos[2];

      // Simula um estado que não tem RemissaoInvalidada no past
      const stateSimulado = {
        ...state,
        past: [
          [
            {
              stateType: StateType.ElementoIncluido,
              elementos: [{ uuid: artigo3.uuid }],
            },
          ],
        ],
      } as any;

      const stateUndo = undo(stateSimulado);

      const eventoRemissaoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);

      expect(eventoRemissaoRestaurada).to.not.exist;
    });
  });

  describe('Fluxo completo: remover -> undo', () => {
    it('deve invalidar e restaurar remissões no fluxo completo', () => {
      const artigo2 = state.articulacao!.filhos[1];
      const lexmlIdOriginal = artigo2.id;
      const uuidOriginal = artigo2.uuid;

      // Passo 1: Remove dispositivo
      const stateRemoved = removeElemento(state, { atual: { uuid: uuidOriginal } });

      const eventoInvalidada = stateRemoved.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);
      expect(eventoInvalidada).to.exist;
      expect(eventoInvalidada?.remissaoInvalidacao?.lexmlId).to.equal(lexmlIdOriginal);

      // Passo 2: Faz undo (restaura dispositivo)
      const stateUndo = undo(stateRemoved);

      const eventoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);
      expect(eventoRestaurada).to.exist;
      expect(eventoRestaurada?.remissaoInvalidacao?.lexmlId).to.equal(lexmlIdOriginal);
      expect(eventoRestaurada?.remissaoInvalidacao?.uuid).to.equal(uuidOriginal);
    });
  });

  // Fase 5 do plano de simplificação (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md): o mecanismo de
  // RemissaoRenumerada (evento emitido pelos reducers, invertido manualmente em undo.ts) foi
  // substituído por sincronizarRemissoesPosAcao — que recalcula o registro a partir do estado ATUAL
  // da árvore, e roda de novo automaticamente após UNDO/REDO (ambos estão na lista de ações
  // estruturais). Não há mais "evento a inverter": o recálculo pós-undo já reflete a árvore restaurada.
  describe('Atualização de remissão sobrevive a undo (registro reflete a árvore atual, não um evento invertido)', () => {
    it('undo de remoção que causou renumeração restaura targetLexmlId/textoRef ao valor original', () => {
      const [art1, art2, art3] = state.articulacao!.artigos;

      // art3 referencia art2; ao remover art1, art2 vira art1 (a entrada deve refletir isso);
      // ao desfazer, art2 volta a ser art2 e a entrada deve refletir isso de novo.
      const prefixo = 'Conforme o ';
      art3.texto = `${prefixo}art. 2º, aplica-se o disposto.`;
      state.remissoes = {
        [art3.uuid!]: [
          {
            refId: 'ref_teste',
            sourceUuid: art3.uuid,
            targetUuid: art2.uuid,
            targetLexmlId: art2.id,
            textoRef: 'art. 2º',
            inicio: prefixo.length,
          },
        ],
      };

      const elementoArt1 = createElemento(art1, true);
      const stateRemoved = elementoReducer(state, removerElementoAction.execute(elementoArt1, elementoArt1));

      expect(art2.id).to.equal('art1');
      expect(stateRemoved.remissoes![art3.uuid!][0].targetLexmlId).to.equal('art1');
      expect(stateRemoved.remissoes![art3.uuid!][0].textoRef).to.equal('art. 1º');

      // Vai por elementoReducer (não undo() direto) — sincronizarRemissoesPosAcao só roda no hook
      // de pós-processamento do reducer, não seria acionado chamando o reducer de undo isoladamente.
      const stateUndo = elementoReducer(stateRemoved, { type: UNDO });

      // undo restaura a árvore a partir de um snapshot em `past` — os objetos são outros (mesmo
      // uuid, referência diferente), então relocalizamos pelo uuid em vez de reusar `art2`.
      const art2AposUndo = stateUndo.articulacao!.artigos.find(a => a.uuid === art2.uuid);
      expect(art2AposUndo?.id).to.equal('art2');

      const entradaAposUndo = stateUndo.remissoes![art3.uuid!][0];
      expect(entradaAposUndo.targetLexmlId).to.equal('art2');
      expect(entradaAposUndo.textoRef).to.equal('art. 2º');
    });
  });

  // M2 — RemissaoInvalidada deve capturar lexmlId antes da renumeração
  describe('RemissaoInvalidada: lexmlId capturado antes da renumeração (M2)', () => {
    it('ao remover art1, lexmlId da invalidação deve ser "art1" — não o "art1" que art2 assume após renumeração', () => {
      const art1 = state.articulacao!.filhos[0];
      const uuidArt1 = art1.uuid;

      const stateRemoved = removeElemento(state, { atual: { uuid: uuidArt1 } });

      const eventoInvalidada = stateRemoved.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);
      expect(eventoInvalidada?.remissaoInvalidacao?.lexmlId).to.equal('art1');

      // O uuid deve corresponder ao artigo removido, que não existe mais na articulação
      const dispositivosRestantes = stateRemoved.articulacao!.filhos;
      expect(dispositivosRestantes.find((d: any) => d.uuid === uuidArt1)).to.be.undefined;
    });

    it('ao remover art2, lexmlId da invalidação deve ser "art2" — não "art1" (art3 assume art2 após renumeração)', () => {
      const art2 = state.articulacao!.filhos[1];
      const uuidArt2 = art2.uuid;

      const stateRemoved = removeElemento(state, { atual: { uuid: uuidArt2 } });

      const eventoInvalidada = stateRemoved.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);
      expect(eventoInvalidada?.remissaoInvalidacao?.lexmlId).to.equal('art2');
      expect(eventoInvalidada?.remissaoInvalidacao?.uuid).to.equal(uuidArt2);

      // Após remoção, art3 assume id 'art2' — mas o uuid do dispositivo restante é diferente
      const novoArt2 = stateRemoved.articulacao!.filhos.find((d: any) => d.id === 'art2');
      expect(novoArt2?.uuid).to.not.equal(uuidArt2, 'o novo art2 é o antigo art3, com uuid diferente');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regressão: remissão válida não deve ser invalidada após inserção + exclusão
// Cenário: Art. 3 → Art. 2 | insere novo Art. 2 (antigo Art. 2 vira Art. 3,
// Art. 3 vira Art. 4) | exclui novo Art. 2 → Art. 3 volta a existir, remissão
// do Art. 3 (antigo Art. 4) para Art. 2 (antigo Art. 3) continua válida.
// ─────────────────────────────────────────────────────────────────────────────
describe('Regressão: remissão válida não deve ser invalidada por exclusão de art. intercalado', () => {
  it('não deve marcar como inválida remissão cujo targetUuid não é o dispositivo excluído', () => {
    // Monta: Art. 1, Art. 2 (uuid=uuidArt2), Art. 3 (uuid=uuidArt3)
    const { state: estadoInicial, artigos } = criaStateComNArtigos(3);
    const art2Original = artigos[1]; // uuid estável mesmo após renumeração
    const art3Original = artigos[2]; // contém a remissão para Art. 2

    // Simula o registry de remissões: Art. 3 aponta para Art. 2 (pelo lexmlId pré-inserção)
    const estadoComRemissao: State = {
      ...estadoInicial,
      remissoes: {
        [art3Original.uuid!]: [{ refId: 'ref-art2', targetLexmlId: art2Original.id, targetUuid: art2Original.uuid }],
      },
    };

    // Insere novo Art. 2 antes do Art. 2 existente
    // Resultado: Art. 1 | Novo Art. 2 | Art. 3 (antigo Art. 2) | Art. 4 (antigo Art. 3)
    // adicionaElemento emite RemissaoRenumerada mas NÃO atualiza state.remissoes.
    const elementoArt2 = createElemento(art2Original, true);
    const acaoAdicionar = adicionarArtigoAntes.execute(elementoArt2);
    const estadoAposInsercao = elementoReducer(estadoComRemissao, acaoAdicionar);

    // Localiza o novo Art. 2 recém-inserido (lexmlId="art2" na articulação pós-inserção)
    const novoArt2 = estadoAposInsercao.articulacao!.artigos.find((a: any) => a.id === 'art2');
    expect(novoArt2).to.exist;
    expect(novoArt2!.uuid).to.not.equal(art2Original.uuid, 'novo art2 deve ter uuid distinto do original');

    // Remove o recém-criado Art. 2
    const estadoAposRemocao = removeElemento(estadoAposInsercao, { atual: { uuid: novoArt2!.uuid } });

    // A remissão em art3Original (agora Art. 3 novamente) ainda aponta para art2Original (agora Art. 2 novamente).
    // Deve permanecer válida — targetUuid é o art2Original, não o novoArt2.
    const remissoes = (estadoAposRemocao.remissoes as any)?.[art3Original.uuid!];
    expect(remissoes).to.exist;
    expect(remissoes[0].valida).to.not.equal(false, 'remissão para dispositivo existente não deve ser marcada como inválida');
  });

  it('não deve emitir ElementoValidado com mensagem de remissão inválida para o dispositivo de origem', () => {
    const { state: estadoInicial, artigos } = criaStateComNArtigos(3);
    const art2Original = artigos[1];
    const art3Original = artigos[2];

    const estadoComRemissao: State = {
      ...estadoInicial,
      remissoes: {
        [art3Original.uuid!]: [{ refId: 'ref-art2', targetLexmlId: art2Original.id, targetUuid: art2Original.uuid }],
      },
    };

    const elementoArt2 = createElemento(art2Original, true);
    const acaoAdicionar = adicionarArtigoAntes.execute(elementoArt2);
    const estadoAposInsercao = elementoReducer(estadoComRemissao, acaoAdicionar);

    const novoArt2 = estadoAposInsercao.articulacao!.artigos.find((a: any) => a.id === 'art2');
    const estadoAposRemocao = removeElemento(estadoAposInsercao, { atual: { uuid: novoArt2!.uuid } });

    // Não deve haver ElementoValidado com mensagem de remissão inválida para art3Original
    const eventosValidado = estadoAposRemocao.ui?.events.filter(
      (ev: any) => ev.stateType === StateType.ElementoValidado && ev.elementos?.some((el: any) => el.uuid === art3Original.uuid)
    );
    const temMensagemInvalida = eventosValidado?.some((ev: any) => ev.elementos?.some((el: any) => el.mensagensValidacao?.some((m: any) => m.descricao?.includes('excluído'))));
    expect(temMensagemInvalida).to.equal(false, 'não deve emitir alerta de remissão inválida para dispositivo cujo alvo ainda existe');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug fix (Etapa 1): state.remissoes preservado + marcação valida:false
// ─────────────────────────────────────────────────────────────────────────────
describe('state.remissoes após removeElemento (Etapa 1)', () => {
  it('deve preservar state.remissoes após remover dispositivo', () => {
    const { state: s, artigos } = criaStateComNArtigos(3);
    const stateComRemissoes = {
      ...s,
      remissoes: {
        [artigos[0].uuid!]: [{ refId: 'ref1', targetLexmlId: 'art3', targetUuid: artigos[2].uuid }],
      },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: artigos[1].uuid } });

    expect(newState.remissoes).to.exist;
    const entrada = (newState.remissoes as any)[artigos[0].uuid!];
    expect(entrada).to.have.length(1);
    expect(entrada[0].targetLexmlId).to.equal('art3');
  });

  it('deve marcar como valida:false a remissão cujo targetLexmlId é o id do dispositivo removido', () => {
    const { state: s, artigos } = criaStateComNArtigos(3);
    const art1 = artigos[0];
    const art2 = artigos[1];
    const lexmlIdArt2 = art2.id; // 'art2' antes da remoção

    const stateComRemissoes = {
      ...s,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref1', targetLexmlId: lexmlIdArt2, targetUuid: art2.uuid }],
      },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });

    const remissoes = (newState.remissoes as any)[art1.uuid!];
    expect(remissoes).to.have.length(1);
    expect(remissoes[0].valida).to.equal(false, 'remissão apontando para dispositivo removido deve ter valida:false');
  });

  it('não deve afetar entradas cujo targetLexmlId é diferente do dispositivo removido', () => {
    const { state: s, artigos } = criaStateComNArtigos(3);
    const art1 = artigos[0];
    const art2 = artigos[1];
    const art3 = artigos[2];

    // art1 aponta para art3 (não removido) e para art2 (removido)
    const stateComRemissoes = {
      ...s,
      remissoes: {
        [art1.uuid!]: [
          { refId: 'ref-art3', targetLexmlId: art3.id, targetUuid: art3.uuid },
          { refId: 'ref-art2', targetLexmlId: art2.id, targetUuid: art2.uuid },
        ],
      },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art2.uuid } });

    const remissoes = (newState.remissoes as any)[art1.uuid!];
    expect(remissoes).to.have.length(2);

    const refArt3 = remissoes.find((r: any) => r.refId === 'ref-art3');
    const refArt2 = remissoes.find((r: any) => r.refId === 'ref-art2');

    expect(refArt3.valida).to.not.equal(false, 'remissão para art3 não deve ser afetada');
    expect(refArt2.valida).to.equal(false, 'remissão para art2 removido deve ser marcada');
  });

  it('deve marcar valida:false em múltiplos dispositivos de origem que apontam para o mesmo destino removido', () => {
    const { state: s, artigos } = criaStateComNArtigos(3);
    const art1 = artigos[0];
    const art2 = artigos[1];
    const art3 = artigos[2];
    const lexmlIdArt1 = art1.id; // 'art1'

    // art2 e art3 ambos apontam para art1
    const stateComRemissoes = {
      ...s,
      remissoes: {
        [art2.uuid!]: [{ refId: 'ref-a', targetLexmlId: lexmlIdArt1, targetUuid: art1.uuid }],
        [art3.uuid!]: [{ refId: 'ref-b', targetLexmlId: lexmlIdArt1, targetUuid: art1.uuid }],
      },
    };

    const newState = removeElemento(stateComRemissoes, { atual: { uuid: art1.uuid } });

    const remissoesArt2 = (newState.remissoes as any)[art2.uuid!];
    const remissoesArt3 = (newState.remissoes as any)[art3.uuid!];

    expect(remissoesArt2[0].valida).to.equal(false, 'origem art2 deve ter remissão marcada como inválida');
    expect(remissoesArt3[0].valida).to.equal(false, 'origem art3 deve ter remissão marcada como inválida');
  });

  it('não deve lançar erro quando state.remissoes está vazio e um dispositivo é removido', () => {
    const { state: s, artigos } = criaStateComNArtigos(3);
    const stateVazio = { ...s, remissoes: {} };

    expect(() => removeElemento(stateVazio, { atual: { uuid: artigos[1].uuid } })).to.not.throw();

    const newState = removeElemento(stateVazio, { atual: { uuid: artigos[1].uuid } });
    expect(newState.remissoes).to.exist;
  });
});
