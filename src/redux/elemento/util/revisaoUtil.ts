import { Elemento, Referencia } from '../../../model/elemento';
import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { REMOVER_ELEMENTO } from '../../../model/lexml/acao/removerElementoAction';
import { RESTAURAR_ELEMENTO } from '../../../model/lexml/acao/restaurarElemento';
import { SUPRIMIR_ELEMENTO } from '../../../model/lexml/acao/suprimirElemento';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateType } from '../../state';

export const getRevisoesElemento = (revisoes: Revisao[] = []): RevisaoElemento[] => {
  return revisoes.filter(r => r instanceof RevisaoElemento).map(r => r as RevisaoElemento);
};

export const findRevisaoById = (revisoes: Revisao[] = [], idRevisao: string): Revisao | undefined => {
  return revisoes?.find(r => r.id === idRevisao);
};

export const findRevisaoByElemento = (revisoes: Revisao[] = [], elemento: Elemento | Referencia | undefined): RevisaoElemento | undefined => {
  const { uuid = 0, lexmlId = '?' } = elemento || {};
  return getRevisoesElemento(revisoes).find(r => r.elementoAposRevisao.uuid === uuid || r.elementoAposRevisao.lexmlId === lexmlId);
};

export const findRevisaoByElementoUuid = (revisoes: Revisao[] = [], uuid = 0): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes).find(r => r.elementoAposRevisao.uuid === uuid);
};

export const findRevisaoByElementoLexmlId = (revisoes: Revisao[] = [], lexmlId = '?'): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes).find(r => r.elementoAposRevisao.lexmlId === lexmlId);
};

export const existeRevisaoParaElementos = (revisoes: Revisao[] = [], elementos: Elemento[]): boolean => {
  const revisoesElemento = getRevisoesElemento(revisoes);
  return elementos.every(e => revisoesElemento.some(r => r.elementoAposRevisao.uuid === e.uuid));
};

export const montarListaDeRevisoesParaRemover = (state: State, revisao: Revisao): Revisao[] => {
  const result = [revisao];
  if (revisao.idsRevisoesAssociadas.length) {
    revisao.idsRevisoesAssociadas.forEach(id => {
      const revisaoAssociada = findRevisaoById(state.revisoes, id);
      revisaoAssociada && result.push(revisaoAssociada);
    });
  }
  return result;
};

export const identificarRevisaoElementoPai = (revisoes: Revisao[] = []): Revisao[] => {
  const result: Revisao[] = [];

  revisoes.forEach(r => {
    if (r instanceof RevisaoElemento) {
      const uuidPai = r.stateType === StateType.ElementoIncluido ? getUuidPaiElementoRevisado(r) : r.elementoAntesRevisao?.hierarquia?.pai?.uuid;
      const rPai = uuidPai ? findRevisaoByElementoUuid(revisoes, uuidPai) : undefined;
      if (rPai && isRevisaoMesmaSituacao(r, rPai)) {
        r.idRevisaoElementoPai = rPai.id;
        r.idRevisaoElementoPrincipal = findRevisaoElementoPrincipal(revisoes!, rPai)?.id;
      }
    }
    result.push(r);
  });

  return result;
};

export const findRevisaoElementoPrincipal = (revisoes: Revisao[], rPai: RevisaoElemento): RevisaoElemento | undefined => {
  const uuid = rPai.stateType === StateType.ElementoIncluido ? getUuidPaiElementoRevisado(rPai) : rPai.elementoAntesRevisao?.hierarquia?.pai?.uuid;
  const rAux = rPai && findRevisaoByElementoUuid(revisoes, uuid);
  return rAux ? findRevisaoElementoPrincipal(revisoes, rAux) : rPai;
};

export const buildDescricaoRevisao = (revisao: Revisao): string => {
  return revisao instanceof RevisaoElemento ? buildDescricaoRevisaoElemento(revisao) : buildDescricaoRevisaoTexto(revisao);
};

const mapperActionTypeToDescricao = {
  [ADICIONAR_ELEMENTO]: (): string => 'Dispositivo adicionado',
  [REMOVER_ELEMENTO]: (): string => 'Dispositivo removido',
  [SUPRIMIR_ELEMENTO]: (): string => 'Dispositivo suprimido',
  [ATUALIZAR_TEXTO_ELEMENTO]: (): string => 'Texto do dispositivo foi alterado',
  [MOVER_ELEMENTO_ABAIXO]: (revisao: RevisaoElemento): string => buildDescricaoMovimentacaoElemento(revisao),
  [MOVER_ELEMENTO_ACIMA]: (): string => 'Dispositivo movido',
  [RESTAURAR_ELEMENTO]: (): string => 'Dispositivo restaurado',
  [UNDO]: (revisao: RevisaoElemento): string => buildDescricaoUndoRedoRevisaoElemento(revisao),
  [REDO]: (revisao: RevisaoElemento): string => buildDescricaoUndoRedoRevisaoElemento(revisao),
};

const mapperStateTypeToDescricao = {
  [StateType.ElementoIncluido]: (): string => 'Dispositivo incluído',
  [StateType.ElementoRemovido]: (): string => 'Dispositivo removido',
  [StateType.ElementoRestaurado]: (): string => 'Dispositivo restaurado',
  [StateType.ElementoModificado]: (): string => 'Texto do dispositivo foi alterado',
  [StateType.ElementoSuprimido]: (): string => 'Dispositivo suprimido',
  // [StateType.ElementoMovido]: (): string => 'Dispositivo movido',
};

export const buildDescricaoRevisaoElemento = (revisao: RevisaoElemento): string => {
  return mapperActionTypeToDescricao[revisao.actionType](revisao);
};

export const buildDescricaoRevisaoTexto = (revisao: Revisao): string => {
  return revisao.descricao ?? '';
};

export const buildDescricaoMovimentacaoElemento = (revisao: RevisaoElemento): string => {
  const { tipo, numero } = revisao.elementoAntesRevisao || { tipo: '', numero: 0 };
  return `Dispositivo movido${tipo ? ` (antes era ${tipo} ${numero})` : ''}`;
};

export const buildDescricaoUndoRedoRevisaoElemento = (revisao: RevisaoElemento, elementoAposRevisao?: Elemento): string => {
  const isUndoRedoDeMovimentacao = revisao.elementoAntesRevisao && elementoAposRevisao && revisao.elementoAntesRevisao.numero !== elementoAposRevisao.numero;
  return isUndoRedoDeMovimentacao ? buildDescricaoMovimentacaoElemento(revisao) : mapperStateTypeToDescricao[revisao.stateType]();
};

const getUuidPaiElementoRevisado = (revisao: RevisaoElemento): number => {
  return revisao.elementoAposRevisao.hierarquia?.pai?.uuid || 0;
};

const isRevisaoMesmaSituacao = (r: RevisaoElemento, rPai: RevisaoElemento): boolean => {
  return r.stateType !== StateType.ElementoModificado && rPai.elementoAntesRevisao?.descricaoSituacao === r.elementoAntesRevisao?.descricaoSituacao;
};
