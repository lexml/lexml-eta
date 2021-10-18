import { Elemento } from '../../../model/elemento';
import { StateEvent, StateType } from '../../state';
import { createEventos, eventoContem } from './eventosUtil';

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
