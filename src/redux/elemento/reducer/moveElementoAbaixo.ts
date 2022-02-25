import { isIncisoCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { MoverElementoAbaixo } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  buildListaDispositivos,
  getDispositivoAnterior,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
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
    state.ui = [];
    return state;
  }

  if (!isAcaoPermitida(atual, MoverElementoAbaixo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir um dispositivo original mas apenas suprimi-lo.' });
  }

  const proximo = getDispositivoPosteriorMesmoTipoInclusiveOmissis(atual);

  if (proximo === undefined) {
    return state;
  }

  const removidos = [...getElementos(atual), ...getElementos(proximo)];
  const renumerados = listaDispositivosRenumerados(atual);

  const pai = atual.pai!;
  const pos = pai.indexOf(atual);

  resetUuidTodaArvore(atual);
  resetUuidTodaArvore(proximo);

  pai.removeFilho(atual);
  pai.removeFilho(proximo);

  pai.addFilhoOnPosition(proximo, pos);
  pai.addFilhoOnPosition(atual, pos + 1);

  atual.pai = pai;
  proximo.pai = pai;

  pai.renumeraFilhos();

  const referencia = pos === 0 ? (isIncisoCaput(proximo) || (isDispositivoAlteracao(atual) && atual.tipo === 'Artigo') ? pai.pai! : pai) : getDispositivoAnterior(proximo);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, proximo)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(proximo, [])
      .concat(buildListaDispositivos(atual, []))
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
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};
