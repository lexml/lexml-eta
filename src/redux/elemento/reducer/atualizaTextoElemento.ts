import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { normalizaSeForOmissis } from '../../../model/lexml/conteudo/conteudoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';

const houveAlteracaoNoTextoAposAcao = (texto: string, action: any): boolean => {
  return action.atual?.conteudo?.texto !== texto;
};

export const atualizaTextoElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined || dispositivo.texto === action.atual.conteudo.texto) {
    state.ui = [];
    return state;
  }

  const original = createElemento(dispositivo);

  dispositivo.texto = !isDispositivoAlteracao(dispositivo) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');

  if (dispositivo.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
    dispositivo.situacao = new DispositivoModificado(original);
  }

  const eventosUi = new Eventos();

  const elemento = createElemento(dispositivo, true);
  elemento.mensagens = validaDispositivo(dispositivo);

  if (houveAlteracaoNoTextoAposAcao(dispositivo.texto, action)) {
    eventosUi.add(StateType.ElementoModificado, [elemento]);
  }
  eventosUi.add(StateType.SituacaoElementoModificada, [elemento]);
  eventosUi.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(dispositivo));

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, buildUpdateEvent(dispositivo, original)),
    present: eventos.build(),
    future: [],
    ui: {
      events: eventosUi.build(),
    },
  };
};
