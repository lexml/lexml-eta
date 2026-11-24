import { Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao, isArtigo, isCaput, isOmissis, isPena } from '../../dispositivo/tipo';
import { getArticulacao, percorreHierarquiaDispositivos } from '../hierarquia/hierarquiaUtil';
import { buildHref } from '../util/idUtil';

export const MENSAGEM_NUMERACAO_REPETIDA = 'Existem dispositivos com numeração repetida.';

const participa = (d: Dispositivo): boolean => !isArticulacao(d) && !isCaput(d) && !isOmissis(d) && !isPena(d);

// O artigo se compara com todos os artigos da articulação (o id dele não inclui agrupadores); os demais, com os irmãos.
const getGrupo = (d: Dispositivo): Dispositivo[] | undefined => (isArtigo(d) ? getArticulacao(d)?.artigos : d.pai?.filhos);

/** Verdadeiro quando um dispositivo anterior do mesmo grupo tem o mesmo identificador: só a causa da repetição, nunca o descendente que a herda. */
export const isNumeracaoRepetida = (dispositivo: Dispositivo): boolean => {
  if (!participa(dispositivo)) {
    return false;
  }
  const href = buildHref(dispositivo);
  const grupo = getGrupo(dispositivo);
  const posicao = grupo?.indexOf(dispositivo) ?? -1;
  if (!href || !grupo || posicao <= 0) {
    return false;
  }
  return grupo.slice(0, posicao).some(anterior => participa(anterior) && buildHref(anterior) === href);
};

/** Uuids dos dispositivos com numeração repetida, calculados numa única passada em ordem de leitura. */
export const getUuidsComNumeracaoRepetida = (articulacao: Dispositivo): Set<number> => {
  const repetidos = new Set<number>();
  const vistos = new Map<Dispositivo, Set<string>>();

  percorreHierarquiaDispositivos(articulacao, d => {
    if (!participa(d)) {
      return;
    }
    const href = buildHref(d);
    const grupo = isArtigo(d) ? getArticulacao(d) : d.pai;
    if (!href || !grupo) {
      return;
    }
    const hrefsDoGrupo = vistos.get(grupo) ?? new Set<string>();
    vistos.set(grupo, hrefsDoGrupo);
    if (hrefsDoGrupo.has(href)) {
      repetidos.add(d.uuid!);
    }
    hrefsDoGrupo.add(href);
  });

  return repetidos;
};
