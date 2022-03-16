import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { buildHtmlLink } from '../../../model/lexml/documento/urnUtil';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';

export const atualizaReferenciaElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  const urnNova = action.atual.norma;
  const urnAnterior = dispositivo?.alteracoes!.base || '';

  if (dispositivo === undefined || !dispositivo.alteracoes || urnAnterior === urnNova) {
    state.ui = [];
    return state;
  }

  const original = createElemento(dispositivo);

  dispositivo.alteracoes!.base = urnNova;

  const regex = new RegExp(`<a.+href=.${urnAnterior}.*?>.*?</a>`, 'ig');
  dispositivo.texto = dispositivo.texto.replace(regex, buildHtmlLink(urnNova));

  if (dispositivo.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
    dispositivo.situacao = new DispositivoModificado(original);
  }

  const eventosUi = new Eventos();

  const elemento = createElemento(dispositivo, true);
  elemento.mensagens = validaDispositivo(dispositivo);

  eventosUi.add(StateType.ElementoValidado, [elemento]);
  eventosUi.add(StateType.ElementoModificado, [elemento]);
  eventosUi.add(StateType.SituacaoElementoModificada, [elemento]);

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, buildUpdateEvent(dispositivo, original)),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventosUi.build(),
    },
  };
};
