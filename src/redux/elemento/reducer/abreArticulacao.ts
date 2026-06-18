import { State } from '../../state';
import { load } from './loadArticulacao';
import { inicializaRemissoesAoAbrir } from './inicializaRemissoesAoAbrir';
import { inicializaRemissoesExternasAoAbrir } from './inicializaRemissoesExternasAoAbrir';

export const abreArticulacao = (state: any, action: any): State => {
  // inicializaRemissoes* deve rodar ANTES de load para que as correções
  // de texto (href, data-ref-id) sejam refletidas nos Elementos criados por getElementos().
  const remissoesValidas = inicializaRemissoesAoAbrir(action.articulacao!);
  const remissoesExternas = inicializaRemissoesExternasAoAbrir(action.articulacao!);
  const newState = load(action.articulacao!, action.classificacao, action.params);

  // Mescla entradas inválidas (detectadas por load) com entradas válidas (inicializaRemissoesAoAbrir).
  // Sem o merge, as inválidas seriam descartadas pela atribuição direta.
  const remissoesInvalidas: Record<number, any[]> = newState.remissoes ?? {};
  const remissoesMerged: Record<number, any[]> = { ...remissoesInvalidas };
  for (const [uuidStr, entries] of Object.entries(remissoesValidas)) {
    const uuid = Number(uuidStr);
    remissoesMerged[uuid] = [...(remissoesMerged[uuid] ?? []), ...entries];
  }
  newState.remissoes = Object.keys(remissoesMerged).length > 0 ? remissoesMerged : undefined;
  newState.remissoesExternas = remissoesExternas;
  return newState;
};
