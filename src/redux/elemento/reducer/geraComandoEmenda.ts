import { ComandoEmendaBuilder } from '../../../emenda/comando-emenda-builder';
import { State, StateType } from '../../state';

export const geraComandoEmenda = (state: any, action: any): State => {
  const retorno: State = {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: [
        {
          stateType: StateType.ComandoEmendaGerado,
          emenda: {
            comandoEmenda: new ComandoEmendaBuilder(action.urn!, state.articulacao!).getComandos(),
          },
        },
      ],
    },
  };

  return retorno;
};
