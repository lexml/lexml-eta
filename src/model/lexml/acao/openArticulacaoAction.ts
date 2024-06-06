import { ConfiguracaoPaginacao } from '../../paginacao/paginacao';

export const ABRIR_ARTICULACAO = 'ABRIR_ARTICULACAO';

export const openArticulacaoAction = (articulacao: any, classificacao?: string, configuracaoPaginacao?: ConfiguracaoPaginacao): any => {
  return {
    type: ABRIR_ARTICULACAO,
    classificacao,
    articulacao,
    configuracaoPaginacao,
  };
};
