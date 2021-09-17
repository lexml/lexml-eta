import { Elemento } from '../model/elemento';
import { StateEvent, StateType } from './state';

export const getEvento = (eventos: StateEvent[], stateType: StateType): StateEvent => {
  return eventos.filter(ev => ev.stateType === stateType)[0];
};

export const getEventosQuePossuemElementos = (eventos: StateEvent[]): StateEvent[] => {
  return eventos.filter(ev => ev.elementos && ev.elementos.length > 0);
};

export const addElementosAoEvento = (evento: StateEvent, elementos: Elemento[]): void => {
  elementos.forEach(elemento => (evento.elementos?.filter(atual => atual.uuid === elemento.uuid).length === 0 ? evento.elementos.push(elemento) : undefined));
};

export const eventoContem = (stateEvents: StateEvent, elemento: Elemento): boolean => {
  return (
    stateEvents?.elementos!.map(ev => ev.uuid === elemento!.uuid && ev.rotulo === elemento!.rotulo && ev.conteudo?.texto === elemento.conteudo?.texto).filter(value => value)
      .length > 0
  );
};

export const createEventos = (): StateEvent[] => {
  return [
    {
      stateType: StateType.ElementoIncluido,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoRemovido,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoModificado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoRenumerado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoValidado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoSelecionado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
  ];
};

export class Eventos {
  eventos: StateEvent[] = [];

  constructor() {
    this.eventos = createEventos();
  }

  add(stateType: StateType, elementos: Elemento[]): void {
    const evento = this.get(stateType);
    elementos.forEach(el => (!eventoContem(evento, el) ? evento.elementos?.push(el) : undefined));
  }

  build(): StateEvent[] {
    return this.eventos.filter(ev => ev.elementos && ev.elementos.length > 0);
  }

  get(stateType: StateType): StateEvent {
    return this.eventos.filter(ev => ev.stateType === stateType)[0];
  }

  setReferencia(referencia: Elemento): void {
    this.get(StateType.ElementoIncluido).referencia = referencia;
  }
}
