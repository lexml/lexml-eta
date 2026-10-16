import { RemissaoExternaValue } from '../../remissao';
import { getNomeExtensoComDataExtenso, validaUrn } from '../documento/urnUtil';
import { AutoFix, Mensagem, TipoMensagem } from '../util/mensagem';

export interface LinkRemissaoExterna {
  refId?: string;
  urn: string;
}

const nomeDaNorma = (urn: string): string => {
  try {
    return (validaUrn(urn) && getNomeExtensoComDataExtenso(urn)) || urn;
  } catch {
    return urn;
  }
};

// Links do DOM são a verdade da tela; o registro só complementa remissões ainda não desenhadas (refId sem link e textoRef no texto). Entrada sem os dois é órfã.
export const reunirUrnsCitadas = (linksNoDom: LinkRemissaoExterna[], registro: RemissaoExternaValue[], textoPlano: string): string[] => {
  const refIdsNoDom = new Set(linksNoDom.map(l => l.refId).filter(Boolean));
  const pendentes = registro.filter(r => !refIdsNoDom.has(r.refId) && !!r.textoRef && textoPlano.includes(r.textoRef)).map(r => r.targetUrn);

  return [...linksNoDom.map(l => l.urn), ...pendentes];
};

export const avaliarNormaAlteradaDivergente = (base: string | undefined, urnsCitadas: string[]): Mensagem | undefined => {
  if (!base || urnsCitadas.length !== 1 || urnsCitadas[0] === base) {
    return undefined;
  }

  return {
    tipo: TipoMensagem.WARNING,
    descricao: `O bloco altera ${nomeDaNorma(base)}, mas o artigo referencia ${nomeDaNorma(urnsCitadas[0])}`,
    fix: true,
    detalhe: { autoFix: AutoFix.NORMA_ALTERADA_DIVERGENTE, urn: urnsCitadas[0] },
  };
};
