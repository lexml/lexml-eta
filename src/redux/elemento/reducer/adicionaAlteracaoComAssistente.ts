import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArtigo } from '../../../model/dispositivo/tipo';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { TEXTO_OMISSIS } from '../../../model/lexml/conteudo/textoOmissis';
import { createAlteracao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { formataNumero, getDataPorExtenso, getNumero, getTipo, validaUrn } from '../../../model/lexml/documento/urnUtil';
import { getUltimoFilho, buildListaDispositivos, getDispositivoAnterior } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { buildDispositivosAssistente } from '../../../model/lexml/numeracao/parserReferenciaDispositivo';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
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

  const novosDispositivos = buildListaDispositivos(novo, []);
  novosDispositivos.forEach((d, i: number) => {
    if (i > 0 && i < novosDispositivos.length - 1) {
      d.texto = TEXTO_OMISSIS;
    }
    if (i > 1) {
      adicionarOmissisObrigatorios(d);
    }
  });

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(atual, novo)));
  eventos.add(StateType.ElementoIncluido, getElementosDoDispositivo(novo, true));
  eventos.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(novo, false));
  eventos.add(StateType.ElementoMarcado, [createElemento(getUltimoFilho(novo)), createElemento(atual)]);

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

const adicionarOmissisObrigatorios = (atual: Dispositivo): void => {
  if (parseInt(atual.numero!) > 1) {
    const anterior = getDispositivoAnterior(atual);
    const novo = criaDispositivo(atual.pai!, TipoDispositivo.omissis.tipo, anterior, anterior ? undefined : 0);
    novo.situacao = new DispositivoAdicionado();
  }
};
