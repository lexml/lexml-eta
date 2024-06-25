import { DescricaoSituacao } from './../../dispositivo/situacao';
import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao, isCaput, isOmissis } from '../../dispositivo/tipo';
import { getDispositivoAndFilhosAsLista, getDispositivosAnterioresMesmoTipo, isAdicionado, isUnicoMesmoTipo } from '../hierarquia/hierarquiaUtil';
import { isArtigo, isParagrafo } from './../../dispositivo/tipo';
import { getArticulacao, isDispositivoAlteracao, irmaosMesmoTipo } from './../hierarquia/hierarquiaUtil';

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
        ? calculaSequencialOmissis(dispositivo)
        : dispositivo.numero
        ? (isArtigo(dispositivo) || isParagrafo(dispositivo)) && dispositivo.numero === '1' && isUnicoMesmoTipo(dispositivo)
          ? '1u'
          : dispositivo.numero!
        : `[sn:${dispositivo.uuid}]`)
    );
  }

  return undefined;
};

function calculaSequencialOmissis(dispositivo: Dispositivo): number {
  if (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
    // Diferencia omissis de incisos de caput de omissis de parágrafo
    const irmaos = irmaosMesmoTipo(dispositivo).filter(d => d.pai === dispositivo.pai);
    // Dispositivos não adicionados primeiro.
    irmaos.sort((d1, d2) => {
      const s1 = d1.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO ? 1 : 0;
      const s2 = d2.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO ? 1 : 0;
      const order = s1 - s2;
      return order ? order : dispositivo.pai!.indexOf(d1) - dispositivo.pai!.indexOf(d2);
    });
    return irmaos.indexOf(dispositivo) + 1;
  }
  return getDispositivosAnterioresMesmoTipo(dispositivo).length + 1;
}

const buildHierarquia = (dispositivo: Dispositivo, idArray: string[] = []): void => {
  if (isArticulacao(dispositivo) && dispositivo.pai === undefined) {
    return;
  }

  const href = buildHref(dispositivo);

  if (href) {
    idArray.unshift(href);
  }

  // ID de artigo e de dispositivos de artigo não incluem ids de agrupadores de artigo.
  if (isArtigo(dispositivo)) {
    if (isDispositivoAlteracao(dispositivo)) {
      // Pula agrupadores de artigo dentro do bloco de alteração
      const alteracao = getArticulacao(dispositivo);
      buildHierarquia(alteracao, idArray);
    }
    return;
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

export const buildIdCaputEAlteracao = (dispositivo: Dispositivo): void => {
  const caput = (dispositivo as Artigo).caput;
  caput && (caput.id = buildId(caput));
  dispositivo.alteracoes && (dispositivo.alteracoes.id = buildId(dispositivo.alteracoes));
};

/* export const gHref = (dispositivo: Dispositivo): string => {
  if (!dispositivo.numero && dispositivo.rotulo) {
    dispositivo.createNumeroFromRotulo(dispositivo.rotulo);
  }
  return dispositivo.numero ?? '';
}; */

export const updateIdDispositivoAndFilhos = (dispositivo: Dispositivo): void => {
  getDispositivoAndFilhosAsLista(dispositivo)
    .filter(isAdicionado)
    .forEach(d => {
      d.id = buildId(d);
      isArtigo(d) && buildIdCaputEAlteracao(d);
    });
};
