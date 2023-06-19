import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { getElementos } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';

export const load = (articulacao: Articulacao, modo?: string): State => {
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
    },
    revisoes: [],
    numEventosPassadosAntesDaRevisao: 0,
  };
};
