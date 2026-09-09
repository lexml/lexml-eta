import { exibirDiferencaAction } from '../../../model/lexml/acao/exibirDiferencaAction';
import { State } from '../../state';
import { isRevisaoDeModificacao } from '../util/revisaoUtil';

export const adicionaDiffMenuOpcoes = (state: State): State => {
  state.ui?.events.forEach(se =>
    se.elementos?.filter(Boolean).forEach(e => {
      if (e.revisao && isRevisaoDeModificacao(e.revisao)) {
        e.acoesPossiveis = e.acoesPossiveis ?? [];
        if (!e.acoesPossiveis.includes(exibirDiferencaAction)) {
          e.acoesPossiveis.push(exibirDiferencaAction);
        }
      }
    })
  );

  return state;
};
