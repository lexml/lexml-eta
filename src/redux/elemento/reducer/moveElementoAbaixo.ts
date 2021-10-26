import { isIncisoCaput } from '../../../model/dispositivo/tipo';
import { buildListaDispositivos, createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { copiaFilhos } from '../../../model/lexml/dispositivo/dispositivoLexmlUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAnterior, getDispositivoPosteriorMesmoTipoInclusiveOmissis } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

export const moveElementoAbaixo = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const proximo = getDispositivoPosteriorMesmoTipoInclusiveOmissis(atual);

  if (proximo === undefined) {
    return state;
  }

  const removidos = [...getElementos(atual), ...getElementos(proximo)];
  const renumerados = listaDispositivosRenumerados(proximo);

  const pai = atual.pai!;
  const pos = pai.indexOf(atual);
  pai.removeFilho(atual);
  pai.removeFilho(proximo);

  const um = criaDispositivo(pai, proximo.tipo, undefined, pos);
  um.texto = proximo.texto;
  copiaFilhos(proximo, um);

  const outro = criaDispositivo(pai, atual.tipo, undefined, pos + 1);
  outro.texto = action.atual.conteudo.texto;
  copiaFilhos(atual, outro);

  pai.renumeraFilhos();

  const referencia = pos === 0 ? (isIncisoCaput(um) ? pai.pai! : pai) : getDispositivoAnterior(um);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, um)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(um, [])
      .concat(buildListaDispositivos(outro, []))
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
