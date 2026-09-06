import { isRevisaoDeMovimentacao, isRevisaoDeTransformacao } from './../util/revisaoUtil';
import { isParagrafo } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento } from '../../../model/elemento/elementoUtil';
import {
  buscaDispositivoById,
  findDispositivoByUuid2,
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { Counter } from '../../../util/counter';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import { findRevisaoById, identificarRevisaoElementoPai, isRevisaoDeExclusao, isRevisaoElemento, isRevisaoPrincipal } from '../util/revisaoUtil';
import { Dispositivo } from './../../../model/dispositivo/dispositivo';

export const aplicaRevisoes = (state: any, action: any): State => {
  let alertas = [];
  if (state.ui?.alertas?.length > 0) {
    alertas = state.ui.alertas;
  }

  const retorno: State = {
    articulacao: state.articulacao,
    modo: state.modo,
    past: [],
    present: [],
    future: [],
    ui: {
      events: [],
      alertas: alertas,
      paginacao: state.ui?.paginacao,
    },
    revisoes: [],
    emRevisao: state.emRevisao,
    numEventosPassadosAntesDaRevisao: 0,
  };

  const eventos = new Eventos();

  if (action.revisoes?.length) {
    eventos.eventos.push(...processaRevisoes(retorno, action.revisoes));
    retorno.emRevisao = true;
  }

  retorno.ui!.events = eventos.build();

  state.articulacao && renumeraParagrafosUnicos(retorno);

  const elementosInseridos: Elemento[] = [];
  retorno.ui!.events.filter(stateEvent => stateEvent.stateType === StateType.ElementoIncluido).forEach(se => elementosInseridos.push(...se.elementos!));

  retorno.ui!.events.push({
    stateType: StateType.SituacaoElementoModificada,
    elementos: getElementosAlteracaoASeremAtualizados(state.articulacao, elementosInseridos),
  });

  if (retorno.emRevisao) {
    retorno.ui!.events.push({ stateType: StateType.RevisaoAtivada });
  }

  return retorno;
};

const renumeraParagrafosUnicos = (state: any): Dispositivo[] => {
  // Trata renumeração de parágrafo único
  let paragrafosUnicos = getDispositivoAndFilhosAsLista(state.articulacao)
    .filter(d => isParagrafo(d) && d.pai?.filhos.find(f => f.id?.endsWith('par1u')))
    .map(d => d.pai!.filhos.find(f => f.id?.endsWith('par1u'))!);
  paragrafosUnicos = [...new Set(paragrafosUnicos)];
  paragrafosUnicos.map(d => d.pai!).forEach(d => d.renumeraFilhos());
  return paragrafosUnicos;
};

const idSemCpt = (id: string): string => id.replace(/(_cpt)$/, '');

const processaRevisoes = (state: State, revisoes: Revisao[]): StateEvent[] => {
  const elementosExcluidosEmModoDeRevisao: Elemento[] = [];
  let elementoAnterior: Partial<Elemento>;

  revisoes.forEach(r => {
    try {
      if (isRevisaoElemento(r)) {
        const rAux = r as RevisaoElemento;
        processarElementoDaRevisao(state, rAux, elementoAnterior, elementosExcluidosEmModoDeRevisao);
        if (isRevisaoDeExclusao(rAux)) {
          elementoAnterior = rAux.elementoAposRevisao;
        }
      }
      state.revisoes?.push(r);
    } catch (error) {
      // TODO: tratar erro
    }
  });

  state.revisoes = identificarRevisaoElementoPai(state, state.revisoes!);

  return [{ stateType: StateType.ElementoIncluido, elementos: elementosExcluidosEmModoDeRevisao }];
};

const processarElementoDaRevisao = (state: State, revisao: RevisaoElemento, elementoAnterior: Partial<Elemento>, elementosExcluidosEmModoDeRevisao: Elemento[]): void => {
  if (isRevisaoDeExclusao(revisao)) {
    let e: Partial<Elemento> | undefined;

    if (isRevisaoPrincipal(revisao)) {
      let d = findDispositivoByUuid2(state.articulacao!, revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!.uuid2!);
      d = d || buscaDispositivoById(state.articulacao!, idSemCpt(revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!.lexmlId!)) || null;
      e = d ? createElemento(d) : elementoAnterior;
    } else {
      e = elementoAnterior;
    }

    revisao.elementoAposRevisao.uuid = Counter.next();
    revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(e));

    revisao.elementoAntesRevisao!.uuid = revisao.elementoAposRevisao.uuid;
    revisao.elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(e));

    atualizarUuidDoPaiDoElementoRemovido(state, revisao);

    elementosExcluidosEmModoDeRevisao.push(revisao.elementoAposRevisao as Elemento);
    elementoAnterior = revisao.elementoAposRevisao as Elemento;
  } else {
    const e = createElemento(buscaDispositivoById(state.articulacao!, revisao.elementoAposRevisao.lexmlId!)!);
    revisao.elementoAposRevisao.uuid = e.uuid;
    revisao.elementoAposRevisao.uuid2 = e.uuid2;
    revisao.elementoAposRevisao.hierarquia!.pai!.uuid = e.hierarquia?.pai?.uuid;
    revisao.elementoAposRevisao.hierarquia!.pai!.uuid2 = e.hierarquia?.pai?.uuid2;

    if (isRevisaoDeMovimentacao(revisao) || isRevisaoDeTransformacao(revisao)) {
      revisao.elementoAntesRevisao!.uuid = Counter.next();
      const dAux = buscaDispositivoById(state.articulacao!, revisao.elementoAntesRevisao!.hierarquia!.pai!.lexmlId!);
      if (dAux) {
        revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid = dAux.uuid;
        revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid2 = dAux.uuid2;
      } else {
        // TODO: revisar necessidade de else
        revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid = e.hierarquia?.pai?.uuid;
        revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid2 = e.hierarquia?.pai?.uuid2;
      }
    } else if (revisao.stateType !== StateType.ElementoIncluido) {
      revisao.elementoAntesRevisao!.uuid = e.uuid;
      revisao.elementoAntesRevisao!.uuid2 = e.uuid2;
      revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid = e.hierarquia?.pai?.uuid;
      revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid2 = e.hierarquia?.pai?.uuid2;
    }

    if (e.dispositivoAlteracao) {
      revisao.elementoAposRevisao.hierarquia!.pai!.uuidAlteracao = e.hierarquia?.pai?.uuidAlteracao;
      revisao.elementoAposRevisao.hierarquia!.pai!.uuid2Alteracao = e.hierarquia?.pai?.uuid2Alteracao;
    }
  }
};

const atualizarUuidDoPaiDoElementoRemovido = (state: State, revisao: RevisaoElemento): void => {
  let uuid: number | undefined = 0;
  let uuid2: string | undefined = '';
  let uuidAlteracao: number | undefined = undefined;
  let uuid2Alteracao: string | undefined = undefined;

  if (isRevisaoPrincipal(revisao)) {
    const pai = buscaDispositivoById(state.articulacao!, revisao.elementoAposRevisao.hierarquia!.pai!.lexmlId!);
    uuid = pai?.uuid;
    uuid2 = pai?.uuid2;
    if (pai && isDispositivoAlteracao(pai)) {
      const articulacaoAlteracao = getArticulacao(pai);
      uuidAlteracao = articulacaoAlteracao?.uuid;
      uuid2Alteracao = articulacaoAlteracao?.uuid2;
    }
  } else {
    const revisaoPai = findRevisaoById(state.revisoes!, revisao.idRevisaoElementoPai!) as RevisaoElemento;
    uuid = revisaoPai!.elementoAposRevisao.uuid;
    uuid2 = revisaoPai!.elementoAposRevisao.uuid2;
  }

  revisao.elementoAposRevisao.hierarquia!.pai!.uuid = uuid;
  revisao.elementoAposRevisao.hierarquia!.pai!.uuid2 = uuid2;
  revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid = uuid;
  revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid2 = uuid2;

  revisao.elementoAposRevisao.hierarquia!.pai!.uuidAlteracao = uuidAlteracao;
  revisao.elementoAposRevisao.hierarquia!.pai!.uuid2Alteracao = uuid2Alteracao;
  revisao.elementoAntesRevisao!.hierarquia!.pai!.uuidAlteracao = uuidAlteracao;
  revisao.elementoAntesRevisao!.hierarquia!.pai!.uuid2Alteracao = uuid2Alteracao;
};
