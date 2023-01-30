import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArtigo, isIncisoCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { MoverElementoAbaixo } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  buildListaDispositivos,
  getDispositivoAnterior,
  getDispositivoPosterior,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  getProximoAgrupadorAposArtigo,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia, resetUuidTodaArvore } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const moveElementoAbaixo = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(atual, MoverElementoAbaixo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
  }

  //

  const proximoDispositivo = getDispositivoPosteriorMesmoTipoInclusiveOmissis(atual);
  let proximoAgrupador: Dispositivo | undefined = undefined;

  if(isArtigo(atual)) {
    const proximoIrmao = getDispositivoPosterior(atual);
    if(!proximoIrmao || !isArtigo(proximoIrmao)) {
      proximoAgrupador = getProximoAgrupadorAposArtigo(atual);
    }

  }

  const proximoArtigoAgrupador = proximoAgrupador?.filhos?.length ? proximoAgrupador?.filhos[0] : undefined;
  const proximo = proximoDispositivo ? proximoDispositivo : proximoArtigoAgrupador;


  if (proximo === undefined) {
    return state;
  }

  const removidos = [...getElementos(atual), ...getElementos(proximo)];
  const renumerados = listaDispositivosRenumerados(atual);

  const pai = proximoArtigoAgrupador ? proximoAgrupador! : atual.pai!;
  const pos = proximoArtigoAgrupador ? 0 : pai.indexOf(atual);

  resetUuidTodaArvore(atual);
  resetUuidTodaArvore(proximo);



  if(proximoArtigoAgrupador) {
    atual.pai!.removeFilho(atual);
    pai.addFilhoOnPosition(atual, pos);
  } else {

    pai.removeFilho(atual);
    pai.addFilhoOnPosition(atual, pos + 1);
  }

  pai.renumeraFilhos();

  const referencia = pos === 0 ? (isIncisoCaput(proximo) || (isDispositivoAlteracao(atual) && isArtigo(atual)) ? pai.pai! : pai) : getDispositivoAnterior(proximo);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, proximoArtigoAgrupador ? atual : proximo)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(proximoArtigoAgrupador ? atual : proximo, [])
      .concat(buildListaDispositivos(proximoArtigoAgrupador ? proximo : atual, []))
      .map(v => {
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
