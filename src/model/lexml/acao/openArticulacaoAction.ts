export const ABRIR_ARTICULACAO = 'ABRIR_ARTICULACAO';

export const openArticulacaoAction = (articulacao: any, classificacao?: string): any => {
  return {
    type: ABRIR_ARTICULACAO,
    classificacao,
    articulacao,
  };
};
