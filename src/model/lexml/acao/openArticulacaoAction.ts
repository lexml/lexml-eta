export const ABRIR_ARTICULACAO = 'ABRIR_ARTICULACAO';

export const openArticulacaoAction = (documento: any, nomeAcao?: string): any => {
  return {
    type: ABRIR_ARTICULACAO,
    documento,
    nomeAcao,
  };
};
