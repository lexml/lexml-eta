import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArtigo, isIncisoCaput, isOmissis } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  buscaProximoOmissis as buscaProximoOmissisSequencial,
  getDispositivoAnterior,
  getDispositivoPosterior,
  getUltimoFilho,
  hasFilhos,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { AutoFix } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildPast } from '../util/stateReducerUtil';
import { solicitaNorma } from './solicitaNorma';

const hasFix = (dispositivo: Dispositivo): boolean => {
  return (dispositivo.mensagens?.filter(m => m.fix) ?? []).length > 0;
};

export const autoFixElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined || !hasFix(atual)) {
    state.ui.events = [];
    return state;
  }

  const eventos = new Eventos();

  switch (action.mensagem?.descricao) {
    case AutoFix.INFORMAR_NORMA: {
      return solicitaNorma(state, action);
    }
    case AutoFix.OMISSIS_ANTES: {
      const anterior = getDispositivoAnterior(atual);

      const novo = criaDispositivo(atual.pai!, TipoDispositivo.omissis.tipo, anterior, anterior ? undefined : 0);
      novo.situacao = new DispositivoAdicionado();
      novo.mensagens = validaDispositivo(novo);
      const elementoNovo = createElemento(novo, true);

      atual.mensagens = validaDispositivo(atual);
      const elementoAtual = createElemento(atual);
      eventos.add(StateType.ElementoIncluido, [elementoNovo]);
      eventos.add(StateType.ElementoValidado, [elementoAtual]);

      let ref;

      if (anterior) {
        ref = isArtigo(anterior) && hasFilhos(anterior) ? getUltimoFilho(anterior) : anterior;
      } else {
        ref = isIncisoCaput(atual) ? atual.pai!.pai! : atual.pai!;
      }

      eventos.setReferencia(createElemento(ref));
      break;
    }
    case AutoFix.OMISSIS_SEQUENCIAIS: {
      const removido = createElemento(atual);
      let proximo = getDispositivoPosterior(atual);

      if (!proximo || !isOmissis(proximo)) {
        proximo = buscaProximoOmissisSequencial(atual.pai!);
      }

      const pai = atual.pai!;
      pai.removeFilho(atual);
      pai.renumeraFilhos();

      eventos.add(StateType.ElementoRemovido, [removido]);
      proximo && eventos.add(StateType.ElementoValidado, [createElemento(proximo)]);

      break;
    }
    default:
      state.ui = [];
      return state;
  }

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: [],
    ui: {
      events: eventos.build(),
      alertas: state.ui?.alertas,
    },
  };
};
