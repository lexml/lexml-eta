import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { RemissaoExternaValue } from '../../../model/remissao';
import { gerarRefId } from '../../../model/remissao/refId';
import { getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';

const REGEX_REMISSAO_EXTERNA_LINK = /<a\b[^>]*data-urn="([^"]+)"[^>]*>([^<]*)<\/a>/gi;

const substituirPrimeiraOcorrencia = (texto: string, busca: string, substituto: string): string => {
  const idx = texto.indexOf(busca);
  if (idx === -1) return texto;
  return texto.substring(0, idx) + substituto + texto.substring(idx + busca.length);
};

/**
 * Reconstrói o registry de remissões externas ao abrir um documento,
 * varrendo o HTML de todos os dispositivos em busca de links com data-urn.
 * Também adiciona data-ref-id ao link em dispositivo.texto para que o blot
 * Quill consiga identificar a remissão pelo refId.
 */
export const inicializaRemissoesExternasAoAbrir = (articulacao: Articulacao): Record<string, RemissaoExternaValue> => {
  const remissoesExternas: Record<string, RemissaoExternaValue> = {};
  const dispositivos = getDispositivoAndFilhosAsLista(articulacao);

  for (const dispositivo of dispositivos) {
    const texto = dispositivo.texto;
    if (!texto || dispositivo.uuid === undefined) continue;

    REGEX_REMISSAO_EXTERNA_LINK.lastIndex = 0;
    let textoAtualizado = texto;
    let match: RegExpExecArray | null;

    while ((match = REGEX_REMISSAO_EXTERNA_LINK.exec(texto)) !== null) {
      const fullMatch = match[0];
      const urn = match[1];
      const textoLink = match[2].trim();

      const fragmentoMatch = fullMatch.match(/data-fragmento="([^"]+)"/);
      const refIdExistente = fullMatch.match(/data-ref-id="([^"]+)"/);

      const refId = refIdExistente ? refIdExistente[1] : gerarRefId();

      const value: RemissaoExternaValue = {
        refId,
        targetUrn: urn,
        targetNomeNorma: '',
        targetFragmento: fragmentoMatch ? fragmentoMatch[1] : undefined,
        textoRef: textoLink,
        sourceUuid: dispositivo.uuid,
      };

      remissoesExternas[refId] = value;

      if (!refIdExistente) {
        const novoTag = fullMatch.replace(`data-urn="${urn}"`, `data-urn="${urn}" data-ref-id="${refId}"`);
        textoAtualizado = substituirPrimeiraOcorrencia(textoAtualizado, fullMatch, novoTag);
      }
    }

    if (textoAtualizado !== texto) {
      dispositivo.texto = textoAtualizado;
    }
  }

  return remissoesExternas;
};
