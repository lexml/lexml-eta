import { createElementoValidado } from './../../../model/elemento/elementoUtil';
import { isParagrafo } from './../../../model/dispositivo/tipo';
import { getDispositivoCabecaAlteracao, getDispositivoAndFilhosAsLista, getUltimoFilho } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isAgrupador, isAgrupadorGenerico, isArtigo, isInciso } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { buildDispositivoFromJsonix } from '../../../model/lexml/documento/conversor/buildDispositivoFromJsonix';
import { isDispositivoAlteracao, isDispositivoCabecaAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { buildId } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
export const adicionaElementosFromClipboard = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  if (isArtigo(atual) && atual.alteracoes === undefined && !atual.isDispositivoAlteracao) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível colar dispositivos fora de um bloco de alteração' });
  }

  const resultado = buildDispositivoFromJsonix(action.novo?.conteudo?.texto);

  if (!resultado.articulacao) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não foi possível identificar os dispositivos no texto informado' });
  }

  if (atual.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO && resultado.articulacao.filhos && isColandoFilhos(resultado.articulacao.filhos, atual)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível colar filhos em dispositivo suprimido' });
  }

  if (
    isArtigo(atual) &&
    atual.alteracoes &&
    resultado.articulacao.filhos?.filter(filho => isAgrupadorGenerico(filho)).length === 0 &&
    resultado.articulacao.filhos[0].tipo !== atual.tipo
  ) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: `Não é permitido colar ${resultado.articulacao.filhos[0].tipo} em artigo que propõe alterações`,
    });
  }

  if (resultado.articulacao.filhos?.filter(filho => isAgrupadorGenerico(filho)).length > 0) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não foi possível identificar os dispositivos no texto.' });
  }

  if (resultado.articulacao.filhos?.filter(filho => isAgrupador(filho)).length > 0) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Ainda não é possível importar dispositivos que contenham agrupadores' });
  }

  if (resultado.articulacao.filhos[0].tipo !== atual.tipo && !atual.tiposPermitidosFilhos?.includes(resultado.articulacao.filhos[0].tipo)) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: 'Ainda não é possível importar dispositivos que não sejam do mesmo tipo ou filhos do dispositivo atual',
    });
  }

  const dispositivosAdicionados: Dispositivo[] = [];
  let referencia: Dispositivo | undefined = undefined;
  let posInsercao = -1;

  resultado.articulacao.filhos.forEach((filho, index) => {
    if (isArtigo(atual) && atual.alteracoes) {
      filho.pai = atual.alteracoes;
      filho.cabecaAlteracao = true;
      filho.notaAlteracao = 'NR';

      atual.alteracoes.addFilhoOnPosition(filho, index);
    } else if (filho.tipo === atual.tipo) {
      if (!referencia) {
        referencia = getUltimoFilho(atual);
      }
      if (posInsercao === -1) {
        posInsercao = atual.pai!.indexOf(atual) + 1;
      }

      filho.pai = atual.pai;
      filho.cabecaAlteracao = atual.cabecaAlteracao;
      if (isDispositivoCabecaAlteracao(filho)) {
        filho.notaAlteracao = 'NR';
      }
      atual.pai?.addFilhoOnPosition(filho, posInsercao++);
    } else {
      const parent = isInciso(filho) && isArtigo(atual) ? (atual as Artigo).caput : atual;
      filho.pai = parent;
      if (posInsercao === -1) {
        if (isArtigo(atual)) {
          posInsercao = isParagrafo(filho) ? atual.filhos.filter(isInciso).length : 0;
          referencia = isParagrafo(filho) ? atual.filhos[atual.filhos.findIndex(isParagrafo) - 1] : referencia;
        } else {
          posInsercao = 0;
        }
      }
      // parent!.addFilho(filho);
      parent!.addFilhoOnPosition(filho, posInsercao++);
    }
    criaAtributosComuns(filho, state);

    filho.filhos && criaFilhos(filho, state);
    dispositivosAdicionados.push(...getDispositivoAndFilhosAsLista(filho));
  });

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(referencia ?? atual));

  const elementosAdicionados = dispositivosAdicionados.map(d => createElementoValidado(d));
  eventos.add(StateType.ElementoIncluido, elementosAdicionados);

  const mapCabecaAlteracao = new Map();
  const elementosSituacaoAtualizada: Elemento[] = [...criaListaElementosAfinsValidados(atual, false), ...elementosAdicionados]
    .map(e => getDispositivoFromElemento(state.articulacao, e)!)
    .map(d => {
      if (isDispositivoAlteracao(d)) {
        const ca = getDispositivoCabecaAlteracao(d);
        if (!mapCabecaAlteracao.has(ca.id)) {
          mapCabecaAlteracao.set(ca.id, '');
          return getDispositivoAndFilhosAsLista(ca);
        } else {
          return [];
        }
      } else {
        return d;
      }
    })
    .flat()
    .map(d => createElementoValidado(d));
  eventos.add(StateType.SituacaoElementoModificada, elementosSituacaoAtualizada);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: [],

    ui: {
      events: eventos.build(),
      alertas: state.ui?.alertas,
    },
  };
};

const criaFilhos = (atual: Dispositivo, state: any): void => {
  atual.filhos.forEach(filho => {
    criaAtributosComuns(filho, state);
    filho.filhos && criaFilhos(filho, state);
  });
};

const criaAtributosComuns = (filho: Dispositivo, state: any): void => {
  filho.situacao = new DispositivoAdicionado();
  filho.isDispositivoAlteracao = true;

  (filho.situacao as DispositivoAdicionado).tipoEmenda = state.modo;
  (filho.situacao as DispositivoAdicionado).existeNaNormaAlterada = true;
  filho.id = buildId(filho);
};

const isColandoFilhos = (filhos: Dispositivo[], atual: Dispositivo): boolean => {
  return filhos[0].tipo !== atual.tipo && !atual.tiposPermitidosFilhos?.includes(filhos[0].tipo);
};
