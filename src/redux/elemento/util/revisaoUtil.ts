import { Elemento, Referencia } from '../../../model/elemento';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State } from '../../state';

export const getRevisoesElemento = (revisoes: Revisao[] = []): RevisaoElemento[] => {
  return revisoes.filter(r => r instanceof RevisaoElemento).map(r => r as RevisaoElemento);
};

export const findRevisaoById = (revisoes: Revisao[] = [], idRevisao: string): Revisao | undefined => {
  return revisoes?.find(r => r.id === idRevisao);
};

export const findRevisaoByElemento = (revisoes: Revisao[] = [], elemento: Elemento | Referencia | undefined): RevisaoElemento | undefined => {
  const { uuid = 0, lexmlId = '?' } = elemento || {};
  return getRevisoesElemento(revisoes).find(r => r.localizadorElementoRevisado.uuid === uuid || r.localizadorElementoRevisado.lexmlId === lexmlId);
};

export const findRevisaoByElementoUuid = (revisoes: Revisao[] = [], uuid = 0): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes).find(r => r.localizadorElementoRevisado.uuid === uuid);
};

export const findRevisaoByElementoLexmlId = (revisoes: Revisao[] = [], lexmlId = '?'): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes).find(r => r.localizadorElementoRevisado.lexmlId === lexmlId);
};

export const existeRevisaoParaElementos = (revisoes: Revisao[] = [], elementos: Elemento[]): boolean => {
  const revisoesElemento = getRevisoesElemento(revisoes);
  return elementos.every(e => revisoesElemento.some(r => r.localizadorElementoRevisado.uuid === e.uuid));
};

export const montarListaDeRevisoesParaRemover = (state: State, revisao: Revisao): Revisao[] => {
  const result = [revisao];
  // if (revisao.idRevisaoAssociada) {
  //   const revisaoAssociada = findRevisaoById(state.revisoes, revisao.idRevisaoAssociada);
  //   revisaoAssociada && result.push(revisaoAssociada);
  // }
  if (revisao.idsRevisoesAssociadas.length) {
    revisao.idsRevisoesAssociadas.forEach(id => {
      const revisaoAssociada = findRevisaoById(state.revisoes, id);
      revisaoAssociada && result.push(revisaoAssociada);
    });
  }
  return result;
};

export const identificarRevisaoElementoPai = (revisoes: Revisao[] = []): Revisao[] => {
  return revisoes.map(r => {
    if (r instanceof RevisaoElemento) {
      const elementoPai = r.elementoAntesRevisao?.hierarquia?.pai;
      const rPai = elementoPai && findRevisaoByElementoUuid(revisoes, elementoPai.uuid);
      if (rPai && rPai.elementoAntesRevisao?.descricaoSituacao === r.elementoAntesRevisao?.descricaoSituacao) {
        r.idRevisaoElementoPai = rPai.id;
        r.idRevisaoElementoPrincipal = findRevisaoElementoPrincipal(revisoes, rPai)?.id;
      }
      return r;
    }
    return r;
  });
};

export const findRevisaoElementoPrincipal = (revisoes: Revisao[], rPai: RevisaoElemento): RevisaoElemento | undefined => {
  const rAux = rPai && findRevisaoByElementoUuid(revisoes, rPai.elementoAntesRevisao?.hierarquia?.pai?.uuid);
  return rAux ? findRevisaoElementoPrincipal(revisoes, rAux) : rPai;
};
