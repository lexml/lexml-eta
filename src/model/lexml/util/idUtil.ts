import { Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao, isCaput, isOmissis } from '../../dispositivo/tipo';
import { getDispositivosAnterioresMesmoTipo, isUnicoMesmoTipo } from '../hierarquia/hierarquiaUtil';
import { converteLetraComplementoParaNumero } from './../numeracao/numeracaoUtil';

export const buildHref = (dispositivo: Dispositivo): string | undefined => {
  if (isArticulacao(dispositivo)) {
    return 'cpt_alt1';
  }

  if (dispositivo.tagId) {
    return (
      dispositivo.tagId +
      (isCaput(dispositivo)
        ? ''
        : isOmissis(dispositivo)
        ? getDispositivosAnterioresMesmoTipo(dispositivo).length + 1
        : dispositivo.numero
        ? dispositivo.numero === '1' && isUnicoMesmoTipo(dispositivo)
          ? '1u'
          : converteLetraComplementoParaNumero(dispositivo.numero!)
        : `[urn:${dispositivo.uuid}]`)
    );
  }

  return undefined;
};

const buildHierarquia = (dispositivo: Dispositivo, idArray: string[] = []): void => {
  if (isArticulacao(dispositivo) && dispositivo.pai === undefined) {
    return;
  }

  const href = buildHref(dispositivo);

  if (href) {
    idArray.unshift(href);
  }

  buildHierarquia(dispositivo.pai!, idArray);
};

export const buildId = (dispositivo: Dispositivo): string => {
  const idArray = [];

  buildHierarquia(dispositivo, idArray);

  return idArray.join('_');
};

export const buildIdAlteracao = (dispositivo: Dispositivo): string => {
  const idArray = [];

  buildHierarquia(dispositivo, idArray);

  return idArray.join('_') + '_alt1';
};

/* export const gHref = (dispositivo: Dispositivo): string => {
  if (!dispositivo.numero && dispositivo.rotulo) {
    dispositivo.createNumeroFromRotulo(dispositivo.rotulo);
  }
  return dispositivo.numero ?? '';
}; */
