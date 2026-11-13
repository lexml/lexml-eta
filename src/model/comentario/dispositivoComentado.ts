import { Articulacao, Dispositivo } from '../dispositivo/dispositivo';
import { Elemento } from '../elemento';
import { percorreHierarquiaDispositivos } from '../lexml/hierarquia/hierarquiaUtil';
import { Revisao, RevisaoElemento } from '../revisao/revisao';
import { buscarDispositivoPorUuid2 } from '../remissao/sincronizarRemissoes';
import { StateType } from '../../redux/state';
import { identificarDispositivoComentado, identificarLexmlId } from './identificacaoDispositivo';

// Ementa e preâmbulo ficam na parte inicial, fora da árvore da articulação.
const parteInicial = (articulacao: Articulacao): Dispositivo[] => [articulacao.projetoNorma?.ementa, articulacao.projetoNorma?.preambulo].filter((d): d is Dispositivo => !!d);

export const buscarDispositivoComentado = (articulacao: Articulacao | undefined, uuid2: string): Dispositivo | undefined => {
  if (!articulacao || !uuid2) {
    return undefined;
  }
  return parteInicial(articulacao).find(d => d.uuid2 === uuid2) ?? buscarDispositivoPorUuid2(articulacao, uuid2);
};

// Excluir em revisão tira o dispositivo da articulação; só a revisão pendente guarda o elemento (com o mesmo uuid2).
export const buscarElementoExcluidoEmRevisao = (revisoes: Revisao[] | undefined, uuid2: string): Partial<Elemento> | undefined =>
  (revisoes ?? [])
    .filter((r): r is RevisaoElemento => (r as RevisaoElemento).stateType === StateType.ElementoRemovido)
    .map(r => r.elementoAntesRevisao ?? r.elementoAposRevisao)
    .find(e => e?.uuid2 === uuid2);

export const isDispositivoComentadoVivo = (articulacao: Articulacao | undefined, revisoes: Revisao[] | undefined, uuid2: string): boolean =>
  !!buscarDispositivoComentado(articulacao, uuid2) || !!buscarElementoExcluidoEmRevisao(revisoes, uuid2);

export const identificarPorUuid2 = (articulacao: Articulacao | undefined, revisoes: Revisao[] | undefined, uuid2: string): string => {
  const dispositivo = buscarDispositivoComentado(articulacao, uuid2);
  if (dispositivo) {
    return identificarDispositivoComentado(dispositivo);
  }
  const excluido = buscarElementoExcluidoEmRevisao(revisoes, uuid2);
  return excluido?.lexmlId ? identificarLexmlId(excluido.lexmlId) : '';
};

/** Posição de cada dispositivo na ordem do texto, pelo uuid2: parte inicial e depois a articulação. */
export const getOrdemDosDispositivos = (articulacao: Articulacao | undefined): Map<string, number> => {
  const ordem = new Map<string, number>();
  if (!articulacao) {
    return ordem;
  }
  parteInicial(articulacao).forEach(d => ordem.set(d.uuid2!, ordem.size));
  percorreHierarquiaDispositivos(articulacao as unknown as Dispositivo, d => d.uuid2 && !ordem.has(d.uuid2) && ordem.set(d.uuid2, ordem.size));
  return ordem;
};
