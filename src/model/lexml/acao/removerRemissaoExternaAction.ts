export const REMOVER_REMISSAO_EXTERNA = 'REMOVER_REMISSAO_EXTERNA';

export const removerRemissaoExternaAction = (refId: string): any => ({
  type: REMOVER_REMISSAO_EXTERNA,
  refId,
});
