import { Articulacao } from '../model/dispositivo/dispositivo';
import { Elemento } from '../model/elemento';
import { Mensagem } from '../model/lexml/util/mensagem';

export enum StateType {
  DocumentoCarregado = 'DocumentoCarregado',
  ElementoModificado = 'ElementoModificado',
  ElementoIncluido = 'ElementoIncluido',
  ElementoRemovido = 'ElementoRemovido',
  ElementoRenumerado = 'ElementoRenumerado',
  ElementoRestaurado = 'ElementoRestaurado',
  ElementoSuprimido = 'ElementoSuprimido',
  ElementoValidado = 'ElementoValidado',
  ElementoSelecionado = 'ElementoSelecionado',
}
export interface StateEvent {
  stateType: StateType;
  referencia?: Elemento;
  pai?: Elemento;
  posicao?: number;
  elementos?: Elemento[];
}

export interface State {
  articulacao?: Articulacao;
  past?: StateEvent[];
  present: StateEvent[];
  future?: StateEvent[];
  ui?: {
    events: StateEvent[];
    message?: Mensagem;
  };
}

export const createState = (state: any, events: StateEvent[], past: StateEvent[], present: StateEvent[], future: StateEvent[]): State => {
  return {
    articulacao: state.articulacao,
    past: past,
    present: present,
    future: future,
    ui: {
      events,
    },
  };
};
