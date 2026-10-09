import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArtigo, isCaput } from '../../../model/dispositivo/tipo';
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
import { UNDO } from '../../../model/lexml/acao/undoAction';
import {
  findDispositivoByUuid,
  findDispositivoByUuid2,
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  getUltimoFilho,
  isArticulacaoAlteracao,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { unificarEvento } from '../evento/eventosUtil';
import { buildPast } from './stateReducerUtil';

export const getRevisoesElemento = (revisoes: Revisao[] = []): RevisaoElemento[] => {
  return revisoes.filter(isRevisaoElemento).map(r => r as RevisaoElemento);
};

export const findRevisaoById = (revisoes: Revisao[] = [], idRevisao: string): Revisao | undefined => {
  return revisoes?.find(r => r.id === idRevisao);
};

export const findRevisaoByElementoUuid = (revisoes: Revisao[] = [], uuid = 0): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes)
    .filter(r => r.elementoAposRevisao.uuid === uuid)
    .slice(-1)[0];
};

export const findRevisaoByElementoUuidAndStateType = (revisoes: Revisao[] = [], uuid = 0, stateType: StateType): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes)
    .filter(r => r.elementoAposRevisao.uuid === uuid && r.stateType === stateType)
    .slice(-1)[0];
};

export const findRevisaoByElementoUuid2 = (revisoes: Revisao[] = [], uuid2 = ''): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes)
    .filter(r => r.elementoAposRevisao.uuid2 === uuid2)
    .slice(-1)[0];
};

export const findRevisoesByElementoUuid = (revisoes: Revisao[] = [], uuid = 0): RevisaoElemento[] => {
  return getRevisoesElemento(revisoes).filter(r => r.elementoAposRevisao.uuid === uuid);
};

export const findRevisoesByElementoUuid2 = (revisoes: Revisao[] = [], uuid2 = ''): RevisaoElemento[] => {
  return getRevisoesElemento(revisoes).filter(r => r.elementoAposRevisao.uuid2 === uuid2);
};

export const findRevisoesByElementoLexmlId = (revisoes: Revisao[] = [], lexmlId = ''): RevisaoElemento[] => {
  return getRevisoesElemento(revisoes).filter(r => r.elementoAposRevisao.lexmlId === lexmlId);
};

export const findRevisaoByElementoLexmlId = (revisoes: Revisao[] = [], lexmlId = '?'): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes)
    .filter(r => r.elementoAposRevisao.lexmlId === lexmlId)
    .slice(-1)[0];
};

export const existeRevisaoParaElementos = (revisoes: Revisao[] = [], elementos: Elemento[]): boolean => {
  const revisoesElemento = getRevisoesElemento(revisoes);
  return elementos.some(e => revisoesElemento.some(r => r.elementoAposRevisao.uuid === e.uuid));
};

export const identificarRevisaoElementoPai = (state: State, revisoes: Revisao[]): Revisao[] => {
  const result: Revisao[] = [];

  revisoes?.forEach(r => {
    if (isRevisaoElemento(r)) {
      const rAux = r as RevisaoElemento;
      const uuidPai = rAux.stateType === StateType.ElementoIncluido ? getUuidPaiElementoRevisado(state, rAux) : rAux.elementoAntesRevisao?.hierarquia?.pai?.uuid;
      const rPai = uuidPai ? findRevisaoByElementoUuid(rAux.actionType === ADICIONAR_ELEMENTO ? state.revisoes : revisoes, uuidPai) : undefined;
      if (rPai && isRevisaoMesmoStateType(rAux, rPai)) {
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
  [ATUALIZAR_TEXTO_ELEMENTO]: (): string => 'Texto do dispositivo foi alterado',
  [MOVER_ELEMENTO_ABAIXO]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromMovimentacaoElemento(revisao),
  [MOVER_ELEMENTO_ACIMA]: (): string => 'Dispositivo movido',
  [ADICIONAR_ELEMENTOS_FROM_CLIPBOARD]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromStateType(revisao),
  [UNDO]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromStateType(revisao),
  [REDO]: (revisao: RevisaoElemento): string => buildDescricaoRevisaoFromStateType(revisao),
};

const mapperStateTypeToDescricao = {
  [StateType.ElementoIncluido]: (): string => 'Dispositivo adicionado',
  [StateType.ElementoRemovido]: (): string => 'Dispositivo removido',
  [StateType.ElementoModificado]: (): string => 'Texto do dispositivo foi alterado',
  // [StateType.ElementoMovido]: (): string => 'Dispositivo movido',
};

export const buildDescricaoRevisaoElemento = (revisao: RevisaoElemento): string => {
  if (revisao.stateType === StateType.ElementoModificado && getOperacoesRevisao(revisao.revisao).some(o => o.nome === OPERACAO_ALTERACAO_ROTULO)) {
    return buildDescricaoRevisaoDeRotulo(revisao);
  }
  const fn = mapperActionTypeToDescricao[revisao.actionType];
  return fn ? mapperActionTypeToDescricao[revisao.actionType](revisao) : buildDescricaoRevisaoFromStateType(revisao);
};

export const buildDescricaoRevisaoTexto = (revisao: Revisao): string => {
  return revisao.descricao ?? '';
};

const buildDescricaoRevisaoDeRotulo = (revisao: RevisaoElemento): string => {
  const rotuloAnterior = revisao.elementoAntesRevisao?.rotulo;
  const combinada = getOperacoesRevisao(revisao.revisao).some(o => o.nome === OPERACAO_ALTERADO);
  return `${combinada ? 'Rótulo e texto do dispositivo foram alterados' : 'Rótulo do dispositivo foi alterado'}${rotuloAnterior ? ` (rótulo antes era "${rotuloAnterior}")` : ''}`;
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
  if (!d) {
    return undefined;
  } else if (isDispositivoAlteracao(d)) {
    return isArticulacaoAlteracao(d.pai!) || isCaput(d.pai!) ? d.pai?.pai?.uuid : d.pai?.uuid;
  } else {
    return isCaput(d.pai!) ? d.pai?.pai?.uuid : d.pai?.uuid;
  }
};

const isRevisaoMesmoStateType = (r: RevisaoElemento, rPai: RevisaoElemento): boolean => {
  return r.stateType !== StateType.ElementoModificado && r.stateType === rPai.stateType;
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

export const getRevisoesFromElementos = (elementos: Elemento[] = []): RevisaoElemento[] => elementos!.map(e => e.revisao! as RevisaoElemento);

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
  JustificativaAlterada = 'Justificação Alterada',
}

export enum RevisaoTextoLivreEnum {
  TextoLivreAlterado = 'Texto Livre Alterado',
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

const atributosPermitidos = ['tipo', 'uuid', 'uuid2', 'lexmlId', 'conteudo', 'descricaoSituacao', 'uuidAlteracao', 'uuid2Alteracao', 'existeNaNormaAlterada'];

export const removeAtributosDoElementoAnteriorNaSequenciaDeLeitura = (elemento: Partial<Elemento> | undefined): void => {
  if (!elemento) {
    return;
  }

  for (const key in elemento) {
    if (!atributosPermitidos.includes(key)) {
      delete elemento[key];
    }
  }
};

export const getQuantidadeRevisoes = (revisoes: Revisao[] = []): number => {
  return revisoes.filter(isRevisaoPrincipal).length;
};

export const getQuantidadeRevisoesJustificativa = (revisoes: Revisao[] = []): number => {
  return revisoes.filter(e => e.descricao === RevisaoJustificativaEnum.JustificativaAlterada).length;
};

export const mostrarDialogDisclaimerRevisao = (): void => {
  if (localStorage.getItem('naoMostrarNovamenteDisclaimerMarcaAlteracao') !== 'true') {
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

export const getQuantidadeRevisoesTextoLivre = (revisoes: Revisao[] = []): number => {
  return revisoes.filter(e => e.descricao === RevisaoTextoLivreEnum.TextoLivreAlterado).length;
};

export const getQuantidadeRevisoesAll = (revisoesDispositivos: Revisao[] = []): number => {
  const cursorCode = 65279;

  const listaRevisoes = document.querySelectorAll('ins, del') || [];
  const revisoes = [] as any;

  for (let index = 0; index < listaRevisoes.length; index++) {
    const revisao = listaRevisoes[index] as any;
    if (revisao.innerText?.charCodeAt(0) !== cursorCode) {
      revisoes.push(revisao);
    }
  }

  return revisoes.length + getQuantidadeRevisoes(revisoesDispositivos);
};

const salvaNoNavegadorOpcaoNaoMostrarNovamente = (): void => {
  const checkbox = document.getElementById('chk-nao-mostrar-modal-novamente') as any;
  if (checkbox) {
    localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', checkbox.checked ? 'true' : 'false');
  }
};

export const ativarDesativarMarcaDeRevisao = (rootStore: any, quantidade: number): void => {
  rootStore.dispatch(ativarDesativarRevisaoAction.execute(quantidade));
};

export const atualizaQuantidadeRevisao = (revisoes: Revisao[] = [], element: any): void => {
  const quantidade = getQuantidadeRevisoes(revisoes);
  if (element) {
    element.innerHTML = quantidade;
  }
};

export const atualizaQuantidadeRevisaoTextoRico = (quantidade: number, element: any): void => {
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

export const atualizaReferenciaElementoAnteriorSeNecessario = (articulacao: Articulacao, revisoes: Revisao[] = [], elemento: Elemento, tipoProcessamento: string): void => {
  // Procura o elemento anterior ao excluído/incluído nos elementos anteriores das outras revisões.
  const rAux = findRevisaoDeExclusaoComElementoAnteriorApontandoPara(revisoes, elemento.elementoAnteriorNaSequenciaDeLeitura!);
  if (rAux) {
    if (tipoProcessamento === 'exclusao') {
      // O excluído entra depois do último da cadeia de excluídos que partem do mesmo anterior, e não depois do primeiro.
      const ultimaDaCadeia = seguirCadeiaDeExcluidos(revisoes, rAux);
      elemento.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(findUltimaRevisaoDoGrupo(revisoes, ultimaDaCadeia).elementoAposRevisao));
      removeAtributosDoElementoAnteriorNaSequenciaDeLeitura(elemento.elementoAnteriorNaSequenciaDeLeitura!);
    } else {
      // Pega o último filho do elemento incluído e utiliza como elemento anterior da revisão principal (rAux)
      const dPrimeiroElementoIncluido = getDispositivoFromElemento(articulacao, elemento)!;
      const ultimoFilho = createElemento(getUltimoFilho(dPrimeiroElementoIncluido));
      removeAtributosDoElementoAnteriorNaSequenciaDeLeitura(ultimoFilho);
      rAux.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = ultimoFilho;
      rAux.elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = ultimoFilho;

      const ePrimeiroElementoIncluido = createElemento(dPrimeiroElementoIncluido);
      if (isAtualizarPosicaoDeElementoExcluido(ePrimeiroElementoIncluido, rAux.elementoAposRevisao)) {
        rAux.elementoAposRevisao.hierarquia!.posicao = ePrimeiroElementoIncluido.hierarquia!.posicao! + 1;
        rAux.elementoAntesRevisao!.hierarquia!.posicao = ePrimeiroElementoIncluido.hierarquia!.posicao! + 1;
      }
    }
  }
};

export const findRevisaoDeExclusaoComElementoAnteriorApontandoPara = (revisoes: Revisao[] = [], elementoAnteriorNaSequenciaDeLeitura: Referencia): RevisaoElemento | undefined => {
  return revisoes
    .filter(isRevisaoElemento)
    .map(r => r as RevisaoElemento)
    .filter(isRevisaoDeExclusao)
    .find(r => r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!.uuid === elementoAnteriorNaSequenciaDeLeitura.uuid);
};

export const findUltimaRevisaoDoGrupo = (revisoes: Revisao[] = [], revisao: RevisaoElemento): RevisaoElemento => {
  return (
    revisoes
      .map(r => r as RevisaoElemento)
      .filter(r => r.idRevisaoElementoPrincipal === revisao.id)
      .slice(-1)[0] || revisao
  );
};

// Excluídos vizinhos formam uma cadeia: cada um tem como anterior o último elemento do excluído que o precede.
const seguirCadeiaDeExcluidos = (revisoes: Revisao[], inicio: RevisaoElemento): RevisaoElemento => {
  const principais = revisoes
    .filter(isRevisaoElemento)
    .map(r => r as RevisaoElemento)
    .filter(r => isRevisaoDeExclusao(r) && isRevisaoPrincipal(r));
  const visitadas = new Set<RevisaoElemento>();
  let atual = inicio;
  while (!visitadas.has(atual)) {
    visitadas.add(atual);
    const ultimoDoGrupo = findUltimaRevisaoDoGrupo(revisoes, atual).elementoAposRevisao;
    const seguinte = principais.find(r => !visitadas.has(r) && r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.uuid === ultimoDoGrupo.uuid);
    if (!seguinte) {
      break;
    }
    atual = seguinte;
  }
  return atual;
};

export const isRevisaoDeMovimentacao = (revisao: Revisao): boolean => {
  const r = revisao as RevisaoElemento;
  return !!(
    isRevisaoElemento(revisao) &&
    r.stateType === StateType.ElementoIncluido &&
    r.elementoAntesRevisao &&
    r.elementoAposRevisao &&
    r.elementoAntesRevisao.tipo === r.elementoAposRevisao.tipo
  );
};

export const isRevisaoDeTransformacao = (revisao: Revisao): boolean => {
  const r = revisao as RevisaoElemento;
  return !!(isRevisaoElemento(revisao) && r.elementoAntesRevisao && r.elementoAposRevisao && r.elementoAntesRevisao.tipo !== r.elementoAposRevisao.tipo);
};

export const isRevisaoDeModificacao = (revisao: Revisao): boolean => {
  return isRevisaoElemento(revisao) && (revisao as RevisaoElemento).stateType === StateType.ElementoModificado;
};

export const isAtualizarPosicaoDeElementoExcluido = (elementoIncluido: Elemento, elementoExcluido: Partial<Elemento>): boolean => {
  return elementoIncluido.hierarquia?.pai?.lexmlId === elementoExcluido.hierarquia?.pai?.lexmlId && elementoIncluido.uuid! < elementoExcluido.uuid!;
};

export const associarRevisoesAosElementosDosEventos = (state: State): void => {
  state.ui?.events
    .filter(se => se.stateType !== StateType.RevisaoRejeitada)
    .filter(se => se.stateType !== StateType.RevisaoAdicionalRejeitada)
    .forEach(se => associarRevisoesAosElementos(state.revisoes, se.elementos));
};

export const associarRevisoesAosElementos = (revisoes: Revisao[] = [], elementos: Elemento[] = []): void => {
  elementos.filter(Boolean).forEach(e => {
    const r = findRevisaoByElementoUuid(revisoes, e.uuid);
    e.revisao = r ? JSON.parse(JSON.stringify(r)) : undefined;
  });
};

export const mergeEventosStatesAposAceitarOuRejeitarMultiplasRevisoes = (state: State, tempStates: State[], revisoes: Revisao[], operacao: 'aceitar' | 'rejeitar'): State => {
  const eventosParaUnificar = {
    aceitar: [StateType.ElementoValidado],
    rejeitar: [
      StateType.ElementoIncluido,
      StateType.ElementoRemovido,
      StateType.ElementoRenumerado,
      StateType.ElementoValidado,
      StateType.ElementoSelecionado,
      StateType.ElementoMarcado,
      StateType.SituacaoElementoModificada,
    ],
  };

  let eventosPast: StateEvent[] = [];
  let eventos: StateEvent[] = [];

  tempStates.forEach(tempState => {
    eventosPast.push(...(tempState.past![0] as any as StateEvent[]));
    eventos.push(...tempState.ui!.events);
  });

  const tempState: State = { ...state };

  eventosParaUnificar[operacao].forEach(stateType => {
    eventosPast = unificarEvento(tempState, eventosPast, stateType);
    eventos = unificarEvento(tempState, eventos, stateType);
  });

  const idsRevisoes = revisoes.map(r => r.id);

  tempState.past = buildPast(tempState, eventosPast);
  tempState.present = eventos;
  tempState.future = [];
  tempState.ui = {
    events: eventos,
    alertas: state.ui?.alertas,
  };
  tempState.revisoes = state.revisoes?.filter((r: Revisao) => !idsRevisoes.includes(r.id));

  return tempState;
};

export const countRevisoesByType = (revisoes: Revisao[] = [], type: string): number => {
  return revisoes.filter(r => r.type === type).length;
};

export const OPERACAO_ADICIONADO = 'adicionado';
export const OPERACAO_EXCLUIDO = 'excluido';
export const OPERACAO_ALTERADO = 'alterado';
export const OPERACAO_MOVIDO = 'movido';
export const OPERACAO_TRANSFORMADO = 'transformado';
export const OPERACAO_ALTERACAO_ROTULO = 'alteracaoRotulo';

export interface OperacaoRevisao {
  nome: string;
  argumento?: string;
}

export const getOperacoesRevisao = (revisao?: string): OperacaoRevisao[] =>
  (revisao ?? '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
    .map(o => {
      const sep = o.indexOf(';');
      return sep < 0 ? { nome: o } : { nome: o.substring(0, sep), argumento: o.substring(sep + 1) };
    });

export const formatarOperacoesRevisao = (operacoes: OperacaoRevisao[]): string => operacoes.map(o => (o.argumento === undefined ? o.nome : `${o.nome};${o.argumento}`)).join(',');

// Operação já presente não se repete: o argumento fica o da primeira ocorrência.
export const anexarOperacaoRevisao = (revisao: string | undefined, nome: string, argumento?: string): string => {
  const operacoes = getOperacoesRevisao(revisao);
  return formatarOperacoesRevisao(operacoes.some(o => o.nome === nome) ? operacoes : [...operacoes, { nome, argumento }]);
};

export const removerOperacaoRevisao = (revisao: string | undefined, nome: string): string => formatarOperacoesRevisao(getOperacoesRevisao(revisao).filter(o => o.nome !== nome));

const nomeTipoNaRevisao = (tipo?: string): string => (tipo ?? '').toLowerCase();

const isMesmoPai = (a?: Referencia, b?: Referencia): boolean => (a?.uuid2 !== undefined && b?.uuid2 !== undefined ? a.uuid2 === b.uuid2 : a?.uuid === b?.uuid);

const isMesmoLugar = (antes: Partial<Elemento>, apos: Partial<Elemento>): boolean =>
  isMesmoPai(antes.hierarquia?.pai, apos.hierarquia?.pai) && antes.hierarquia?.posicao === apos.hierarquia?.posicao;

// Artigo: sequencial entre todos os artigos da articulação; demais: posição entre os filhos do pai (iniciando em 1).
export const getPosicaoOriginalParaMovimentacao = (state: State, antes: Partial<Elemento>, apos: Partial<Elemento>): number => {
  const posicaoLocal = (antes.hierarquia?.posicao ?? 0) + 1;
  if (apos.tipo !== 'Artigo' || !state.articulacao) {
    return posicaoLocal;
  }

  const movido = getDispositivoFromElemento(state.articulacao, apos);
  const paiAntes = antes.hierarquia?.pai;
  if (!movido || !paiAntes) {
    return posicaoLocal;
  }

  const raiz = getArticulacao(movido);
  const paiAntigo = paiAntes.tipo === 'Articulacao' ? raiz : (paiAntes.uuid2 && findDispositivoByUuid2(raiz, paiAntes.uuid2)) || findDispositivoByUuid(raiz, paiAntes.uuid!, true);
  if (!paiAntigo) {
    return posicaoLocal;
  }

  // O marcador é o irmão que ocupa o lugar de origem quando o movido não está mais entre os filhos.
  const lista = getDispositivoAndFilhosAsLista(raiz);
  const marcador = paiAntigo.filhos.filter(f => f !== movido)[antes.hierarquia?.posicao ?? 0];
  const indice = marcador ? lista.indexOf(marcador) : lista.indexOf(paiAntigo) + getDispositivoAndFilhosAsLista(paiAntigo).length;
  if (indice < 0) {
    return posicaoLocal;
  }

  const emAlteracao = isDispositivoAlteracao(movido);
  return lista.slice(0, indice).filter(d => isArtigo(d) && d !== movido && isDispositivoAlteracao(d) === emAlteracao).length + 1;
};

// Mesmo tipo: movimentação; tipo diferente: transformação.
export const getOperacaoDeMovimentacaoOuTransformacao = (state: State, antes: Partial<Elemento>, apos: Partial<Elemento>): OperacaoRevisao =>
  antes.tipo !== apos.tipo
    ? { nome: OPERACAO_TRANSFORMADO, argumento: nomeTipoNaRevisao(antes.tipo) }
    : { nome: OPERACAO_MOVIDO, argumento: String(getPosicaoOriginalParaMovimentacao(state, antes, apos)) };

// Para revisões que não têm o atributo (ex.: vindas de Proposicao.revisoes).
export const derivarOperacoesRevisao = (state: State, revisao: RevisaoElemento): string => {
  const antes = revisao.elementoAntesRevisao;
  const apos = revisao.elementoAposRevisao;
  if (revisao.stateType === StateType.ElementoRemovido) {
    return OPERACAO_EXCLUIDO;
  }
  if (revisao.stateType === StateType.ElementoModificado) {
    let operacoes = '';
    if (antes && apos && antes.tipo === apos.tipo && antes.rotulo !== apos.rotulo) {
      operacoes = anexarOperacaoRevisao(operacoes, OPERACAO_ALTERACAO_ROTULO, antes.lexmlId);
    }
    if (antes?.conteudo?.texto !== apos?.conteudo?.texto) {
      operacoes = anexarOperacaoRevisao(operacoes, OPERACAO_ALTERADO);
    }
    return operacoes || OPERACAO_ALTERADO;
  }
  if (!antes) {
    return OPERACAO_ADICIONADO;
  }
  let operacoes = '';
  if (antes.tipo !== apos.tipo || !isMesmoLugar(antes, apos)) {
    const operacao = getOperacaoDeMovimentacaoOuTransformacao(state, antes, apos);
    operacoes = anexarOperacaoRevisao(operacoes, operacao.nome, operacao.argumento);
  }
  return antes.conteudo?.texto !== apos.conteudo?.texto ? anexarOperacaoRevisao(operacoes, OPERACAO_ALTERADO) : operacoes;
};

export const getOperacoesDaRevisao = (state: State, revisao: RevisaoElemento): string => revisao.revisao ?? derivarOperacoesRevisao(state, revisao);

// Descarta as operações revertidas, mantendo a ordem das demais.
// Revisões de descendentes acompanham a principal: o lugar relativo deles não muda quando o grupo se move.
export const reconciliarOperacoesRevisao = (state: State, revisao: RevisaoElemento): void => {
  const antes = revisao.elementoAntesRevisao;
  if (!antes || revisao.revisao === undefined || revisao.idRevisaoElementoPrincipal || revisao.stateType === StateType.ElementoRemovido) {
    return;
  }
  const apos = revisao.elementoAposRevisao;
  let operacoes = revisao.revisao;
  if (antes.tipo === apos.tipo) {
    operacoes = removerOperacaoRevisao(operacoes, OPERACAO_TRANSFORMADO);
  }
  if (antes.conteudo?.texto === apos.conteudo?.texto) {
    operacoes = removerOperacaoRevisao(operacoes, OPERACAO_ALTERADO);
  }
  if (isMesmoLugar(antes, apos)) {
    operacoes = removerOperacaoRevisao(operacoes, OPERACAO_MOVIDO);
  }
  // Compara pelo id (e não pelo rótulo): em dispositivo movido ou transformado o rótulo difere do original por outra causa.
  const rotulo = getOperacoesRevisao(operacoes).find(o => o.nome === OPERACAO_ALTERACAO_ROTULO);
  if (rotulo && rotulo.argumento === apos.lexmlId) {
    operacoes = removerOperacaoRevisao(operacoes, OPERACAO_ALTERACAO_ROTULO);
  }
  revisao.revisao = operacoes;
};
