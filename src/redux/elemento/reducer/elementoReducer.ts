import {
  ABRIR_ARTICULACAO,
  ADICIONAR_ELEMENTO,
  AGRUPAR_ELEMENTO,
  ATUALIZAR_ELEMENTO,
  ELEMENTO_SELECIONADO,
  MOVER_ELEMENTO_ABAIXO,
  MOVER_ELEMENTO_ACIMA,
  NOVA_ARTICULACAO,
  REDO,
  REMOVER_ELEMENTO,
  RENUMERAR_ELEMENTO,
  SHIFT_TAB,
  TAB,
  TRANSFORMAR_TIPO_ELEMENTO,
  UNDO,
  VALIDAR_ARTICULACAO,
  VALIDAR_ELEMENTO,
} from '../action/elementoActions';
import { abreArticulacao } from './abreArticulacao';
import { adicionaElemento } from './adicionaElemento';
import { agrupaElemento } from './agrupaElemento';
import { atualizaElemento } from './atualizaElemento';
import { modificaTipoElementoWithTab } from './modificaTipoElementoWithTab';
import { moveElementoAbaixo } from './moveElementoAbaixo';
import { moveElementoAcima } from './moveElementoAcima';
import { novaArticulacao } from './novaArticulacao';
import { redo } from './redo';
import { removeElemento } from './removeElemento';
import { renumeraElemento } from './renumeraElemento';
import { selecionaElemento } from './selecionaElemento';
import { transformaTipoElemento } from './transformaTipoElemento';
import { undo } from './undo';
import { validaArticulacao } from './validaArticulacao';
import { validaElemento } from './validaElemento';

export const elementoReducer = (state = {}, action: any): any => {
  switch (action.type) {
    case ATUALIZAR_ELEMENTO:
      return atualizaElemento(state, action);
    case ADICIONAR_ELEMENTO:
      return adicionaElemento(state, action);
    case AGRUPAR_ELEMENTO:
      return agrupaElemento(state, action);
    case TRANSFORMAR_TIPO_ELEMENTO:
      return transformaTipoElemento(state, action);
    case ELEMENTO_SELECIONADO:
      return selecionaElemento(state, action);
    case MOVER_ELEMENTO_ABAIXO:
      return moveElementoAbaixo(state, action);
    case MOVER_ELEMENTO_ACIMA:
      return moveElementoAcima(state, action);
    case NOVA_ARTICULACAO:
      return novaArticulacao();
    case RENUMERAR_ELEMENTO:
      return renumeraElemento(state, action);
    case ABRIR_ARTICULACAO:
      return abreArticulacao(state, action);
    case REDO:
      return redo(state);
    case REMOVER_ELEMENTO:
      return removeElemento(state, action);
    case SHIFT_TAB:
    case TAB:
      return modificaTipoElementoWithTab(state, action);
    case UNDO:
      return undo(state);
    case VALIDAR_ELEMENTO:
      return validaElemento(state, action);
    case VALIDAR_ARTICULACAO:
      return validaArticulacao(state);
    default:
      return state;
  }
};
