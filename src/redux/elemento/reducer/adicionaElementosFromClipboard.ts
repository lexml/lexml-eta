import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isAgrupador } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento, getElementos } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { buildDispositivoFromJsonix } from '../../../model/lexml/documento/conversor/buildDispositivoFromJsonix';
import { hasFilhos, irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { buildId } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
export const adicionaElementosFromClipboard = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined || atual.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO || !atual.isDispositivoAlteracao) {
    console.log('nao é dispositivo de alteração');
    state.ui.events = [];
    return state;
  }

  const resultado = buildDispositivoFromJsonix(action.novo?.conteudo?.texto);

  if (!resultado.articulacao) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não foi possível identificar os dispositivos no texto informado' });
  }

  if (resultado.articulacao.filhos?.length > 1 && irmaosMesmoTipo(resultado.articulacao.filhos[0]).length !== resultado.articulacao.filhos.length) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Ainda não é possível importar dispositivos de diferentes tipos na mesma hierarquia' });
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

  if (resultado.articulacao.filhos[0].tipo !== atual.tipo && hasFilhos(atual)) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: 'Ainda não é possível importar dispositivos que não sejam do mesmo tipo ou filhos do dispositivo atual',
    });
  }

  const elementosAdicionados: Elemento[] = [];

  resultado.articulacao.filhos.forEach(filho => {
    criaAtributosComuns(filho, state);

    if (filho.tipo === atual.tipo) {
      filho.pai = atual.pai;
      filho.cabecaAlteracao = atual.cabecaAlteracao;
      if (isDispositivoCabecaAlteracao(filho)) {
        filho.notaAlteracao = 'NR';
      }
      atual.pai?.addFilhoOnPosition(filho, atual.pai!.indexOf(atual) + 1);
    } else {
      filho.pai = atual;
      atual.addFilho(filho);
    }
    filho.filhos && atualizaAtributosDosFilhos(filho, state);
    elementosAdicionados.push(...getElementos(filho));
  });

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(atual));
  eventos.add(StateType.ElementoIncluido, elementosAdicionados);
  eventos.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(atual, false));

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

const atualizaAtributosDosFilhos = (atual: Dispositivo, state: any): void => {
  atual.filhos.forEach(filho => {
    filho.pai = atual;
    atual.addFilho(filho);
    filho.mensagens = validaDispositivo(filho);
    criaAtributosComuns(filho, state);
    filho.filhos && atualizaAtributosDosFilhos(filho, state);
  });
};

const criaAtributosComuns = (filho: Dispositivo, state: any): void => {
  filho.isDispositivoAlteracao = true;
  filho.situacao = new DispositivoAdicionado();
  (filho.situacao as DispositivoAdicionado).tipoEmenda = state.modo;
  filho.id = buildId(filho);
};
