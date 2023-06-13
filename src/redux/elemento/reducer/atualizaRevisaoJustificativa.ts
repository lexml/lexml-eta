import { Revisao, RevisaoJustificativa } from '../../../model/revisao/revisao';
import { formatDateTime } from '../../../util/date-util';
import { State } from '../../state';
import { RevisaoJustificativaEnum } from '../util/revisaoUtil';

export const atualizaRevisaoJustificativa = (state: State): State => {
  if (!state.emRevisao) {
    return state;
  }

  let revisoes: Revisao[] = [];
  revisoes = criaRevisaoJustificativa(state);

  if (revisoes.length > 0) {
    state.revisoes!.push(...revisoes);
  }

  return state;
};

const criaRevisaoJustificativa = (state: State): Revisao[] => {
  const result: Revisao[] = [];

  if (!jaExisteRevisaoUsuarioAtual(state)) {
    result.push(new RevisaoJustificativa(state.usuario!, formatDateTime(new Date()), RevisaoJustificativaEnum.JustificativaAlterada));
  }

  return result;
};

const jaExisteRevisaoUsuarioAtual = (state: State): boolean => {
  const revisoesUsuarioAtual = state.revisoes?.filter(r => r.usuario.nome === state.usuario?.nome);

  if (revisoesUsuarioAtual!.length > 0) {
    return true;
  }
  return false;
};
