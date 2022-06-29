import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { TAB } from '../../../model/lexml/acao/tabAction';
import { TransformarElemento, TRANSFORMAR_TIPO_ELEMENTO } from '../../../model/lexml/acao/transformarElementoAction';
import { State } from '../../state';
import { transformaTipoElemento } from './transformaTipoElemento';

export const modificaTipoElementoWithTab = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }
  const acao = action.type === TAB ? atual.getAcaoPossivelTab(atual) : atual.getAcaoPossivelShiftTab(atual);

  if (!acao) {
    state.ui.events = [];
    return state;
  }

  const newAction = {
    type: TRANSFORMAR_TIPO_ELEMENTO,
    subType: (acao as TransformarElemento).nomeAcao,
    atual: action.atual,
    novo: {
      tipo: acao.tipo,
    },
  };

  return transformaTipoElemento(state, newAction);
};
