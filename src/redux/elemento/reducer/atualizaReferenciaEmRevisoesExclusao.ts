import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { Elemento } from '../../../model/elemento';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { getDispositivoAnteriorNaSequenciaDeLeitura } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RevisaoElemento } from '../../../model/revisao/revisao';
import { State } from '../../state';
import { findRevisaoByElementoUuid2, isRevisaoPrincipal } from '../util/revisaoUtil';

export const atualizaReferenciaEmRevisoesExclusao = (state: any, action: any): State => {
  const elementos: Elemento[] = action.elementos;
  elementos.forEach(e => {
    const revisao = findRevisaoByElementoUuid2(state.revisoes, e.uuid2) as RevisaoElemento;

    const dImediatamenteAnterior = getDispositivoFromElemento(state.articulacao, e.elementoAnteriorNaSequenciaDeLeitura!)!;

    if (isRevisaoPrincipal(revisao) && dImediatamenteAnterior) {
      const dAnteriorMesmoTipo =
        dImediatamenteAnterior.tipo === revisao.elementoAposRevisao.tipo
          ? dImediatamenteAnterior
          : getDispositivoAnteriorNaSequenciaDeLeitura(dImediatamenteAnterior, (disp: Dispositivo) => disp.tipo === revisao.elementoAposRevisao.tipo);

      const posicao = getPosicaoDispositivo(state.articulacao, dAnteriorMesmoTipo!) + 1;

      revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = e.elementoAnteriorNaSequenciaDeLeitura;
      revisao.elementoAposRevisao.hierarquia!.posicao = posicao;
      if (revisao.elementoAntesRevisao) {
        revisao.elementoAntesRevisao.elementoAnteriorNaSequenciaDeLeitura = e.elementoAnteriorNaSequenciaDeLeitura;
        revisao.elementoAntesRevisao.hierarquia!.posicao = posicao;
      }
    }
  });

  return {
    ...state,
    ui: {
      events: [],
      alertas: state.ui?.alertas,
    },
  };
};

const getPosicaoDispositivo = (articulacao: Articulacao, dispositivo: Dispositivo): number => {
  // const d = getDispositivoFromElemento(articulacao, elemento)!;
  return dispositivo.pai!.indexOf(dispositivo);
};
