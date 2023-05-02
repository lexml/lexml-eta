import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { TEXTO_OMISSIS } from '../../../model/lexml/conteudo/textoOmissis';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoOriginal } from '../../../model/lexml/situacao/dispositivoOriginal';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';

export const AdicionarTextoOmissis = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);
  const dispositivoOriginalNovamente = dispositivo && dispositivo?.situacao.dispositivoOriginal?.conteudo?.texto === TEXTO_OMISSIS;

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  dispositivo.texto = TEXTO_OMISSIS;

  const original = createElemento(dispositivo);

  if (dispositivoOriginalNovamente) {
    dispositivo.situacao = new DispositivoOriginal();
  } else if (dispositivo.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
    dispositivo.situacao = new DispositivoModificado(original);
  }

  const eventosUi = new Eventos();

  const elemento = createElemento(dispositivo, true);
  elemento.mensagens = validaDispositivo(dispositivo);

  eventosUi.add(StateType.ElementoModificado, [elemento]);
  eventosUi.add(StateType.SituacaoElementoModificada, [elemento]);
  eventosUi.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(dispositivo));

  const eventos = buildEventoAtualizacaoElemento(dispositivo);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, buildUpdateEvent(dispositivo, original)),
    present: eventos.build(),
    future: [],
    ui: {
      events: eventosUi.build(),
      alertas: state.ui?.alertas,
    },
  };
};
