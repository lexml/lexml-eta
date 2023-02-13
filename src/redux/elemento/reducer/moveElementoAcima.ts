import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArtigo, isCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { MoverElementoAcima } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  buildListaDispositivos,
  getAnteriorAgrupadorAntesArtigo,
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUltimoFilho,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia, resetUuidTodaArvore } from '../util/reducerUtil';
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

  const anteriorDispositivo = getDispositivoAnteriorMesmoTipoInclusiveOmissis(atual);
  let anteriorAgrupador: Dispositivo | undefined = undefined;

  if (isArtigo(atual)) {
    const anteriorIrmao = getDispositivoAnterior(atual);
    if (!anteriorIrmao || !isArtigo(anteriorIrmao)) {
      anteriorAgrupador = getAnteriorAgrupadorAntesArtigo(atual);
    }
  }
  const anteriorArtigoAgrupador = anteriorAgrupador?.filhos?.length ? anteriorAgrupador.filhos[anteriorAgrupador.filhos.length - 1] : undefined;
  const anterior = anteriorDispositivo ? anteriorDispositivo : anteriorArtigoAgrupador;

  if (anterior === undefined) {
    return state;
  }

  const removidos = [...getElementos(anterior), ...getElementos(atual)];
  const renumerados = listaDispositivosRenumerados(atual);

  const pai = anteriorArtigoAgrupador ? anterior.pai! : atual.pai!;
  const pos = anteriorArtigoAgrupador ? pai.indexOf(anterior) : pai.indexOf(atual);

  resetUuidTodaArvore(anterior);
  resetUuidTodaArvore(atual);

  if (anteriorArtigoAgrupador) {
    atual.pai!.removeFilho(atual);
    pai.addFilhoOnPosition(atual, pos + 1);
  } else {
    pai.removeFilho(atual);
    pai.addFilhoOnPosition(atual, pos - 1);
  }

  pai.renumeraFilhos();

  const anteriorAtual = anteriorAgrupador ? getDispositivoAnterior(anterior) : getDispositivoAnterior(atual);
  const referencia = pos <= 1 ? (isCaput(atual.pai!) || (isDispositivoAlteracao(atual) && isArtigo(atual)) ? pai.pai! : pai) : anteriorAtual ? anteriorAtual : atual.pai;

  const eventos = new Eventos();
  eventos.add(StateType.ElementoRemovido, removidos);
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, atual)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(anteriorArtigoAgrupador ? anterior : atual, [])
      .concat(buildListaDispositivos(anteriorArtigoAgrupador ? atual : anterior, []))
      .map(v => {
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
