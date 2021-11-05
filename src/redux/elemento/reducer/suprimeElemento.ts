import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { suprimeAndBuildEvents } from '../evento/eventosUtil';
import { buildFuture, buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

const getSituacoesFilhos = (dispositivos: Dispositivo[], situacoes: Set<string>): void => {
  if (dispositivos.length === 0) {
    return;
  }
  dispositivos?.forEach(d => {
    situacoes.add(d.situacao.descricaoSituacao);
    getSituacoesFilhos(d.filhos, situacoes);
  });
};

export const podeSuprimir = (dispositivo: Dispositivo): boolean => {
  const situacoes = new Set<string>();
  situacoes.add(dispositivo.situacao.descricaoSituacao);
  getSituacoesFilhos(dispositivo.filhos, situacoes);

  return situacoes.size === 1 && [...situacoes][0] === DescricaoSituacao.DISPOSITIVO_ORIGINAL;
};

export const suprimeElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined || dispositivo.situacao?.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
    return state;
  }

  if (!podeSuprimir(dispositivo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Só é possível suprimir dispositivos que não tenham sofrido modificação.' });
  }

  const events = suprimeAndBuildEvents(state.articulacao, dispositivo);

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, events),
    present: events,
    future: buildFuture(state, events),
    ui: {
      events,
    },
  };
};
