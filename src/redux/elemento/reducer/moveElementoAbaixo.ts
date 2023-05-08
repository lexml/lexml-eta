import { isAgrupadorNaoArticulacao } from './../../../model/dispositivo/tipo';
import { getIrmaoPosteriorIndependenteDeTipo, getUltimoFilho } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { isArtigo } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida, montaEMostraMensagensErro } from '../../../model/lexml/acao/acaoUtil';
import { MoverElementoAbaixo } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { buildListaDispositivos, getProximoAgrupadorAposArtigo } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia, resetUuidTodaArvore } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

export const moveElementoAbaixo = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(atual, MoverElementoAbaixo)) {
    return montaEMostraMensagensErro(atual, state);
  }

  // Dispositivo cuja posição será trocada com o atual
  let proximo = getIrmaoPosteriorIndependenteDeTipo(atual);
  if (!proximo && isArtigo(atual)) {
    proximo = getProximoAgrupadorAposArtigo(atual);
  }

  if (!proximo) {
    return state;
  }

  const movendoArtigoParaAgrupador = isAgrupadorNaoArticulacao(proximo);

  const removidos = [...getElementos(atual)];
  const renumerados = listaDispositivosRenumerados(atual);

  const paiAntigo = atual.pai!;
  const novoPai = movendoArtigoParaAgrupador ? proximo : proximo.pai!;
  const pos = movendoArtigoParaAgrupador ? 0 : novoPai.indexOf(atual) + 1;

  resetUuidTodaArvore(atual);

  atual.pai!.removeFilho(atual);
  novoPai.addFilhoOnPosition(atual, pos);

  novoPai.renumeraFilhos();
  if (paiAntigo !== novoPai) {
    paiAntigo.renumeraFilhos();
  }

  const referencia = movendoArtigoParaAgrupador ? proximo : getUltimoFilho(proximo);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, atual)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(atual, []).map(v => {
      v.mensagens = validaDispositivo(v);
      return createElemento(v);
    })
  );
  eventos.add(StateType.ElementoRemovido, removidos);
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
