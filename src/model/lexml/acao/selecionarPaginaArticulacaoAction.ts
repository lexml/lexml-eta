export const SELECIONAR_PAGINA_ARTICULACAO = 'SELECIONAR_PAGINA_ARTICULACAO';

export const selecionarPaginaArticulacaoAction = (numPagina: number): any => {
  return {
    type: SELECIONAR_PAGINA_ARTICULACAO,
    numPagina,
  };
};
