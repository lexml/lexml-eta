import { isArtigo } from '../../../model/dispositivo/tipo';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { formataNumero, getData, getNumero, getTipo, validaUrn } from '../../../model/lexml/documento/urnUtil';
import { buildDispositivosAssistente } from '../../../model/lexml/numeracao/parserReferenciaDispositivo';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { buildId } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia, getElementosDoDispositivo } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const adicionaAlteracaoComAssistente = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined || !isArtigo(atual)) {
    state.ui.events = [];
    return state;
  }

  if (!action.dispositivos || action.dispositivos.trim().length === 0) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'É necessário informar os dispositivos' });
  }

  const novo = criaDispositivo(atual.pai!, atual.tipo, atual);
  novo.situacao = new DispositivoAdicionado();
  (novo.situacao as DispositivoAdicionado).tipoEmenda = state.modo;
  (novo.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
  novo.pai?.renumeraFilhos();
  novo.id = buildId(novo);

  try {
    buildDispositivosAssistente(action.dispositivos, novo, state.modo);
  } catch (e) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: (e as Error).message });
  }
  if (action.norma) {
    novo.alteracoes!.base = action.norma;

    if (novo.alteracoes?.base && validaUrn(novo.alteracoes.base)) {
      const textoUrn = `${getTipo(novo.alteracoes.base).descricao} nº ${formataNumero(getNumero(novo.alteracoes.base))}, de ${getData(novo.alteracoes!.base)}`;
      novo.texto = `A <a href="${novo.alteracoes.base}">${textoUrn}</a>, passa a vigorar com as seguintes alterações:`;
    }
  }

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(atual, novo)));
  eventos.add(StateType.ElementoIncluido, getElementosDoDispositivo(novo, true));
  eventos.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(novo, false));

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: [],

    ui: {
      events: eventos.build(),
      alertas: state.ui?.alertas,
    },
  };
};
