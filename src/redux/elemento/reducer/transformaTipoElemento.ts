import { isCaput, isIncisoCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoTransformacaoPermitida, normalizaNomeAcaoTransformacao } from '../../../model/lexml/acao/acaoUtil';
import { converteDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAnterior } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State } from '../../state';
import { buildEventoTransformacaooElemento } from '../evento/eventosUtil';
import { getElementosDoDispositivo } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

export const transformaTipoElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui = [];
    return state;
  }

  if (!isAcaoTransformacaoPermitida(atual, action)) {
    return state;
  }

  action.subType = normalizaNomeAcaoTransformacao(atual, action.subType);

  const removidos = [...getElementos(atual)];

  const atualRenumerados = listaDispositivosRenumerados(atual);

  const novo = converteDispositivo(atual, action);

  const novoRenumerados = listaDispositivosRenumerados(novo);

  const renumerados = novoRenumerados.concat(atualRenumerados);

  const validados = getElementosDoDispositivo(novo, true);

  const paiNovo = isIncisoCaput(novo) ? novo.pai!.pai! : novo.pai!;

  const parent = validados.filter(v => v.uuid === paiNovo.uuid).length > 0 ? atual.pai : paiNovo;

  parent!.mensagens = validaDispositivo(parent!);

  validados.unshift(createElemento(parent!));

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
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};
