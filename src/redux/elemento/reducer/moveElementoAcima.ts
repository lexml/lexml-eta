import { ajustaReferencia } from './../util/reducerUtil';
import {
  getDispositivoAnteriorNaSequenciaDeLeitura,
  isDispositivoRaiz,
  getIrmaoAnteriorIndependenteDeTipo,
  isArticulacaoAlteracao,
  irmaosMesmoTipo,
  isDispositivoAlteracao,
  getDispositivoAndFilhosAsLista,
} from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { isAgrupador, isEmenta } from './../../../model/dispositivo/tipo';
import { isArtigo, isCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida, montaEMostraMensagensErro } from '../../../model/lexml/acao/acaoUtil';
import { MoverElementoAcima } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { buildListaDispositivos } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { resetUuidTodaArvore } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { buildId } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { existeFilhoExcluidoDuranteRevisao } from '../util/revisaoUtil';

export const moveElementoAcima = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(atual, MoverElementoAcima)) {
    return montaEMostraMensagensErro(atual, state);
  }

  if (state.emRevisao && existeFilhoExcluidoDuranteRevisao(state, atual) && !action.isRejeitandoRevisao) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: 'Não é possível mover dispositivo que possua dispositivo subordinado já removido ou alterado em modo de revisão.',
    });
  }

  // Dispositivo cuja posição será trocada com o atual
  const emAlteracao = isDispositivoAlteracao(atual);
  const anterior = isArtigo(atual)
    ? getDispositivoAnteriorNaSequenciaDeLeitura(atual, d => (isArtigo(d) || isAgrupador(d)) && isDispositivoAlteracao(d) === emAlteracao)
    : getIrmaoAnteriorIndependenteDeTipo(atual);

  if (anterior === undefined || isDispositivoRaiz(anterior) || isEmenta(anterior)) {
    return state;
  }

  const removidos = getElementos(atual, false, true);
  const renumerados = irmaosMesmoTipo(atual).filter(d => d !== atual && d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL);

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
    const anteriorAoAgrupador = getDispositivoAnteriorNaSequenciaDeLeitura(anterior, d => (isArtigo(d) || isAgrupador(d)) && isDispositivoAlteracao(d) === emAlteracao)!;
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

  getDispositivoAndFilhosAsLista(atual).forEach(d => (d.id = buildId(d)));
  const dPosterior = atual.pai!.filhos[atual.pai!.indexOf(atual) + 1];
  dPosterior && getDispositivoAndFilhosAsLista(dPosterior).forEach(d => (d.id = buildId(d)));

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
