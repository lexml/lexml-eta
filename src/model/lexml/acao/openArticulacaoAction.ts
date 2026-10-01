import { LexmlEtaParametrosEdicao } from '../../../components/lexml-eta.component';

export const ABRIR_ARTICULACAO = 'ABRIR_ARTICULACAO';

export const openArticulacaoAction = (articulacao: any, classificacao?: string, params?: LexmlEtaParametrosEdicao, idsRemissoesInvalidas?: string[]): any => {
  return {
    type: ABRIR_ARTICULACAO,
    classificacao,
    articulacao,
    params,
    idsRemissoesInvalidas,
  };
};
