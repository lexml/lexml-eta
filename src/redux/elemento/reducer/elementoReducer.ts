import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acoes/adicionarElementoAction';
import { AGRUPAR_ELEMENTO } from '../../../model/lexml/acoes/agruparElementoAction';
import { ATUALIZAR_ELEMENTO } from '../../../model/lexml/acoes/atualizarElementoAction';
import { ELEMENTO_SELECIONADO } from '../../../model/lexml/acoes/elementoSelecionadoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../model/lexml/acoes/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../model/lexml/acoes/moverElementoAcimaAction';
import { NOVA_ARTICULACAO } from '../../../model/lexml/acoes/novaArticulacaoAction';
import { ABRIR_ARTICULACAO } from '../../../model/lexml/acoes/openArticulacaoAction';
import { REDO } from '../../../model/lexml/acoes/redoAction';
import { REMOVER_ELEMENTO } from '../../../model/lexml/acoes/removerElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../model/lexml/acoes/renumerarElementoAction';
import { SHIFT_TAB } from '../../../model/lexml/acoes/shiftTabAction';
import { TAB } from '../../../model/lexml/acoes/tabAction';
import { TRANSFORMAR_TIPO_ELEMENTO } from '../../../model/lexml/acoes/transformarElementoAction';
import { UNDO } from '../../../model/lexml/acoes/undoAction';
import { VALIDAR_ARTICULACAO } from '../../../model/lexml/acoes/validarArticulacaoAction';
import { VALIDAR_ELEMENTO } from '../../../model/lexml/acoes/validarElementoAction';
import { abreArticulacao } from './abreArticulacao';
import { adicionaElemento } from './adicionaElemento';
import { agrupaElemento } from './agrupaElemento';
import { atualizarElemento } from './atualizarElemento';
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
      return atualizarElemento(state, action);
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
