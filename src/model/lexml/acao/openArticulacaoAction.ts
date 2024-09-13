import { LexmlEmendaParametrosEdicao } from '../../../components/lexml-emenda.component';

export const ABRIR_ARTICULACAO = 'ABRIR_ARTICULACAO';

export const openArticulacaoAction = (articulacao: any, classificacao?: string, params?: LexmlEmendaParametrosEdicao): any => {
  return {
    type: ABRIR_ARTICULACAO,
    classificacao,
    articulacao,
    params,
  };
};
