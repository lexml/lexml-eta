import { createElementoValidado } from '../../../model/elemento/elementoUtil';
import { findDispositivoByUuid } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';

// O aviso de norma divergente é aplicado pela tela sobre este evento; só interessa a artigo com bloco de alteração e norma alterada.
export const eventosRevalidacaoDoArtigo = (state: any, sourceUuid?: number): StateEvent[] => {
  const artigo = state.articulacao && sourceUuid !== undefined ? findDispositivoByUuid(state.articulacao, sourceUuid) : null;

  if (!artigo?.alteracoes?.base) {
    return [];
  }

  const eventos = new Eventos();
  eventos.add(StateType.ElementoValidado, [createElementoValidado(artigo, true)]);
  return eventos.build();
};
