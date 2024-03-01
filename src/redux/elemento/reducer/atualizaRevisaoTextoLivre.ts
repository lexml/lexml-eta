import { Revisao, RevisaoTextoLivre } from '../../../model/revisao/revisao';
import { formatDateTime } from '../../../util/date-util';
import { State } from '../../state';
import { RevisaoTextoLivreEnum } from '../util/revisaoUtil';

export const atualizaRevisaoTextoLivre = (state: State, removeAllRevisoesTextoLivre = false): State => {
  if (!state.emRevisao) {
    return state;
  }

  if (!removeAllRevisoesTextoLivre) {
    let revisoes: Revisao[] = [];
    revisoes = criaRevisaoTextoLivre(state);

    if (revisoes.length > 0) {
      state.revisoes!.push(...revisoes);
    }
  } else {
    remove(state);
  }

  return state;
};

const remove = (state: State): void => {
  state.revisoes = state.revisoes?.filter(r => r.descricao !== RevisaoTextoLivreEnum.TextoLivreAlterado);
};

const criaRevisaoTextoLivre = (state: State): Revisao[] => {
  const result: Revisao[] = [];

  //if (!jaExisteRevisaoUsuarioAtual(state)) {
  if (!jaExisteRevisao(state)) {
    result.push(new RevisaoTextoLivre(state.usuario!, formatDateTime(new Date()), RevisaoTextoLivreEnum.TextoLivreAlterado));
  }

  return result;
};

const jaExisteRevisao = (state: State): boolean => {
  const revisaoUtil = state.revisoes?.filter(r => r.descricao === RevisaoTextoLivreEnum.TextoLivreAlterado) || [];

  return revisaoUtil.length > 0;
};

// const jaExisteRevisaoUsuarioAtual = (state: State): boolean => {
//   const revisoesUsuarioAtual = state.revisoes?.filter(r => r.usuario.nome === state.usuario?.nome && r.descricao === RevisaoTextoLivreEnum.TextoLivreAlterado);

//   if (revisoesUsuarioAtual!.length > 0) {
//     const revisaoDataHoraModificada = revisoesUsuarioAtual![0];
//     revisaoDataHoraModificada.dataHora = formatDateTime(new Date());
//     return true;
//   }
//   return false;
// };
