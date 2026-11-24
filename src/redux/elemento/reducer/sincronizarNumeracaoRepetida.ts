import { Alerta } from '../../../model/alerta/alerta';
import { createElementoValidado } from '../../../model/elemento/elementoUtil';
import { getUuidsComNumeracaoRepetida, MENSAGEM_NUMERACAO_REPETIDA } from '../../../model/lexml/numeracao/numeracaoRepetida';
import { isValidacaoNumeracaoFlexivel } from '../../../model/lexml/numeracao/validacaoNumeracao';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { buscarDispositivoPorUuid } from '../../../model/remissao/sincronizarRemissoes';
import { State, StateEvent, StateType } from '../../state';

export const ALERTA_NUMERACAO_REPETIDA = 'alerta-global-numeracao-repetida';

const alertaNumeracaoRepetida = (): Alerta => ({ id: ALERTA_NUMERACAO_REPETIDA, tipo: TipoMensagem.CRITICAL, mensagem: MENSAGEM_NUMERACAO_REPETIDA, podeFechar: false });

/**
 * Recalcula a numeração repetida depois de toda ação (modo flexível): atualiza o alerta global e revalida os
 * dispositivos que entraram ou saíram do conjunto, inclusive os que a ação não tocou (ex.: a outra ocorrência).
 */
export const sincronizarNumeracaoRepetida = (state: State, anteriores: number[] | undefined, actionType: string): State => {
  const temAlerta = !!state.ui?.alertas?.some(a => a.id === ALERTA_NUMERACAO_REPETIDA);
  const atuais = isValidacaoNumeracaoFlexivel() && state.articulacao ? [...getUuidsComNumeracaoRepetida(state.articulacao)] : [];

  state.numeracaoRepetida = atuais;
  if (!atuais.length && !temAlerta && !anteriores?.length) {
    return state;
  }

  const alertas = state.ui?.alertas ?? [];
  const novosAlertas =
    atuais.length && !temAlerta ? [...alertas, alertaNumeracaoRepetida()] : !atuais.length && temAlerta ? alertas.filter(a => a.id !== ALERTA_NUMERACAO_REPETIDA) : alertas;

  // Na abertura as linhas ainda não existem; eventos iniciados por AtualizacaoAlertas não são processados pelo editor.
  const events = state.ui?.events ?? [];
  const processaEventos = actionType !== 'ABRIR_ARTICULACAO' && events[0]?.stateType !== StateType.AtualizacaoAlertas;
  const mudaram = processaEventos && state.articulacao ? [...atuais.filter(u => !anteriores?.includes(u)), ...(anteriores ?? []).filter(u => !atuais.includes(u))] : [];
  const revalidados: StateEvent[] = [];
  for (const uuid of mudaram) {
    const dispositivo = buscarDispositivoPorUuid(state.articulacao!, uuid);
    dispositivo && revalidados.push({ stateType: StateType.ElementoValidado, elementos: [createElementoValidado(dispositivo)] });
  }

  if (novosAlertas !== alertas || revalidados.length) {
    state.ui = { ...state.ui, events: [...events, ...revalidados], alertas: novosAlertas };
  }
  return state;
};
