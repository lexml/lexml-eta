import { Elemento } from '../../../model/elemento';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { buildListaDispositivos } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../state';

export const validaArticulacao = (state: any): State => {
  const elementos: Elemento[] = [];
  buildListaDispositivos(state.articulacao, []).forEach(d => {
    const mensagens = validaDispositivo(d);

    if (mensagens?.length > 0) {
      d.mensagens = mensagens;
      elementos.push(createElemento(d));
    }
  });

  const events = [
    {
      stateType: StateType.ElementoValidado,
      elementos: elementos,
    },
  ];

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
};
