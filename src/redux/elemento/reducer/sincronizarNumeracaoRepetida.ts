import { Alerta } from '../../../model/alerta/alerta';
import { createElementoValidado } from '../../../model/elemento/elementoUtil';
import { getIrregularidadesNumeracao, MENSAGEM_NUMERACAO_IRREGULAR, NumeracaoIrregular } from '../../../model/lexml/numeracao/numeracaoRepetida';
import { isValidacaoNumeracaoFlexivel } from '../../../model/lexml/numeracao/validacaoNumeracao';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { buscarDispositivoPorUuid } from '../../../model/remissao/sincronizarRemissoes';
import { State, StateEvent, StateType } from '../../state';

export const ALERTA_NUMERACAO_IRREGULAR = 'alerta-global-numeracao-irregular';

const alertaNumeracaoIrregular = (): Alerta => ({ id: ALERTA_NUMERACAO_IRREGULAR, tipo: TipoMensagem.CRITICAL, mensagem: MENSAGEM_NUMERACAO_IRREGULAR, podeFechar: false });

/**
 * Recalcula a numeração irregular (com complemento, com lacuna ou fora de ordem nos dois modos; repetida só no flexível) depois de toda ação:
 * atualiza o alerta global e revalida os dispositivos que entraram, saíram ou mudaram de tipo, inclusive os que a ação não tocou.
 */
export const sincronizarNumeracaoIrregular = (state: State, anteriores: Record<number, NumeracaoIrregular> | undefined, actionType: string): State => {
  const temAlerta = !!state.ui?.alertas?.some(a => a.id === ALERTA_NUMERACAO_IRREGULAR);
  const flexivel = isValidacaoNumeracaoFlexivel();
  const atuais = new Map<number, NumeracaoIrregular>();
  // A repetição só é avisada no modo flexível; os demais casos, nos dois modos.
  state.articulacao && getIrregularidadesNumeracao(state.articulacao).forEach((tipo, uuid) => (flexivel || tipo !== 'repetida') && atuais.set(uuid, tipo));
  const anteriorDe = anteriores ?? {};

  state.numeracaoIrregular = {};
  atuais.forEach((tipo, uuid) => (state.numeracaoIrregular![uuid] = tipo));
  if (!atuais.size && !temAlerta && !Object.keys(anteriorDe).length) {
    return state;
  }

  const alertas = state.ui?.alertas ?? [];
  const novosAlertas =
    atuais.size && !temAlerta ? [...alertas, alertaNumeracaoIrregular()] : !atuais.size && temAlerta ? alertas.filter(a => a.id !== ALERTA_NUMERACAO_IRREGULAR) : alertas;

  // Na abertura as linhas ainda não existem; eventos iniciados por AtualizacaoAlertas não são processados pelo editor.
  const events = state.ui?.events ?? [];
  const processaEventos = actionType !== 'ABRIR_ARTICULACAO' && events[0]?.stateType !== StateType.AtualizacaoAlertas;
  const mudaram = processaEventos && state.articulacao ? [...new Set([...atuais.keys(), ...Object.keys(anteriorDe).map(Number)])].filter(u => atuais.get(u) !== anteriorDe[u]) : [];
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
