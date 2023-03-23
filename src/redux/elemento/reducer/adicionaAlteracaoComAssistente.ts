import { Artigo } from '../../../model/dispositivo/dispositivo';
import { isArtigo } from '../../../model/dispositivo/tipo';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { createAlteracao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { formataNumero, getDataPorExtenso, getNumero, getTipo, validaUrn } from '../../../model/lexml/documento/urnUtil';
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

  const novo = criaDispositivo(atual.pai!, atual.tipo, atual);
  novo.situacao = new DispositivoAdicionado();
  (novo.situacao as DispositivoAdicionado).tipoEmenda = state.modo;
  novo.isDispositivoAlteracao = false;
  (novo.situacao as DispositivoAdicionado).existeNaNormaAlterada = undefined;
  novo.pai?.renumeraFilhos();
  novo.id = buildId(novo);

  (novo as Artigo).caput!.situacao = novo.situacao = new DispositivoAdicionado();
  ((novo as Artigo).caput!.situacao as DispositivoAdicionado).tipoEmenda = state.modo;

  createAlteracao(novo);

  novo.alteracoes!.situacao = new DispositivoAdicionado();
  (novo.alteracoes!.situacao as DispositivoAdicionado).tipoEmenda = state.modo;

  if (action.dispositivos) {
    try {
      buildDispositivosAssistente(action.dispositivos, novo, state.modo);
    } catch (e) {
      return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: (e as Error).message });
    }
  }

  if (action.norma) {
    novo.alteracoes!.base = action.norma;

    const genero = getTipo(action.norma)?.genero;

    if (action.norma && validaUrn(action.norma)) {
      const textoUrn = `${getTipo(action.norma).descricao} nº ${formataNumero(getNumero(action.norma))}, de ${getDataPorExtenso(action.norma)}`;
      novo.texto = `${genero && genero === 'M' ? 'O' : 'A'} <a href="${action.norma}">${textoUrn}</a>, passa a vigorar com as seguintes alterações:`;
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
