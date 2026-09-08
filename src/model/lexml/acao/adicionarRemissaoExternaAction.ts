import { RemissaoExternaValue } from '../../remissao';

export const ADICIONAR_REMISSAO_EXTERNA = 'ADICIONAR_REMISSAO_EXTERNA';

export const adicionarRemissaoExternaAction = (value: RemissaoExternaValue): any => ({
  type: ADICIONAR_REMISSAO_EXTERNA,
  value,
});
