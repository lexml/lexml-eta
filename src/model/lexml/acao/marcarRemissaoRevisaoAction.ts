export const MARCAR_REMISSAO_PENDENTE_REVISAO = 'MarcarRemissaoPendenteRevisao';
export const MARCAR_REMISSAO_REVISADA = 'MarcarRemissaoRevisada';

export const marcarRemissaoPendenteRevisaoAction = (params: { sourceUuid: number; refIds: string[] }): any => ({
  type: MARCAR_REMISSAO_PENDENTE_REVISAO,
  ...params,
});

export const marcarRemissaoRevisadaAction = (params: { sourceUuid: number; refId: string }): any => ({
  type: MARCAR_REMISSAO_REVISADA,
  ...params,
});
