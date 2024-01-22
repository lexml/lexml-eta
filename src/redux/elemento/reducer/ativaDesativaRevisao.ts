import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { RevisaoJustificativaEnum } from '../util/revisaoUtil';
import { retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const ativaDesativaRevisao = (state: any, action: any): State => {
  const isActive = !state.emRevisao;
  if (!isActive && action.quantidade > 0) {
    return {
      ...retornaEstadoAtualComMensagem(state, {
        tipo: TipoMensagem.INFO,
        descricao: 'É necessário resolver todas as marcas de revisão' + getMensagemTipoRevisoes(state) + 'para desativar o modo de controle de alterações',
      }),
      emRevisao: true,
    };
  }

  return {
    ...state,
    emRevisao: isActive,
    ui: {
      events: [{ stateType: isActive ? StateType.RevisaoAtivada : StateType.RevisaoDesativada }],
      alertas: state.ui?.alertas,
    },
  };
};

const getMensagemTipoRevisoes = (state: State): string => {
  const contemRevisoesDispositivos = state.revisoes!.filter(e => e.descricao !== RevisaoJustificativaEnum.JustificativaAlterada).length > 0;
  const contemRevisoesJustificativa = state.revisoes!.filter(e => e.descricao === RevisaoJustificativaEnum.JustificativaAlterada).length > 0;

  return contemRevisoesDispositivos && contemRevisoesJustificativa
    ? ' das abas texto e justificação '
    : contemRevisoesDispositivos
    ? ' da aba texto '
    : contemRevisoesJustificativa
    ? ' da aba justificação '
    : ' ';
};
