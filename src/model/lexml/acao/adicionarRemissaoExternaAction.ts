import { RemissaoExternaValue } from '../../remissao';

export const ADICIONAR_REMISSAO_EXTERNA = 'ADICIONAR_REMISSAO_EXTERNA';

// `totalNoLote`: quantas remissões a mesma detecção cria no artigo; os links do lote ainda não estão no texto, então a contagem do preenchimento do base depende dele.
export const adicionarRemissaoExternaAction = (value: RemissaoExternaValue, totalNoLote = 1): any => ({
  type: ADICIONAR_REMISSAO_EXTERNA,
  value,
  totalNoLote,
});
