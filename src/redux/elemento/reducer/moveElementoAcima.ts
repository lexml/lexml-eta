import { ajustaReferencia } from './../util/reducerUtil';
import {
  getDispositivoAnteriorNaSequenciaDeLeitura,
  isDispositivoRaiz,
  getIrmaoAnteriorIndependenteDeTipo,
  isArticulacaoAlteracao,
} from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { isAgrupador, isEmenta } from './../../../model/dispositivo/tipo';
import { isArtigo, isCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { MoverElementoAcima } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { buildListaDispositivos } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { resetUuidTodaArvore } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const moveElementoAcima = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(atual, MoverElementoAcima)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
  }

  // Dispositivo cuja posição será trocada com o atual
  const anterior = isArtigo(atual) ? getDispositivoAnteriorNaSequenciaDeLeitura(atual, d => isArtigo(d) || isAgrupador(d)) : getIrmaoAnteriorIndependenteDeTipo(atual);

  if (anterior === undefined || isDispositivoRaiz(anterior) || isEmenta(anterior)) {
    return state;
  }

  const removidos = getElementos(atual);
  const renumerados = listaDispositivosRenumerados(atual);

  resetUuidTodaArvore(atual);

  // Partindo do caso feliz (movendo entre irmãos)
  const paiAntigo = atual.pai!;
  let novoPai = anterior.pai!;
  let pos = novoPai.indexOf(anterior);
  /*
    Verifica casos de artigo pulando agrupador.

    Agrupador
      Agrupador
    Agrupador
      Art <movendo este para cima>
    ---
    Agrupador
      Art
    Agrupador
      Art <movendo este para cima>
  */
  // Artigo pulando agrupador
  if (isAgrupador(anterior)) {
    const anteriorAoAgrupador = getDispositivoAnteriorNaSequenciaDeLeitura(anterior, d => isArtigo(d) || isAgrupador(d))!;
    if (isAgrupador(anteriorAoAgrupador)) {
      novoPai = anteriorAoAgrupador;
      pos = 0;
    } else {
      // Artigo
      novoPai = anteriorAoAgrupador.pai!;
      pos = novoPai.indexOf(anteriorAoAgrupador) + 1;
    }
  }

  atual.pai!.removeFilho(atual);
  novoPai.addFilhoOnPosition(atual, pos);
  novoPai.renumeraFilhos();
  if (paiAntigo !== novoPai) {
    paiAntigo.renumeraFilhos();
  }

  const referencia = getDispositivoAnteriorNaSequenciaDeLeitura(atual, d => !isCaput(d) && !isArticulacaoAlteracao(d))!;

  const eventos = new Eventos();
  eventos.add(StateType.ElementoRemovido, removidos);
  eventos.setReferencia(createElemento(ajustaReferencia(referencia, atual)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(atual, []).map(v => {
      v.mensagens = validaDispositivo(v);
      return createElemento(v);
    })
  );
  eventos.add(
    StateType.ElementoRenumerado,
    renumerados.map(r => createElemento(r))
  );

  // Elementos em StateType.ElementoMarcado:
  // Primeiro elemento será usado para marcar o elemento no editor
  // Segundo elemento será usado para marcar o elemento em caso de "undo"
  eventos.add(StateType.ElementoMarcado, [createElemento(atual), action.atual]);
  eventos.add(StateType.ElementoSelecionado, [createElemento(atual)]);
  console.log(eventos);
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
