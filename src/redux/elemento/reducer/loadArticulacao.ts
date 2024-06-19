import { configurarPaginacao } from '../util/paginacaoUtil';
import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { getElementos } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';
import { LexmlEmendaParametrosEdicao } from '../../../components/lexml-emenda.component';

export const load = (articulacao: Articulacao, modo?: string, params?: LexmlEmendaParametrosEdicao): State => {
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
      paginacao: configurarPaginacao(articulacao, params?.configuracaoPaginacao),
    },
    revisoes: [],
    numEventosPassadosAntesDaRevisao: 0,
  };
};
