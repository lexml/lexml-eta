import { Artigo } from '../../../model/dispositivo/dispositivo';
import { isArtigo, isCaput, isPena } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { AdicionarPena } from '../../../model/lexml/acao/penaAction';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { normalizaRotuloPena } from '../../../model/lexml/numeracao/rotuloPena';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { buildEventoAdicionarElemento } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const adicionaPena = (state: any, action: any): State => {
  const referencia = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (referencia === undefined) {
    state.ui.events = [];
    return state;
  }

  // Cobre também a segunda pena no mesmo dono: o menu não a oferece, mas o modelo aceitaria.
  if (!isAcaoPermitida(referencia, AdicionarPena)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível adicionar pena ao dispositivo.' });
  }

  const dono = isArtigo(referencia) ? (referencia as Artigo).caput! : referencia;
  const primeiraPena = getDispositivoAndFilhosAsLista(state.articulacao).find(isPena);
  const rotulo = normalizaRotuloPena(action.rotulo ?? primeiraPena?.rotulo);

  const novo = criaDispositivo(dono, TipoDispositivo.pena.tipo);
  novo.texto = '';
  novo.rotulo = rotulo;
  updateIdDispositivoAndFilhos(referencia);

  // A pena é o último filho: a linha entra depois do penúltimo (ou do próprio artigo, no caput sem filhos).
  const penultimo = dono.filhos.length > 1 ? dono.filhos[dono.filhos.length - 2] : undefined;
  const eventos = buildEventoAdicionarElemento(penultimo ?? (isCaput(dono) ? dono.pai! : dono), novo);
  eventos.add(StateType.ElementoMarcado, [createElemento(novo)]);

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
