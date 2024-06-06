import { configurarPaginacao } from '../util/paginacaoUtil';
import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { getElementos } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';
import { ConfiguracaoPaginacao } from '../../../model/paginacao/paginacao';

export const load = (articulacao: Articulacao, modo?: string, configuracaoPaginacao?: ConfiguracaoPaginacao): State => {
  const elementos = getElementos(articulacao);
  return {
    articulacao,
    modo,
    past: [],
    present: [],
    future: [],
    ui: {
      events: [
        {
          stateType: StateType.DocumentoCarregado,
          elementos: elementos,
        },
      ],
      alertas: [],
      paginacao: configurarPaginacao(articulacao, configuracaoPaginacao),
    },
    revisoes: [],
    numEventosPassadosAntesDaRevisao: 0,
  };
};
