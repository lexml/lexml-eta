import { ADICIONAR_AGRUPADOR_ARTIGO } from './../../../model/lexml/acao/adicionarAgrupadorArtigoAction';
import { ADICIONAR_ALERTA } from '../../../model/alerta/acao/adicionarAlerta';
import { LIMPAR_ALERTAS } from '../../../model/alerta/acao/limparAlertas';
import { REMOVER_ALERTA } from '../../../model/alerta/acao/removerAlerta';
import { ASSISTENTE_ALTERACAO } from '../../../model/lexml/acao/adicionarAlteracaoComAssistenteAction';
import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acao/adicionarElementoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../model/lexml/acao/AdicionarElementosFromClipboardAction';
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
import { ATUALIZAR_NOTA_ALTERACAO } from './../../../model/lexml/acao/atualizarNotaAlteracaoAction';
import { REMOVER_ELEMENTO_SEM_TEXTO } from './../../../model/lexml/acao/removerElementoSemTextoAction';
import { abreArticulacao } from './abreArticulacao';
import { adicionaAlteracaoComAssistente } from './adicionaAlteracaoComAssistente';
import { adicionaElemento } from './adicionaElemento';
import { adicionarAlerta as adicionaAlerta } from './adicionarAlerta';
import { agrupaElemento } from './agrupaElemento';
import { aplicaAlteracoesEmenda } from './aplicaAlteracoesEmenda';
import { atualizaElemento } from './atualizaElemento';
import { atualizaNotaAlteracao } from './atualizaNotaAlteracao';
import { atualizaReferenciaElemento } from './atualizaReferenciaElemento';
import { atualizaTextoElemento } from './atualizaTextoElemento';
import { autoFixElemento } from './autoFixElemento';
import { informaExistenciaDoElementoNaNorma } from './informaExistenciaDoElementoNaNorma';
import { limparAlertas } from './limparAlertas';
import { modificaTipoElementoWithTab } from './modificaTipoElementoWithTab';
import { moveElementoAbaixo } from './moveElementoAbaixo';
import { moveElementoAcima } from './moveElementoAcima';
import { redo } from './redo';
import { removeAlerta } from './removeAlerta';
import { removeElemento } from './removeElemento';
import { removeElementoSemTexto } from './removeElementoSemTexto';
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
import { adicionaElementosNaProposicaoFromClipboard } from './adicionaElementosNaProposicaoFromClipboard';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../model/lexml/acao/ativarDesativarRevisaoAction';
import { ativaDesativaRevisao } from './ativaDesativaRevisao';
import { atualizaRevisao } from './atualizaRevisao';
import { State } from '../../state';
import { ATUALIZAR_USUARIO } from '../../../model/lexml/acao/atualizarUsuarioAction';
import { atualizaUsuario } from './atualizaUsuario';

export const elementoReducer = (state = {}, action: any): any => {
  let tempState: State;

  let usuario = (state as State).usuario;
  let actionType = action.type;
  let emRevisao = (state as State).emRevisao;
  const revisoes = (state as State).revisoes || [];
  let numEventosPassadosAntesDaRevisao = (state as State).numEventosPassadosAntesDaRevisao || 0;

  switch (action.type) {
    case ADICIONAR_AGRUPADOR_ARTIGO:
      tempState = agrupaElemento(state, action);
      break;
    case INFORMAR_EXISTENCIA_NA_NORMA:
      tempState = informaExistenciaDoElementoNaNorma(state, action);
      break;
    case ATUALIZAR_NOTA_ALTERACAO:
      tempState = atualizaNotaAlteracao(state, action);
      break;
    case APLICAR_ALTERACOES_EMENDA:
      tempState = aplicaAlteracoesEmenda(state, action);
      break;
    case ASSISTENTE_ALTERACAO:
      tempState = adicionaAlteracaoComAssistente(state, action);
      break;
    case ATUALIZAR_ELEMENTO:
      tempState = atualizaElemento(state, action);
      break;
    case ATUALIZAR_REFERENCIA_ELEMENTO:
      tempState = atualizaReferenciaElemento(state, action);
      break;
    case ATUALIZAR_TEXTO_ELEMENTO:
      tempState = atualizaTextoElemento(state, action);
      break;
    case AUTO_FIX:
      tempState = autoFixElemento(state, action);
      break;
    case ADICIONAR_ELEMENTO:
      tempState = adicionaElemento(state, action);
      break;
    case ADICIONAR_ELEMENTOS_FROM_CLIPBOARD:
      tempState = adicionaElementosNaProposicaoFromClipboard(state, action);
      break;
    case AGRUPAR_ELEMENTO:
      tempState = agrupaElemento(state, action);
      break;
    case TRANSFORMAR_TIPO_ELEMENTO:
      tempState = transformaTipoElemento(state, action);
      break;
    case ELEMENTO_SELECIONADO:
      tempState = selecionaElemento(state, action);
      break;
    case INFORMAR_DADOS_ASSISTENTE:
      tempState = solicitaDadosAssistente(state, action);
      break;
    case INFORMAR_NORMA:
      tempState = solicitaNorma(state, action);
      break;
    case MOVER_ELEMENTO_ABAIXO:
      tempState = moveElementoAbaixo(state, action);
      break;
    case MOVER_ELEMENTO_ACIMA:
      tempState = moveElementoAcima(state, action);
      break;
    case RENUMERAR_ELEMENTO:
      tempState = renumeraElemento(state, action);
      break;
    case RESTAURAR_ELEMENTO:
      tempState = restauraElemento(state, action);
      break;
    case SUPRIMIR_AGRUPADOR:
      tempState = suprimeAgrupador(state, action);
      break;
    case SUPRIMIR_ELEMENTO:
      tempState = suprimeElemento(state, action);
      break;
    case ABRIR_ARTICULACAO:
      tempState = abreArticulacao(state, action);
      break;
    case REDO:
      tempState = redo(state);
      break;
    case REMOVER_ELEMENTO:
      tempState = removeElemento(state, action);
      break;
    case REMOVER_ELEMENTO_SEM_TEXTO:
      tempState = removeElementoSemTexto(state, action);
      break;
    case SHIFT_TAB:
    case TAB:
      tempState = modificaTipoElementoWithTab(state, action);
      break;
    case UNDO:
      tempState = undo(state);
      break;
    case VALIDAR_ELEMENTO:
      tempState = validaElemento(state, action);
      break;
    case VALIDAR_ARTICULACAO:
      tempState = validaArticulacao(state);
      break;
    case ADICIONAR_ALERTA:
      tempState = adicionaAlerta(state, action);
      break;
    case REMOVER_ALERTA:
      tempState = removeAlerta(state, action);
      break;
    case LIMPAR_ALERTAS:
      tempState = limparAlertas(state);
      break;
    case ATIVAR_DESATIVAR_REVISAO:
      tempState = ativaDesativaRevisao(state);
      emRevisao = tempState.emRevisao;
      numEventosPassadosAntesDaRevisao = tempState.past?.length || 0;
      break;
    case ATUALIZAR_USUARIO:
      tempState = atualizaUsuario(state, action);
      usuario = tempState.usuario;
      break;
    default:
      actionType = undefined;
      tempState = state as State;
      break;
  }

  if (actionType !== ABRIR_ARTICULACAO) {
    tempState.revisoes = revisoes;
  }
  tempState.emRevisao = emRevisao;
  tempState.usuario = usuario;

  tempState.numEventosPassadosAntesDaRevisao = emRevisao ? numEventosPassadosAntesDaRevisao : tempState.past?.length || 0;

  return atualizaRevisao(tempState, actionType);
};
