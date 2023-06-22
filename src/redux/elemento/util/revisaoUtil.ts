import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isCaput } from '../../../model/dispositivo/tipo';
import { Elemento, Referencia } from '../../../model/elemento';
import { getDispositivoFromElemento, createElemento } from '../../../model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acao/adicionarElementoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../model/lexml/acao/AdicionarElementosFromClipboardAction';
import { ativarDesativarRevisaoAction } from '../../../model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { REMOVER_ELEMENTO } from '../../../model/lexml/acao/removerElementoAction';
import { RESTAURAR_ELEMENTO } from '../../../model/lexml/acao/restaurarElemento';
import { SUPRIMIR_ELEMENTO } from '../../../model/lexml/acao/suprimirElemento';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { getDispositivoAndFilhosAsLista, isArticulacaoAlteracao, isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateType } from '../../state';

export const getRevisoesElemento = (revisoes: Revisao[] = []): RevisaoElemento[] => {
  return revisoes.filter(isRevisaoElemento).map(r => r as RevisaoElemento);
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

export const findRevisaoByElementoUuid2 = (revisoes: Revisao[] = [], uuid2 = ''): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes).find(r => r.elementoAposRevisao.uuid2 === uuid2);
};

export const findRevisaoByElementoLexmlId = (revisoes: Revisao[] = [], lexmlId = '?'): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes).find(r => r.elementoAposRevisao.lexmlId === lexmlId);
};

export const existeRevisaoParaElementos = (revisoes: Revisao[] = [], elementos: Elemento[]): boolean => {
  const revisoesElemento = getRevisoesElemento(revisoes);
  return elementos.every(e => revisoesElemento.some(r => r.elementoAposRevisao.uuid === e.uuid));
};

export const identificarRevisaoElementoPai = (state: State): Revisao[] => {
  const revisoes = state.revisoes;
  const result: Revisao[] = [];

  revisoes?.forEach(r => {
    if (isRevisaoElemento(r)) {
      const rAux = r as RevisaoElemento;
      const uuidPai = rAux.stateType === StateType.ElementoIncluido ? getUuidPaiElementoRevisado(state, rAux) : rAux.elementoAntesRevisao?.hierarquia?.pai?.uuid;
      // const uuidPai = getUuidPai(state, rAux.stateType === StateType.ElementoIncluido ? rAux.elementoAposRevisao : rAux.elementoAntesRevisao);
      const rPai = uuidPai ? findRevisaoByElementoUuid(revisoes, uuidPai) : undefined;
      if (rPai && isRevisaoMesmaSituacao(rAux, rPai)) {
        rAux.idRevisaoElementoPai = rPai.id;
        rAux.idRevisaoElementoPrincipal = findRevisaoElementoPrincipal(state, revisoes!, rPai)?.id;
      }
    }
    result.push(r);
  });

  return result;
};

export const findRevisaoElementoPrincipal = (state: State, revisoes: Revisao[], rPai: RevisaoElemento): RevisaoElemento | undefined => {
  const uuid = rPai.stateType === StateType.ElementoIncluido ? getUuidPaiElementoRevisado(state, rPai) : rPai.elementoAntesRevisao?.hierarquia?.pai?.uuid;
  const rAux = rPai && findRevisaoByElementoUuid(revisoes, uuid);
  return rAux ? findRevisaoElementoPrincipal(state, revisoes, rAux) : rPai;
};

export const buildDescricaoRevisao = (revisao: Revisao): string => {
  return isRevisaoElemento(revisao) ? buildDescricaoRevisaoElemento(revisao as RevisaoElemento) : buildDescricaoRevisaoTexto(revisao);
};

const mapperActionTypeToDescricao = {
  [ADICIONAR_ELEMENTO]: (): string => 'Dispositivo adicionado',
  [REMOVER_ELEMENTO]: (): string => 'Dispositivo removido',
  [SUPRIMIR_ELEMENTO]: (): string => 'Dispositivo suprimido',
  [ATUALIZAR_TEXTO_ELEMENTO]: (): string => 'Texto do dispositivo foi alterado',
  [MOVER_ELEMENTO_ABAIXO]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromMovimentacaoElemento(revisao),
  [MOVER_ELEMENTO_ACIMA]: (): string => 'Dispositivo movido',
  [RESTAURAR_ELEMENTO]: (): string => 'Dispositivo restaurado',
  [ADICIONAR_ELEMENTOS_FROM_CLIPBOARD]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromStateType(revisao),
  [UNDO]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromStateType(revisao),
  [REDO]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromStateType(revisao),
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
  const fn = mapperActionTypeToDescricao[revisao.actionType];
  return fn ? mapperActionTypeToDescricao[revisao.actionType](revisao) : buildDescricaoRevisaoFromStateType(revisao);
};

export const buildDescricaoRevisaoTexto = (revisao: Revisao): string => {
  return revisao.descricao ?? '';
};

export const buildDescricaoRevisaoFromMovimentacaoElemento = (revisao: RevisaoElemento): string => {
  const { tipo, rotulo } = revisao.elementoAntesRevisao || { tipo: '', numero: 0 };
  return `Dispositivo movido${tipo ? ` (antes era "${tipo} ${rotulo}")` : ''}`;
};

export const buildDescricaoRevisaoFromStateType = (revisao: RevisaoElemento, elementoAposRevisao?: Elemento): string => {
  const isUndoRedoDeMovimentacao = revisao.elementoAntesRevisao && elementoAposRevisao && revisao.elementoAntesRevisao.numero !== elementoAposRevisao.numero;
  return isUndoRedoDeMovimentacao ? buildDescricaoRevisaoFromMovimentacaoElemento(revisao) : mapperStateTypeToDescricao[revisao.stateType]();
};

const getUuidPaiElementoRevisado = (state: State, revisao: RevisaoElemento): number => {
  // return revisao.elementoAposRevisao.hierarquia?.pai?.uuid || 0;
  return getUuidPai(state, revisao.elementoAposRevisao) || 0;
};

const getUuidPai = (state: State, elemento?: Partial<Elemento>): number | undefined => {
  const d = getDispositivoFromElemento(state.articulacao!, elemento!)!;
  if (isDispositivoAlteracao(d)) {
    return isArticulacaoAlteracao(d.pai!) || isCaput(d.pai!) ? d.pai?.pai?.uuid : d.pai?.uuid;
  } else {
    return isCaput(d.pai!) ? d.pai?.pai?.uuid : d.pai?.uuid;
  }
};

const isRevisaoMesmaSituacao = (r: RevisaoElemento, rPai: RevisaoElemento): boolean => {
  // return r.stateType !== StateType.ElementoModificado && rPai.elementoAntesRevisao?.descricaoSituacao === r.elementoAntesRevisao?.descricaoSituacao;
  return (
    r.stateType !== StateType.ElementoModificado && rPai.elementoAntesRevisao?.descricaoSituacao === r.elementoAntesRevisao?.descricaoSituacao && r.stateType === rPai.stateType
  );
};

export const getRevisoesElementoAssociadas = (revisoes: Revisao[] = [], revisao: RevisaoElemento): RevisaoElemento[] => {
  return [revisao, ...getRevisoesElemento(revisoes).filter(r => r.idRevisaoElementoPrincipal === revisao.id)];
};

export const getElementosFromRevisoes = (revisoes: Revisao[] = [], state?: State): Elemento[] => {
  return revisoes.filter(isRevisaoElemento).map(r => {
    const e = (r as RevisaoElemento).elementoAposRevisao! as Elemento;
    return state ? createElemento(getDispositivoFromElemento(state.articulacao!, e)!) : e;
  });
};

export const isRevisaoElemento = (revisao: Revisao): boolean => 'elementoAposRevisao' in revisao;

export const isRevisaoJustificativa = (revisao: Revisao): boolean => !isRevisaoElemento(revisao);

export const existeFilhoExcluidoDuranteRevisao = (state: State, dispositivo: Dispositivo): boolean => {
  if (!state.revisoes?.length) {
    return false;
  }
  const uuids = getDispositivoAndFilhosAsLista(dispositivo).map(d => d.uuid);
  return state.revisoes
    .filter(r => isRevisaoElemento(r) && isRevisaoDeExclusao(r as RevisaoElemento))
    .map(r => r as RevisaoElemento)
    .some(r => uuids.includes(r.elementoAntesRevisao?.uuid) || uuids.includes(r.elementoAntesRevisao?.hierarquia?.pai?.uuid));
};

export const existeFilhoExcluidoOuAlteradoDuranteRevisao = (state: State, dispositivo: Dispositivo): boolean => {
  if (!state.revisoes?.length) {
    return false;
  }
  const uuids = getDispositivoAndFilhosAsLista(dispositivo).map(d => d.uuid);
  return state.revisoes
    .filter(isRevisaoElemento)
    .map(r => r as RevisaoElemento)
    .some(r => uuids.includes(r.elementoAntesRevisao?.uuid) || uuids.includes(r.elementoAntesRevisao?.hierarquia?.pai?.uuid));
};

export const isRevisaoPrincipal = (revisao: Revisao): boolean => isRevisaoElemento(revisao) && !(revisao as RevisaoElemento).idRevisaoElementoPrincipal;

export const existeRevisaoCriadaPorExclusao = (revisoes: Revisao[] = []): boolean => revisoes.some(r => isRevisaoDeExclusao(r as RevisaoElemento));

export enum RevisaoJustificativaEnum {
  JustificativaAlterada = 'Justificativa Alterada',
}

export const ordernarRevisoes = (revisoes: Revisao[] = []): Revisao[] => {
  const result: Revisao[] = revisoes.filter(r => isRevisaoElemento(r) && !isRevisaoDeExclusao(r as RevisaoElemento));
  result.push(...getRevisoesDeExclusaoOrdenadasPorUuid(revisoes));
  result.push(...revisoes.filter(isRevisaoJustificativa));
  return result;
};

const getRevisoesDeExclusaoOrdenadasPorUuid = (revisoes: Revisao[] = []): Revisao[] => {
  return revisoes
    .filter(r => isRevisaoElemento(r) && isRevisaoDeExclusao(r as RevisaoElemento))
    .sort((r1, r2) => (r1 as RevisaoElemento).elementoAposRevisao.uuid! - (r2 as RevisaoElemento).elementoAposRevisao.uuid!);
};

export const isRevisaoDeExclusao = (revisao: RevisaoElemento): boolean => revisao.stateType === StateType.ElementoRemovido;

export const removeAtributosDoElemento = (elemento: Partial<Elemento> | undefined): void => {
  if (!elemento) {
    return;
  }

  delete elemento.acoesPossiveis;
  delete elemento.tiposAgrupadoresQuePodemSerInseridosAntes;
  delete elemento.tiposAgrupadoresQuePodemSerInseridosDepois;

  removeAtributosDoElementoAnteriorNaSequenciaDeLeitura(elemento.elementoAnteriorNaSequenciaDeLeitura);
};

const atributosPermtidos = ['tipo', 'uuid', 'uuid2', 'lexmlId', 'conteudo', 'descricaoSituacao', 'uuidAlteracao', 'uuid2Alteracao', 'existeNaNormaAlterada'];

const removeAtributosDoElementoAnteriorNaSequenciaDeLeitura = (elemento: Partial<Elemento> | undefined): void => {
  if (!elemento) {
    return;
  }

  for (const key in elemento) {
    if (!atributosPermtidos.includes(key)) {
      delete elemento[key];
    }
  }
};

export const getQuantidadeRevisoes = (rootStore: any): number => {
  const state = rootStore.getState().elementoReducer as any;

  if (state.revisoes) {
    //const qtdRevisoesJustificativa = state.revisoes.filter(e => e.descricao === RevisaoJustificativaEnum.JustificativaAlterada).length;
    const qtdRevisoes = state.revisoes.filter(e => e.idRevisaoElementoPrincipal === undefined && e.descricao !== RevisaoJustificativaEnum.JustificativaAlterada).length;
    //return qtdRevisoesJustificativa > 0 ? qtdRevisoes + 1 : qtdRevisoes;
    return qtdRevisoes;
  }
  return 0;
};

const getQuantidadeRevisoesJustificativa = (rootStore: any): number => {
  const state = rootStore.getState().elementoReducer as any;
  return state.revisoes.filter(e => e.descricao === RevisaoJustificativaEnum.JustificativaAlterada).length;
};

const mostrarDialogDisclaimerRevisao = (rootStore: any): void => {
  if (localStorage.getItem('naoMostrarNovamenteDisclaimerMarcaAlteracao') !== 'true' && !rootStore.getState().elementoReducer.emRevisao) {
    const dialog = document.createElement('sl-dialog');
    dialog.label = 'Marcas de revisão';
    const botoesHtml = ` <sl-button slot="footer" variant="primary" id="closeButton">Fechar</sl-button>`;
    dialog.innerHTML = `
      Todas as alterações realizadas no texto serão registradas e ficarão disponíveis para consulta.
      Esta é uma versão inicial da funcionalidade de controle de alterações/marcas de revisão.
      <br><br>
      <sl-switch id="chk-nao-mostrar-modal-novamente">Não mostrar mais essa mensagem</sl-switch>
    `.concat(botoesHtml);
    document.body.appendChild(dialog);
    dialog.show();

    dialog.addEventListener('sl-request-close', (event: any) => {
      if (event.detail.source === 'overlay') {
        event.preventDefault();
      }
    });

    const chkNaoMostrarNovamente = dialog.querySelector('#chk-nao-mostrar-modal-novamente') as any;
    chkNaoMostrarNovamente?.addEventListener('sl-change', () => {
      salvaNoNavegadorOpcaoNaoMostrarNovamente();
    });

    const closeButton = dialog.querySelector('#closeButton[slot="footer"]');
    closeButton?.addEventListener('click', () => {
      dialog.hide();
      dialog.remove();
    });
  }
};

const salvaNoNavegadorOpcaoNaoMostrarNovamente = (): void => {
  const checkbox = document.getElementById('chk-nao-mostrar-modal-novamente') as any;
  if (checkbox) {
    localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', checkbox.checked ? 'true' : 'false');
  }
};

export const ativarDesativarMarcaDeRevisao = (rootStore: any): void => {
  mostrarDialogDisclaimerRevisao(rootStore);
  rootStore.dispatch(ativarDesativarRevisaoAction.execute());
};

export const atualizaQuantidadeRevisao = (rootStore: any, element: any, justificativa = false): void => {
  const quantidade = justificativa ? getQuantidadeRevisoesJustificativa(rootStore) : getQuantidadeRevisoes(rootStore);
  if (element) {
    element.innerHTML = quantidade;
  }
};

export const setCheckedElement = (element: any, checked: boolean): void => {
  if (element) {
    if (checked) {
      element.setAttribute('checked', '');
    } else {
      element.removeAttribute('checked');
    }
  }
};
