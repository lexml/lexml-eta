import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { isCaput } from '../../../model/dispositivo/tipo';
import { findDispositivoByUuid } from '../../../model/lexml/hierarquia/hierarquiaUtil';

export const redirecionaRemissao = (state: any, action: any): State => {
  const uuid = action.uuid;

  if (uuid === undefined) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  // incluiCaput=true: caput não está em artigo.filhos, apenas em artigo.caput
  const dispositivo = findDispositivoByUuid(state.articulacao, uuid, true);

  if (!dispositivo) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  // Fix: Usa o artigo pai no getLinhaPorId, pois o caput não possui container DOM isolado.
  const dispositivoNavegacao = isCaput(dispositivo) && dispositivo.pai ? dispositivo.pai : dispositivo;

  const elemento = createElemento(dispositivoNavegacao, true);
  const eventosUi = new Eventos();

  eventosUi.add(StateType.RemissaoRedirecionar, [elemento]);
  eventosUi.add(StateType.ElementoSelecionado, [elemento]);

  return {
    ...state,
    ui: { ...state.ui, events: eventosUi.build() },
  };
};
