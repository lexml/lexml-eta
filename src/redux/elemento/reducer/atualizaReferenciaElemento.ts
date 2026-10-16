import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { buildHtmlLink, formataNumero, getDataPorExtenso, getNomeExtensoComDataExtenso, getNumero, getTipo, validaUrn } from '../../../model/lexml/documento/urnUtil';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';
import { escapeRegex } from '../../../util/string-util';
import { Artigo } from '../../../model/dispositivo/dispositivo';
import { remissoesDoArtigo } from './remissoesDoArtigo';

const REGEX_REMISSAO_EXTERNA = /<a\b[^>]*\bdata-urn="/i;

export const atualizaReferenciaElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  const urnNova = action.atual.norma;
  const urnAnterior = dispositivo?.alteracoes!.base || '';
  // Só casa o link comum da norma anterior; sem norma anterior não há link a trocar (antes casava qualquer <a>, inclusive remissões).
  const regex = urnAnterior ? new RegExp(`<a(?![^>]*lexml-remissao)[^>]*href=.${escapeRegex(urnAnterior)}[^>]*>.*?</a>`, 'ig') : undefined;
  const normaExtenso = getNomeExtensoComDataExtenso(urnNova);

  if (dispositivo === undefined || !dispositivo.alteracoes || (urnAnterior === urnNova && regex && dispositivo.texto.match(regex))) {
    state.ui.events = [];
    return state;
  }

  const normaLink = buildHtmlLink(urnNova);
  const textoDispositivo = dispositivo.texto;

  // Ao vivo o texto do estado não tem o link da remissão externa (só o Quill), por isso o registro também conta.
  if (REGEX_REMISSAO_EXTERNA.test(textoDispositivo) || remissoesDoArtigo(state.remissoesExternas, dispositivo as Artigo).length > 0) {
    // Texto já cita a norma como remissão externa: só o base muda, o link é preservado.
  } else if (regex && dispositivo.texto.match(regex)) {
    dispositivo.texto = textoDispositivo.replace(regex, normaLink);
  } else if (dispositivo.texto.includes(normaExtenso)) {
    dispositivo.texto = textoDispositivo.replace(normaExtenso, normaLink);
  } else if (urnNova && validaUrn(urnNova) && (dispositivo.texto === undefined || dispositivo.texto?.trim() === '')) {
    const genero = getTipo(urnNova)?.genero;

    const textoUrn = `${getTipo(urnNova).descricao} nº ${formataNumero(getNumero(urnNova))}, de ${getDataPorExtenso(urnNova)}`;
    dispositivo.texto = `${genero && genero === 'M' ? 'O' : 'A'} <a href="${urnNova}">${textoUrn}</a>, passa a vigorar com as seguintes alterações:`;
  } else {
    const index = parseInt(localStorage.indexCursor);
    dispositivo.texto = [textoDispositivo.slice(0, index), normaLink, textoDispositivo.slice(index)].join(' ');
    localStorage.removeItem('indexCursor');
  }

  const original = createElemento(dispositivo);

  dispositivo.alteracoes!.base = urnNova;

  const eventosUi = new Eventos();

  const elemento = createElemento(dispositivo, true);
  elemento.mensagens = validaDispositivo(dispositivo);

  eventosUi.add(StateType.ElementoValidado, [elemento]);
  eventosUi.add(StateType.ElementoModificado, [elemento]);
  eventosUi.add(StateType.SituacaoElementoModificada, [elemento]);

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, buildUpdateEvent(dispositivo, original)),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventosUi.build(),
      alertas: state.ui?.alertas,
    },
  };
};
