import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isTextoMaiusculo } from '../../../model/dispositivo/tipo';
import { createElemento, criaListaElementosAfinsValidados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { normalizaSeForOmissis } from '../../../model/lexml/conteudo/conteudoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoOriginal } from '../../../model/lexml/situacao/dispositivoOriginal';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

// const houveAlteracaoNoTextoAposAcao = (dispositivo: Dispositivo, action: any): boolean => {
//   const textoAtual = action.atual?.conteudo?.texto;
//   const textoOriginal = dispositivo.situacao.dispositivoOriginal?.conteudo?.texto;
//   return textoAtual !== dispositivo.texto && textoAtual !== textoOriginal;
// };

export const atualizaTextoElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);
  const textoOriginal = dispositivo?.situacao.dispositivoOriginal?.conteudo?.texto;
  const textoAtual = action.atual?.conteudo?.texto;
  const dispositivoOriginalNovamente = dispositivo && textoOriginal === textoAtual;

  if (dispositivo === undefined || dispositivo.texto === textoAtual) {
    state.ui.events = [];
    return state;
  }

  if (dispositivo.bloqueado) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível realizar essa ação em dispositivo bloqueado.' });
  }

  const original = createElemento(dispositivo);

  dispositivo.texto = !isDispositivoAlteracao(dispositivo) ? textoAtual : normalizaSeForOmissis(textoAtual ?? '');

  if (dispositivoOriginalNovamente) {
    dispositivo.situacao = new DispositivoOriginal();
  } else if (dispositivo.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
    dispositivo.situacao = new DispositivoModificado(original);
  }

  const eventosUi = new Eventos();

  const elemento = createElemento(dispositivo, true);
  elemento.mensagens = validaDispositivo(dispositivo);

  // if (houveAlteracaoNoTextoAposAcao(dispositivo, action)) {
  //   eventosUi.add(StateType.ElementoModificado, [elemento]);
  // }

  if (isTextoMaiusculo(dispositivo)) {
    dispositivo.texto = dispositivo.texto.toUpperCase();
  }

  eventosUi.add(StateType.ElementoModificado, [elemento]);
  eventosUi.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(dispositivo));

  if (textoAtual === '') {
    eventosUi.add(StateType.ElementoMarcado, [elemento]);
  }

  eventosUi.eventos.push({ stateType: StateType.ElementoSelecionado, elementos: [elemento] });

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, buildUpdateEvent(dispositivo, original)),
    present: eventos.build(),
    future: [],
    ui: {
      events: eventosUi.build(),
      alertas: state.ui?.alertas,
    },
  };
};
