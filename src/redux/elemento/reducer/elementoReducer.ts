import { ADICIONAR_ALERTA } from '../../../model/alerta/acao/adicionarAlerta';
import { LIMPAR_ALERTAS } from '../../../model/alerta/acao/limparAlertas';
import { REMOVER_ALERTA } from '../../../model/alerta/acao/removerAlerta';
import { ASSISTENTE_ALTERACAO } from '../../../model/lexml/acao/adicionarAlteracaoComAssistenteAction';
import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acao/adicionarElementoAction';
import { AGRUPAR_ELEMENTO } from '../../../model/lexml/acao/agruparElementoAction';
import { APLICAR_ALTERACOES_EMENDA } from '../../../model/lexml/acao/aplicarAlteracoesEmenda';
import { ATUALIZAR_ELEMENTO } from '../../../model/lexml/acao/atualizarElementoAction';
import { ATUALIZAR_REFERENCIA_ELEMENTO } from '../../../model/lexml/acao/atualizarReferenciaElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../model/lexml/acao/atualizarTextoElementoAction';
import { AUTO_FIX } from '../../../model/lexml/acao/autoFixAction';
import { ELEMENTO_SELECIONADO } from '../../../model/lexml/acao/elementoSelecionadoAction';
import { INFORMAR_DADOS_ASSISTENTE } from '../../../model/lexml/acao/informarDadosAssistenteAction';
import { INFORMAR_EXISTENCIA_NA_NORMA } from '../../../model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { INFORMAR_NORMA } from '../../../model/lexml/acao/informarNormaAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { ABRIR_ARTICULACAO } from '../../../model/lexml/acao/openArticulacaoAction';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { REMOVER_ELEMENTO } from '../../../model/lexml/acao/removerElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../model/lexml/acao/renumerarElementoAction';
import { RESTAURAR_ELEMENTO } from '../../../model/lexml/acao/restaurarElemento';
import { SHIFT_TAB } from '../../../model/lexml/acao/shiftTabAction';
import { SUPRIMIR_AGRUPADOR } from '../../../model/lexml/acao/suprimirAgrupador';
import { SUPRIMIR_ELEMENTO } from '../../../model/lexml/acao/suprimirElemento';
import { TAB } from '../../../model/lexml/acao/tabAction';
import { TRANSFORMAR_TIPO_ELEMENTO } from '../../../model/lexml/acao/transformarElementoAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { VALIDAR_ARTICULACAO } from '../../../model/lexml/acao/validarArticulacaoAction';
import { VALIDAR_ELEMENTO } from '../../../model/lexml/acao/validarElementoAction';
import { REMOVER_ELEMENTO_SEM_TEXTO } from './../../../model/lexml/acao/removerElementoSemTextoAction';
import { abreArticulacao } from './abreArticulacao';
import { adicionaAlteracaoComAssistente } from './adicionaAlteracaoComAssistente';
import { adicionaElemento } from './adicionaElemento';
import { adicionarAlerta } from './adicionarAlerta';
import { agrupaElemento } from './agrupaElemento';
import { aplicaAlteracoesEmenda } from './aplicaAlteracoesEmenda';
import { atualizaElemento } from './atualizaElemento';
import { atualizaReferenciaElemento } from './atualizaReferenciaElemento';
import { atualizaTextoElemento } from './atualizaTextoElemento';
import { autoFixElemento } from './autoFixElemento';
import { informaExistenciaDoElementoNaNorma } from './informaExistenciaDoElementoNaNorma';
import { limparAlertas } from './limparAlertas';
import { modificaTipoElementoWithTab } from './modificaTipoElementoWithTab';
import { moveElementoAbaixo } from './moveElementoAbaixo';
import { moveElementoAcima } from './moveElementoAcima';
import { redo } from './redo';
import { removeElemento } from './removeElemento';
import { removeElementoSemTexto } from './removeElementoSemTexto';
import { removerAlerta } from './removerAlerta';
import { renumeraElemento } from './renumeraElemento';
import { restauraElemento } from './restauraElemento';
import { selecionaElemento } from './selecionaElemento';
import { solicitaDadosAssistente } from './solicitaDadosAssistente';
import { solicitaNorma } from './solicitaNorma';
import { suprimeAgrupador } from './suprimeAgrupador';
import { suprimeElemento } from './suprimeElemento';
import { transformaTipoElemento } from './transformaTipoElemento';
import { undo } from './undo';
import { validaArticulacao } from './validaArticulacao';
import { validaElemento } from './validaElemento';

export const elementoReducer = (state = {}, action: any): any => {
  switch (action.type) {
    case INFORMAR_EXISTENCIA_NA_NORMA:
      return informaExistenciaDoElementoNaNorma(state, action);
    case APLICAR_ALTERACOES_EMENDA:
      return aplicaAlteracoesEmenda(state, action);
    case ASSISTENTE_ALTERACAO:
      return adicionaAlteracaoComAssistente(state, action);
    case ATUALIZAR_ELEMENTO:
      return atualizaElemento(state, action);
    case ATUALIZAR_REFERENCIA_ELEMENTO:
      return atualizaReferenciaElemento(state, action);
    case ATUALIZAR_TEXTO_ELEMENTO:
      return atualizaTextoElemento(state, action);
    case AUTO_FIX:
      return autoFixElemento(state, action);
    case ADICIONAR_ELEMENTO:
      return adicionaElemento(state, action);
    case AGRUPAR_ELEMENTO:
      return agrupaElemento(state, action);
    case TRANSFORMAR_TIPO_ELEMENTO:
      return transformaTipoElemento(state, action);
    case ELEMENTO_SELECIONADO:
      return selecionaElemento(state, action);
    case INFORMAR_DADOS_ASSISTENTE:
      return solicitaDadosAssistente(state, action);
    case INFORMAR_NORMA:
      return solicitaNorma(state, action);
    case MOVER_ELEMENTO_ABAIXO:
      return moveElementoAbaixo(state, action);
    case MOVER_ELEMENTO_ACIMA:
      return moveElementoAcima(state, action);
    case RENUMERAR_ELEMENTO:
      return renumeraElemento(state, action);
    case RESTAURAR_ELEMENTO:
      return restauraElemento(state, action);
    case SUPRIMIR_AGRUPADOR:
      return suprimeAgrupador(state, action);
    case SUPRIMIR_ELEMENTO:
      return suprimeElemento(state, action);
    case ABRIR_ARTICULACAO:
      return abreArticulacao(state, action);
    case REDO:
      return redo(state);
    case REMOVER_ELEMENTO:
      return removeElemento(state, action);
    case REMOVER_ELEMENTO_SEM_TEXTO:
      return removeElementoSemTexto(state, action);
    case SHIFT_TAB:
    case TAB:
      return modificaTipoElementoWithTab(state, action);
    case UNDO:
      return undo(state);
    case VALIDAR_ELEMENTO:
      return validaElemento(state, action);
    case VALIDAR_ARTICULACAO:
      return validaArticulacao(state);
    case ADICIONAR_ALERTA:
      return adicionarAlerta(state, action);
    case REMOVER_ALERTA:
      return removerAlerta(state, action);
    case LIMPAR_ALERTAS:
      return limparAlertas(state);
    default:
      return state;
  }
};
