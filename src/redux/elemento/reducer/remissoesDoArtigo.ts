import { Artigo } from '../../../model/dispositivo/dispositivo';
import { RemissaoExternaValue } from '../../../model/remissao';

// Remissões do artigo cujo link já está no texto ou cujo textoRef aparece nele (as demais do registro são órfãs).
export const remissoesDoArtigo = (remissoes: Record<string, RemissaoExternaValue> | undefined, artigo: Artigo, ignorarRefId?: string): RemissaoExternaValue[] =>
  Object.values(remissoes ?? {}).filter(
    r => r.sourceUuid === artigo.uuid && r.refId !== ignorarRefId && (artigo.texto.includes(`data-ref-id="${r.refId}"`) || (!!r.textoRef && artigo.texto.includes(r.textoRef)))
  );
