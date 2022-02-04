import { Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao, isCaput, isOmissis } from '../../dispositivo/tipo';
import { getDispositivosAnterioresMesmoTipo } from '../hierarquia/hierarquiaUtil';

const buildHierarquia = (dispositivo: Dispositivo, idArray: string[] = []): void => {
  if (isArticulacao(dispositivo) && dispositivo.pai === undefined) {
    return;
  }

  if (isArticulacao(dispositivo)) {
    idArray.unshift('cpt_alt1');
  }

  if (dispositivo.tagId) {
    dispositivo.createNumeroFromRotulo(dispositivo.rotulo ?? '');
    const tagIdParcial = dispositivo.tagId + (isCaput(dispositivo) ? '' : isOmissis(dispositivo) ? getDispositivosAnterioresMesmoTipo(dispositivo).length + 1 : dispositivo.numero);

    idArray.unshift(tagIdParcial);
  }

  buildHierarquia(dispositivo.pai!, idArray);
};

export const buildId = (dispositivo: Dispositivo): string => {
  const idArray = [];

  buildHierarquia(dispositivo, idArray);

  return idArray.join('_');
};
