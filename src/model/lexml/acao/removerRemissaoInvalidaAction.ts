import { RemissaoInternaValue } from '../../remissao';

export const REMOVER_REMISSAO_INVALIDA = 'REMOVER_REMISSAO_INVALIDA';

export const removerRemissaoInvalidaAction = (sourceUuid: number, remissoesRestantes: RemissaoInternaValue[]): any => ({
  type: REMOVER_REMISSAO_INVALIDA,
  sourceUuid,
  remissoesRestantes,
});
