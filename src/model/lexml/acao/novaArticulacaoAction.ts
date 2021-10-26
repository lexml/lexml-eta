export const NOVA_ARTICULACAO = 'NOVA_ARTICULACAO';

export const novaArticulacaoAction = (tipoDocumento?: string): any => {
  return {
    type: NOVA_ARTICULACAO,
    tipoDocumento,
  };
};
