import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { RevisaoJustificativaEnum } from '../util/revisaoUtil';
import { retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const ativaDesativaRevisao = (state: any): State => {
  const isActive = !state.emRevisao;
  if (!isActive && state.revisoes?.length) {
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
    ? ' (TEXTO | JUSTIFICATIVA) '
    : contemRevisoesDispositivos
    ? ' (TEXTO) '
    : contemRevisoesJustificativa
    ? ' (JUSTIFICATIVA) '
    : ' ';
};
