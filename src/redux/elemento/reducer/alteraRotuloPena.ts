import { isPena } from '../../../model/dispositivo/tipo';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { AlterarRotuloPena } from '../../../model/lexml/acao/penaAction';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { normalizaRotuloPena } from '../../../model/lexml/numeracao/rotuloPena';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const alteraRotuloPena = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined || !isPena(dispositivo) || action.rotulo === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(dispositivo, AlterarRotuloPena)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível alterar o rótulo da pena.' });
  }

  const novoRotulo = normalizaRotuloPena(action.rotulo);

  if (novoRotulo === dispositivo.rotulo) {
    state.ui.events = [];
    return state;
  }

  const original = createElemento(dispositivo);
  dispositivo.rotulo = novoRotulo;

  const eventosUi = new Eventos();
  const elemento = createElemento(dispositivo, true);
  elemento.mensagens = validaDispositivo(dispositivo);

  eventosUi.add(StateType.ElementoModificado, [elemento]);
  eventosUi.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(dispositivo));
  // O rótulo é desenhado a partir de ElementoSelecionado, como o título.
  eventosUi.eventos.push({ stateType: StateType.ElementoSelecionado, elementos: [elemento] });

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, buildUpdateEvent(dispositivo, original)),
    present: buildEventoAtualizacaoElemento(dispositivo).build(),
    future: [],
    ui: {
      events: eventosUi.build(),
      alertas: state.ui?.alertas,
    },
    remissoes: state.remissoes,
  };
};
