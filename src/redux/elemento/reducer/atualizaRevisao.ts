import { getRevisoesElemento, isRevisaoDeExclusao, isRevisaoDeRestauracao } from './../util/revisaoUtil';
import { createElemento } from './../../../model/elemento/elementoUtil';
import { DescricaoSituacao } from './../../../model/dispositivo/situacao';
import { Elemento } from '../../../model/elemento';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { formatDateTime } from '../../../util/date-util';
import { State, StateEvent, StateType } from '../../state';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import {
  // findRevisaoByElementoUuid2,
  findRevisaoByElementoUuid,
  isRevisaoDeTransformacao,
  identificarRevisaoElementoPai,
  existeRevisaoParaElementos,
  buildDescricaoRevisaoFromStateType,
  removeAtributosDoElemento,
  atualizaReferenciaElementoAnteriorSeNecessario,
  isRevisaoPrincipal,
  isRevisaoDeMovimentacao,
  findRevisoesByElementoUuid2,
  findRevisoesByElementoLexmlId,
  isRevisaoDeModificacao,
  associarRevisoesAosElementosDosEventos,
} from '../util/revisaoUtil';
import { aceitarRevisaoAction } from '../../../model/lexml/acao/aceitarRevisaoAction';
import { rejeitarRevisaoAction } from '../../../model/lexml/acao/rejeitarRevisaoAction';
import { APLICAR_ALTERACOES_EMENDA } from '../../../model/lexml/acao/aplicarAlteracoesEmenda';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { ATUALIZAR_USUARIO } from '../../../model/lexml/acao/atualizarUsuarioAction';
import { ABRIR_ARTICULACAO } from '../../../model/lexml/acao/openArticulacaoAction';
import { VALIDAR_ARTICULACAO } from '../../../model/lexml/acao/validarArticulacaoAction';
import { getEvento } from '../evento/eventosUtil';
import { TEXTO_OMISSIS } from '../../../model/lexml/conteudo/textoOmissis';
import { SELECIONAR_PAGINA_ARTICULACAO } from '../../../model/lexml/acao/selecionarPaginaArticulacaoAction';

export const atualizaRevisao = (state: State, actionType: any): State => {
  const numElementos = state.ui?.events.map(se => se.elementos).flat().length;
  if ([ABRIR_ARTICULACAO, ATUALIZAR_USUARIO, VALIDAR_ARTICULACAO].includes(actionType) || !state.emRevisao || !actionType || !numElementos) {
    return state;
  } else if ([APLICAR_ALTERACOES_EMENDA, SELECIONAR_PAGINA_ARTICULACAO].includes(actionType)) {
    associarRevisoesAosElementosDosEventos(state);
    return state;
  }

  if (UNDO === actionType && (state.past?.length || 0) < state.numEventosPassadosAntesDaRevisao!) {
    associarRevisoesAosElementosDosEventos(state);
    return state;
  }

  if (REDO === actionType && (state.past?.length || 0) <= state.numEventosPassadosAntesDaRevisao!) {
    associarRevisoesAosElementosDosEventos(state);
    return state;
  }

  if (state.ui?.message?.tipo === TipoMensagem.ERROR) {
    return state;
  }

  let revisoes: Revisao[] = [];
  if ((UNDO !== actionType || !isUndoDeRevisaoAceitaOuRejeitada(state)) && !isAcaoDeRevisaoRejeitada(state)) {
    revisoes.push(...processaEventosDeSupressao(state, actionType));
    revisoes.push(...processaEventosDeModificacao(state, actionType));
    revisoes.push(...processaEventosDeRestauracao(state, actionType));
    // revisoes.push(...processaEventosDeRenumeracao(state, actionType, elementoAntesAcao));

    if (isAcaoMoverOuTransformar(state)) {
      revisoes.push(...processaEventosDeMoverOuTransformar(state, actionType));
    } else {
      revisoes.push(...processaEventosDeInclusao(state, actionType));
      revisoes.push(...processaEventosDeRemocao(state, actionType));
    }
  }
  revisoes = identificarRevisaoElementoPai(state, revisoes);

  if (existeEventoDeInclusaoOuExclusao(state)) {
    atualizarLexmlIdEmElementosDeRevisoes(state);
    atualizarPosicaoDeElementosEmRevisoes(state);
  }

  state.revisoes!.push(...revisoes);

  associarRevisoesAosElementosDosEventos(state);

  adicionarOpcoesAoMenu(state);

  return state;
};

const isUndoDeRevisaoAceitaOuRejeitada = (state: State): boolean => {
  return !!state.future?.length && [StateType.RevisaoAceita, StateType.RevisaoRejeitada].includes(state.future[state.future.length - 1][0].stateType);
};

const isAcaoDeRevisaoRejeitada = (state: State): boolean => !!state.ui?.events.some(ev => ev.stateType === StateType.RevisaoRejeitada);

const processaEventosDeSupressao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoSuprimido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao && revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      revisoesParaRemover.push(revisao);
    } else {
      const d = getDispositivoFromElemento(state.articulacao!, e)!;
      const eAux = revisao?.elementoAntesRevisao || (JSON.parse(JSON.stringify(d.situacao.dispositivoOriginal)) as Elemento);
      result.push(new RevisaoElemento(actionType, StateType.ElementoSuprimido, '', state.usuario!, formatDateTime(new Date()), eAux, JSON.parse(JSON.stringify(e))));
      if (revisao) {
        revisoesParaRemover.push(revisao);
      }
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeModificacao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoModificado);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao) {
      if ((isRevisaoDeModificacao(revisao) || isRevisaoDeRestauracao(revisao)) && revisaoDeElementoComMesmoUuid2RotuloEConteudo(revisao, e)) {
        revisoesParaRemover.push(revisao);
      }
      revisao.elementoAposRevisao = JSON.parse(JSON.stringify(e));
      state.usuario && (revisao.usuario = state.usuario);
      revisao.dataHora = formatDateTime(new Date());
    } else {
      const eAux = getElementoAntesModificacao(state, e);
      // result.push(new RevisaoElemento(actionType, StateType.ElementoModificado, '', state.usuario!, formatDateTime(new Date()), eAux, JSON.parse(JSON.stringify(e))));
      if (!isAjusteTextoOmitido(eAux, e)) {
        result.push(new RevisaoElemento(actionType, StateType.ElementoModificado, '', state.usuario!, formatDateTime(new Date()), eAux, JSON.parse(JSON.stringify(e))));
      }
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const isAjusteTextoOmitido = (eAntesRevisao: Elemento | undefined, eAposRevisao: Elemento): boolean => {
  // O texto omitido do dispositivo original pode possuir um span com a classe texto__omissis, que não deve ser considerado para fins de comparação de modificação.
  return !!(
    eAposRevisao.tipo === eAntesRevisao?.tipo &&
    eAposRevisao.conteudo?.texto?.includes(TEXTO_OMISSIS) &&
    eAntesRevisao?.conteudo?.texto?.includes(TEXTO_OMISSIS) &&
    eAposRevisao.conteudo?.texto?.replace('<span class="texto__omissis">', '').replace('</span>', '') === eAntesRevisao?.conteudo?.texto
  );
};

const processaEventosDeMoverOuTransformar = (state: State, actionType: any): Revisao[] => {
  const incluidos = getElementosFromEventos(getEventos(state, StateType.ElementoIncluido));
  const removidos = getElementosFromEventos(getEventos(state, StateType.ElementoRemovido));

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  const montarNovaRevisao = (eAntesRevisao: Elemento, eAposRevisao: Elemento): RevisaoElemento => {
    const revInclusao = new RevisaoElemento(
      actionType,
      StateType.ElementoIncluido,
      '',
      state.usuario!,
      formatDateTime(new Date()),
      eAntesRevisao ? JSON.parse(JSON.stringify(eAntesRevisao)) : undefined,
      JSON.parse(JSON.stringify(eAposRevisao))
    );

    revInclusao.descricao = buildDescricaoRevisaoFromStateType(revInclusao, eAposRevisao);
    // revExclusao.idRevisaoAssociada = revInclusao.id;
    // revInclusao.idRevisaoAssociada = revExclusao.id;
    // result.push(revExclusao);
    return revInclusao;
  };

  if (existeRevisaoParaElementos(state.revisoes, removidos)) {
    removidos.forEach((e, index) => {
      const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid)!;
      // A revisão pode não existir se houver dispositivo removido após a movimentação em modo de revisão
      // Exemplo: moveu inciso com alíneas, removeu alínea e depois moveu novamente o inciso
      if (!revisao) {
        result.push(montarNovaRevisao(e, incluidos[index]));
      } else if (isRevisaoDeTransformacao(revisao) && revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, incluidos[index])) {
        revisoesParaRemover.push(...findRevisoesByElementoLexmlId(state.revisoes, e.lexmlId));
      } else if (revisaoDeElementoComMesmoUuid2RotuloEConteudo(revisao, incluidos[index]) && revisao.elementoAntesRevisao!.uuid !== e.uuid) {
        revisoesParaRemover.push(...findRevisoesByElementoUuid2(state.revisoes, incluidos[index].uuid2));
      } else {
        state.revisoes = state.revisoes?.filter(r => r.id !== revisao.id);

        // result.push(montarNovaRevisao(revisao.elementoAntesRevisao! as Elemento, incluidos[index]));

        revisao.stateType = StateType.ElementoIncluido;
        revisao.actionType = actionType;
        revisao.dataHora = formatDateTime(new Date());
        revisao.elementoAposRevisao = JSON.parse(JSON.stringify(incluidos[index]));
        removeAtributosDoElemento(revisao.elementoAposRevisao);
        revisao.usuario = state.usuario!;
        revisao.descricao = buildDescricaoRevisaoFromStateType(revisao, incluidos[index]);

        revisao.idRevisaoElementoPai = revisoesParaRemover.find(r => r.id === revisao.idRevisaoElementoPai) ? undefined : revisao.idRevisaoElementoPai;
        revisao.idRevisaoElementoPrincipal = revisoesParaRemover.find(r => r.id === revisao.idRevisaoElementoPrincipal) ? undefined : revisao.idRevisaoElementoPrincipal;

        result.push(revisao);
      }
    });
  } else {
    removidos.forEach((e, index) => result.push(montarNovaRevisao(e, incluidos[index])));
  }

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeInclusao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoIncluido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];
  const elementosIncluidos = getElementosFromEventos(eventos);
  const uuidsElementosIncluidos = elementosIncluidos.map(e => e.uuid);

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      if (!uuidsElementosIncluidos.includes(e.hierarquia?.pai?.uuid)) {
        atualizaReferenciaElementoAnteriorSeNecessario(state.articulacao!, state.revisoes, e, 'inclusao');
      }
      result.push(new RevisaoElemento(actionType, StateType.ElementoIncluido, '', state.usuario!, formatDateTime(new Date()), undefined, JSON.parse(JSON.stringify(e))));
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeRemocao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoRemovido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];
  const elementosRemovidos = getElementosFromEventos(eventos);
  const uuidsElementosRemovidos = elementosRemovidos.map(e => e.uuid);

  elementosRemovidos.forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao && (isRevisaoPrincipal(revisao) || !isRevisaoDeMovimentacao(revisao))) {
      revisoesParaRemover.push(revisao);
    } else {
      if (!uuidsElementosRemovidos.includes(e.hierarquia?.pai?.uuid)) {
        atualizaReferenciaElementoAnteriorSeNecessario(state.articulacao!, state.revisoes, e, 'exclusao');
      }
      const eAux = JSON.parse(JSON.stringify(e)) as Elemento;
      result.push(new RevisaoElemento(actionType, StateType.ElementoRemovido, '', state.usuario!, formatDateTime(new Date()), eAux, { ...eAux, acoesPossiveis: [] }));
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeRestauracao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoRestaurado);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  eventos.forEach(se => {
    const elementoAtual = se.elementos![1];
    const elementoAnterior = se.elementos![0];
    const eAux = elementoAtual || elementoAnterior;

    const revisao = findRevisaoByElementoUuid(state.revisoes, elementoAnterior.uuid);
    if (revisao && revisao.elementoAntesRevisao?.descricaoSituacao === eAux.descricaoSituacao && revisaoDeElementoComMesmoUuid2RotuloEConteudo(revisao, eAux)) {
      revisoesParaRemover.push(revisao);
    } else {
      const d = getDispositivoFromElemento(state.articulacao!, elementoAnterior)!;
      const eAntesRevisao = !elementoAtual ? d.situacao.dispositivoOriginal : elementoAnterior;
      const eAposRevisao = createElemento(d);
      result.push(
        new RevisaoElemento(
          actionType,
          StateType.ElementoRestaurado,
          '',
          state.usuario!,
          formatDateTime(new Date()),
          JSON.parse(JSON.stringify(eAntesRevisao)),
          JSON.parse(JSON.stringify(eAposRevisao))
        )
      );
      if (revisao) {
        revisoesParaRemover.push(revisao);
      }
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const getEventos = (state: State, stateType: StateType): StateEvent[] => {
  return state.ui?.events.filter(se => se.stateType === stateType) || [];
};

const getElementosFromEventos = (eventos: StateEvent[]): Elemento[] => {
  return removeDuplicidades(eventos.map(se => se.elementos || []).flat());
};

const removeDuplicidades = (elementos: Elemento[]): Elemento[] => {
  const map = new Map<number, Elemento>();
  const result: Elemento[] = [];
  elementos.reverse().forEach(e => {
    if (!map.has(e.uuid!)) {
      map.set(e.uuid!, e);
      result.unshift(e);
    }
  });
  return result;
};

const revisaoDeElementoComMesmoLexmlIdRotuloEConteudo = (r: RevisaoElemento, e: Elemento): boolean => {
  return r.elementoAntesRevisao?.lexmlId === e.lexmlId && r.elementoAntesRevisao?.rotulo === e.rotulo && r.elementoAntesRevisao?.conteudo?.texto === e.conteudo?.texto;
};

const revisaoDeElementoComMesmoUuid2RotuloEConteudo = (r: RevisaoElemento, e: Elemento): boolean => {
  return (
    r.elementoAntesRevisao?.uuid2 === e.uuid2 &&
    r.elementoAntesRevisao?.rotulo === e.rotulo &&
    r.elementoAntesRevisao?.conteudo?.texto === e.conteudo?.texto &&
    r.elementoAntesRevisao?.hierarquia?.pai?.lexmlId === e.hierarquia?.pai?.lexmlId // Checa se elementos estão na mesma hierarquia
  );
};

const isAcaoMoverOuTransformar = (state: State): boolean => {
  const incluidos = getEventos(state, StateType.ElementoIncluido);
  const removidos = getEventos(state, StateType.ElementoRemovido);
  return !!incluidos.length && incluidos.length === removidos.length;
};

const getElementoAntesModificacao = (state: State, elemento: Elemento): Elemento | undefined => {
  const eventos = [...state.past!].pop() as any as StateEvent[];
  const modificacoes = eventos.filter(se => se.stateType === StateType.ElementoModificado && se.elementos?.some(e => e.uuid === elemento.uuid));
  const modificacao = modificacoes.pop();
  return modificacao ? JSON.parse(JSON.stringify(modificacao.elementos![0])) : undefined;
};

const adicionarOpcoesAoMenu = (state: State): void => {
  state.ui?.events.forEach(se =>
    se.elementos?.filter(Boolean).forEach(e => {
      if (e.revisao && !(e.revisao as RevisaoElemento).idRevisaoElementoPrincipal) {
        e.acoesPossiveis = se.stateType === StateType.ElementoRemovido ? [] : [...(e.acoesPossiveis || [])];
        !e.acoesPossiveis.includes(aceitarRevisaoAction) && e.acoesPossiveis.push(aceitarRevisaoAction);
        !e.acoesPossiveis.includes(rejeitarRevisaoAction) && e.acoesPossiveis.push(rejeitarRevisaoAction);
      }
    })
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const existeEventoDeInclusaoOuExclusao = (state: State): boolean => {
  const eventos = state.ui?.events || [];
  return eventos.some(se => se.stateType === StateType.ElementoIncluido || se.stateType === StateType.ElementoRemovido);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const atualizarLexmlIdEmElementosDeRevisoes = (state: State): void => {
  let revisoes = getRevisoesElemento(state.revisoes || [])
    .filter(r => r.elementoAposRevisao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO)
    .filter(r => !isRevisaoDeExclusao(r));

  revisoes.forEach(r => {
    const d = getDispositivoFromElemento(state.articulacao!, r.elementoAposRevisao);
    if (d) {
      const e = createElemento(d, false, true);
      r.elementoAposRevisao.lexmlId = d.id;
      r.elementoAposRevisao.hierarquia!.pai!.lexmlId = d.pai!.id;
      r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(e.elementoAnteriorNaSequenciaDeLeitura));

      if (r.elementoAntesRevisao) {
        r.elementoAntesRevisao.lexmlId = d.id;
        r.elementoAntesRevisao.hierarquia!.pai!.lexmlId = d.pai!.id;
        r.elementoAntesRevisao.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(e.elementoAnteriorNaSequenciaDeLeitura));
      }
    }
  });

  revisoes = getRevisoesElemento(state.revisoes || []).filter(r => isRevisaoPrincipal(r) && isRevisaoDeExclusao(r));
  revisoes.forEach(r => {
    const d = getDispositivoFromElemento(state.articulacao!, r.elementoAposRevisao.hierarquia!.pai!)!;
    if (d) {
      r.elementoAposRevisao.hierarquia!.pai!.lexmlId = d.id;
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const atualizarPosicaoDeElementosEmRevisoes = (state: State): void => {
  const revisoes = getRevisoesElemento(state.revisoes || []).filter(r => isRevisaoPrincipal(r) && isRevisaoDeExclusao(r));
  atualizarPosicaoDeElementosEmRevisoesByEvento(revisoes, getEvento(state.ui!.events, StateType.ElementoIncluido));
  atualizarPosicaoDeElementosEmRevisoesByEvento(revisoes, getEvento(state.ui!.events, StateType.ElementoRemovido));
};

const atualizarPosicaoDeElementosEmRevisoesByEvento = (revisoes: RevisaoElemento[] = [], evento: StateEvent | undefined): void => {
  if (!evento) {
    return;
  }
  const fator = evento.stateType === StateType.ElementoIncluido ? 1 : -1;
  const fnCondicaoInclusao = (e: Elemento, posicaoAtual: number): boolean => e.hierarquia!.posicao! <= posicaoAtual;
  const fnCondicaoExclusao = (e: Elemento, posicaoAtual: number): boolean => e.hierarquia!.posicao! < posicaoAtual;
  const fnCondicao2 = evento.stateType === StateType.ElementoIncluido ? fnCondicaoInclusao : fnCondicaoExclusao;
  revisoes.forEach(r => {
    const lexmlIdPai = r.elementoAposRevisao.hierarquia!.pai!.lexmlId;
    const posicaoAtual = r.elementoAposRevisao.hierarquia!.posicao!;
    const deslocamento = evento.elementos!.filter(e => e.hierarquia?.pai?.lexmlId === lexmlIdPai && fnCondicao2(e, posicaoAtual)).length * fator;
    r.elementoAposRevisao.hierarquia!.posicao! += deslocamento;
  });
};
