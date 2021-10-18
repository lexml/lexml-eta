import { isCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elemento-util';
import { isAcaoTransformacaoPermitida, normalizaNomeAcao } from '../../../model/lexml/acoes/acoes-possiveis';
import { DispositivoLexmlFactory } from '../../../model/lexml/dispositivo/dispositivo-lexml-factory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivo-validator';
import { getDispositivoAnterior } from '../../../model/lexml/hierarquia/hierarquia-util';
import { State } from '../../state';
import { buildEventoTransformacaooElemento } from '../util/eventosReducerUtil';
import { getElementosDoDispositivo } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

export const transformaTipoElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  action.subType = normalizaNomeAcao(atual, action.subType);

  if (!isAcaoTransformacaoPermitida(atual, action.subType)) {
    return state;
  }

  const removidos = [...getElementos(atual)];

  const atualRenumerados = listaDispositivosRenumerados(atual);

  const novo = DispositivoLexmlFactory.converteDispositivo(atual, action);

  const novoRenumerados = listaDispositivosRenumerados(novo);

  const renumerados = novoRenumerados.concat(atualRenumerados);

  const validados = getElementosDoDispositivo(novo, true);

  const dispositivoAnterior = getDispositivoAnterior(novo);

  const referencia = dispositivoAnterior ?? novo.pai!;
  const eventos = buildEventoTransformacaooElemento(
    isCaput(referencia) ? referencia.pai! : referencia,
    novo,
    removidos,
    renumerados.map(d => {
      d.mensagens = validaDispositivo(d);
      const el = createElemento(d);
      return el;
    }),
    validados
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
