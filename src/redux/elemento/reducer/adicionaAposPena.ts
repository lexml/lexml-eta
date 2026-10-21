import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isCaput } from '../../../model/dispositivo/tipo';
import { createElemento, createElementoValidado } from '../../../model/elemento/elementoUtil';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../model/lexml/util/idUtil';
import { State, StateType } from '../../state';
import { buildEventoAdicionarElemento } from '../evento/eventosUtil';
import { textoFoiModificado } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

// Enter no fim da pena: cria um irmão do dono logo depois dele (na pena do caput, o primeiro parágrafo do artigo).
// Enter antes do fim, ou no início, não tem efeito: a pena não é desmembrada.
export const adicionaAposPena = (state: any, action: any, pena: Dispositivo): State => {
  if (action.posicao === 'antes' || action.novo?.conteudo?.texto) {
    state.ui.events = [];
    return state;
  }

  const elementoPenaOriginal = createElementoValidado(pena);
  const textoModificado = textoFoiModificado(pena, action, state);
  if (textoModificado) {
    pena.texto = action.atual.conteudo?.texto ?? pena.texto;
  }

  const dono = isCaput(pena.pai!) ? pena.pai!.pai! : pena.pai!;
  const novo = isCaput(pena.pai!)
    ? criaDispositivo(dono, TipoDispositivo.paragrafo.tipo, undefined, (dono as Artigo).caput!.filhos.length)
    : criaDispositivo(dono.pai!, dono.tipo, dono);
  novo.texto = '';

  novo.pai!.renumeraFilhos();
  updateIdDispositivoAndFilhos(novo.pai!);

  const eventos = buildEventoAdicionarElemento(pena, novo);

  if (textoModificado) {
    const elementoPenaAtualizado = createElementoValidado(pena);
    eventos.add(StateType.ElementoModificado, [elementoPenaOriginal, elementoPenaAtualizado]);
    eventos.add(StateType.ElementoValidado, [elementoPenaAtualizado]);
  }
  eventos.add(StateType.ElementoMarcado, [createElemento(novo), createElemento(pena)]);

  const builtEvents = eventos.build();
  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, builtEvents),
    present: builtEvents,
    future: [],
    ui: {
      events: builtEvents,
      alertas: state.ui?.alertas,
    },
  };
};
