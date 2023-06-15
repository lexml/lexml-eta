import { Revisao, RevisaoJustificativa } from '../../../model/revisao/revisao';
import { formatDateTime } from '../../../util/date-util';
import { State } from '../../state';
import { RevisaoJustificativaEnum } from '../util/revisaoUtil';

export const atualizaRevisaoJustificativa = (state: State, removeAllRevisoesJustificativa = false): State => {
  if (!state.emRevisao) {
    return state;
  }

  if (!removeAllRevisoesJustificativa) {
    let revisoes: Revisao[] = [];
    revisoes = criaRevisaoJustificativa(state);

    if (revisoes.length > 0) {
      state.revisoes!.push(...revisoes);
    }
  } else {
    remove(state);
  }

  return state;
};

const remove = (state: State): void => {
  state.revisoes = state.revisoes?.filter(r => r.descricao !== RevisaoJustificativaEnum.JustificativaAlterada);
};

const criaRevisaoJustificativa = (state: State): Revisao[] => {
  const result: Revisao[] = [];

  if (!jaExisteRevisaoUsuarioAtual(state)) {
    result.push(new RevisaoJustificativa(state.usuario!, formatDateTime(new Date()), RevisaoJustificativaEnum.JustificativaAlterada));
  }

  return result;
};

const jaExisteRevisaoUsuarioAtual = (state: State): boolean => {
  const revisoesUsuarioAtual = state.revisoes?.filter(r => r.usuario.nome === state.usuario?.nome && r.descricao === RevisaoJustificativaEnum.JustificativaAlterada);

  if (revisoesUsuarioAtual!.length > 0) {
    return true;
  }
  return false;
};
