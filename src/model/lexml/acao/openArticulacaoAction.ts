export const ABRIR_ARTICULACAO = 'ABRIR_ARTICULACAO';

export const openArticulacaoAction = (articulacao: any, tipoDocumento?: string): any => {
  return {
    type: ABRIR_ARTICULACAO,
    articulacao,
    tipoDocumento,
  };
};
