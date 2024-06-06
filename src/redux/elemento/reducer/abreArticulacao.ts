import { State } from '../../state';
import { load } from './loadArticulacao';

export const abreArticulacao = (state: any, action: any): State => {
  return load(action.articulacao!, action.classificacao, action.configuracaoPaginacao);
};
