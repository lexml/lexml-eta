import { State } from '../../state';
import { load } from './loadArticulacao';
import { inicializaRemissoesAoAbrir } from './inicializaRemissoesAoAbrir';

export const abreArticulacao = (state: any, action: any): State => {
  const newState = load(action.articulacao!, action.classificacao, action.params);
  newState.remissoes = inicializaRemissoesAoAbrir(action.articulacao!);
  return newState;
};
