import { buildListaDispositivos, createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { DispositivoLexmlFactory } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAnterior, getDispositivoAnteriorMesmoTipoInclusiveOmissis } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { Eventos } from '../../evento';
import { State, StateType } from '../../state';
import { ajustaReferencia } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

export const moveElementoAcima = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const anterior = getDispositivoAnteriorMesmoTipoInclusiveOmissis(atual);

  if (anterior === undefined) {
    return state;
  }

  const removidos = [...getElementos(anterior), ...getElementos(atual)];
  const renumerados = listaDispositivosRenumerados(atual);

  const pai = atual.pai!;
  const pos = pai.indexOf(anterior);
  pai.removeFilho(atual);
  pai.removeFilho(anterior);

  const um = DispositivoLexmlFactory.create(pai, atual.tipo, undefined, pos);
  um.texto = action.atual.conteudo.texto;
  DispositivoLexmlFactory.copiaFilhos(atual, um);

  const outro = DispositivoLexmlFactory.create(pai, anterior.tipo, undefined, pos + 1);
  outro.texto = anterior.texto;
  DispositivoLexmlFactory.copiaFilhos(anterior, outro);
  pai.renumeraFilhos();

  const referencia = pos === 0 ? (um.pai?.tipo === TipoDispositivo.caput.tipo ? pai.pai! : pai) : getDispositivoAnterior(um);

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
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};
