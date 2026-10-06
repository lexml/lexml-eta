import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { AtualizarTituloDispositivo } from '../../../model/lexml/acao/atualizarTituloDispositivoAction';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { sanitizarTituloDispositivo } from '../../../util/html-util';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const atualizaTituloDispositivo = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(dispositivo, AtualizarTituloDispositivo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível alterar o título do dispositivo.' });
  }

  // Título vazio ('') é um estado válido (com aviso); só "remover" volta a "sem título".
  const novoTitulo = action.remover ? undefined : action.tituloDispositivo === undefined ? dispositivo.tituloDispositivo : sanitizarTituloDispositivo(action.tituloDispositivo);

  if (novoTitulo === dispositivo.tituloDispositivo) {
    state.ui.events = [];
    return state;
  }

  const original = createElemento(dispositivo);
  dispositivo.tituloDispositivo = novoTitulo;

  const eventosUi = new Eventos();
  const elemento = createElemento(dispositivo, true);
  elemento.mensagens = validaDispositivo(dispositivo);

  eventosUi.add(StateType.ElementoModificado, [elemento]);
  eventosUi.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(dispositivo));
  // O menu muda (adicionar vs. editar/remover): precisa ser remontado.
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
