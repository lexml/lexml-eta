export const EXCLUIR_REMISSAO_MANUAL = 'ExcluirRemissaoManual';

export const excluirRemissaoManualAction = (params: { sourceUuid: number; refId: string }): any => ({
  type: EXCLUIR_REMISSAO_MANUAL,
  ...params,
});
