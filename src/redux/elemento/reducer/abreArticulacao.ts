import { State } from '../../state';
import { load } from './loadArticulacao';
import { inicializaRemissoesAoAbrir } from './inicializaRemissoesAoAbrir';
import { inicializaRemissoesExternasAoAbrir } from './inicializaRemissoesExternasAoAbrir';

export const abreArticulacao = (state: any, action: any): State => {
  // inicializaRemissoes* deve rodar ANTES de load para que as correções
  // de texto (href, data-ref-id) sejam refletidas nos Elementos criados por getElementos().
  const remissoes = inicializaRemissoesAoAbrir(action.articulacao!);
  const remissoesExternas = inicializaRemissoesExternasAoAbrir(action.articulacao!);
  const newState = load(action.articulacao!, action.classificacao, action.params);
  newState.remissoes = remissoes;
  newState.remissoesExternas = remissoesExternas;
  return newState;
};
