import { State } from '../../state';
import { load } from './loadArticulacao';
import { inicializaRemissoesAoAbrir } from './inicializaRemissoesAoAbrir';

export const abreArticulacao = (state: any, action: any): State => {
  // inicializaRemissoesAoAbrir deve rodar ANTES de load
  const remissoes = inicializaRemissoesAoAbrir(action.articulacao!);
  const newState = load(action.articulacao!, action.classificacao, action.params);
  newState.remissoes = remissoes;
  return newState;
};
