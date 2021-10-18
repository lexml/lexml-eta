import { Mensagem } from '../../../model/lexml/util/mensagem';
import { State, StateEvent } from '../../state';

const count = 0;

export const buildPast = (state: any, events: any): StateEvent[] => {
  const past = state.past ? state.past : [];
  past.push(JSON.parse(JSON.stringify(events)));

  return count > 50 ? past.shift() : past;
};

export const buildFuture = (state: any, events: any): StateEvent[] => {
  const future = state.future ? state.future : [];
  future.push(JSON.parse(JSON.stringify(events)));

  return count > 50 ? future.shift() : future;
};

export const retornaEstadoAtualComMensagem = (state: any, mensagem: Mensagem): State => {
  return {
    articulacao: state.articulacao,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: state.ui?.events,
      message: mensagem,
    },
  };
};
