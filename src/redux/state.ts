import { ItemComandoEmenda } from '../emenda/comando-emenda-builder';
import { Articulacao } from '../model/dispositivo/dispositivo';
import { Elemento } from '../model/elemento';
import { Mensagem } from '../model/lexml/util/mensagem';

export enum StateType {
  ArticulacaoAtualizada = 'ArticulacaoAtualizada',
  ComandoEmendaGerado = 'ComandoEmendaGerado',
  DocumentoCarregado = 'DocumentoCarregado',
  InformarNorma = 'InformarNorma',
  ElementoModificado = 'ElementoModificado',
  ElementoIncluido = 'ElementoIncluido',
  ElementoRemovido = 'ElementoRemovido',
  ElementoRenumerado = 'ElementoRenumerado',
  ElementoRestaurado = 'ElementoRestaurado',
  ElementoSuprimido = 'ElementoSuprimido',
  ElementoValidado = 'ElementoValidado',
  ElementoSelecionado = 'ElementoSelecionado',
  ElementoMarcado = 'ElementoMarcado',
  SituacaoElementoModificada = 'SituacaoElementoModificada',
}
export interface StateEvent {
  stateType: StateType;
  referencia?: Elemento;
  pai?: Elemento;
  posicao?: number;
  elementos?: Elemento[];
  emenda?: {
    comandoEmenda?: ItemComandoEmenda[];
  };
}

export interface State {
  articulacao?: Articulacao;
  tipoDocumento: string | undefined;
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
    tipoDocumento: undefined,
    past: past,
    present: present,
    future: future,
    ui: {
      events,
    },
  };
};

export class DefaultState implements State {
  articulacao?: Articulacao;
  tipoDocumento: string | undefined;
  past?: StateEvent[];
  present: StateEvent[] = [];
  future?: StateEvent[];
  ui?: {
    events: StateEvent[];
    message?: Mensagem;
  };
}
