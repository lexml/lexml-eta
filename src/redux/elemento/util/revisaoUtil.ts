import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
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
import { getDispositivoAndFilhosAsLista, getUltimoFilho, isArticulacaoAlteracao, isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
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
  [StateType.ElementoIncluido]: (): string => 'Dispositivo adicionado',
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
  if (!d) {
    return undefined;
  } else if (isDispositivoAlteracao(d)) {
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

  if (elemento.revisao) {
    elemento.revisao;
  }

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
      // Pega a última revisão do grupo da revisão principal (rAux) e utiliza o "elementoAposRevisao" como elemento anterior do atual elemento removido
      elemento.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(findUltimaRevisaoDoGrupo(revisoes, rAux).elementoAposRevisao));
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

export const isRevisaoDeRestauracao = (revisao: Revisao): boolean => {
  return isRevisaoElemento(revisao) && (revisao as RevisaoElemento).stateType === StateType.ElementoRestaurado;
};

export const isAtualizarPosicaoDeElementoExcluido = (elementoIncluido: Elemento, elementoExcluido: Partial<Elemento>): boolean => {
  return elementoIncluido.hierarquia?.pai?.lexmlId === elementoExcluido.hierarquia?.pai?.lexmlId && elementoIncluido.uuid! < elementoExcluido.uuid!;
};

export const findRevisaoDeRestauracaoByUuid = (revisoes: Revisao[] = [], uuid: number): RevisaoElemento | undefined => {
  return revisoes.map(r => r as RevisaoElemento).find(r => isRevisaoElemento(r) && r.stateType === StateType.ElementoRestaurado && r.elementoAposRevisao.uuid === uuid);
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
      StateType.ElementoSuprimido,
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
