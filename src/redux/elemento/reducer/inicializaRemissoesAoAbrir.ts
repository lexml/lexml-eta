import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RemissaoInternaValue } from '../../../model/remissao';
import { gerarRefId } from '../../../model/remissao/refId';

// Regex para detectar links de remissão interna pelo atributo data-lexml-ref
const REGEX_REMISSAO_LINK = /<a\b[^>]*data-lexml-ref="([^"]+)"[^>]*>([^<]*)<\/a>/gi;

/**
 * Reconstrói o registry de remissões internas ao abrir um documento,
 * varrendo o HTML de todos os dispositivos em busca de links com data-lexml-ref.
 *
 * Cobre tanto remissões auto-detectáveis quanto manuais com texto não-padrão,
 * eliminando a dependência da detecção por regex incremental no momento da abertura.
 */
export const inicializaRemissoesAoAbrir = (articulacao: Articulacao): Record<number, RemissaoInternaValue[]> => {
  const remissoes: Record<number, RemissaoInternaValue[]> = {};
  const dispositivos = getDispositivoAndFilhosAsLista(articulacao);

  for (const dispositivo of dispositivos) {
    const texto = dispositivo.texto;
    if (!texto || dispositivo.uuid === undefined) continue;

    REGEX_REMISSAO_LINK.lastIndex = 0;
    const entries: RemissaoInternaValue[] = [];
    let match: RegExpExecArray | null;

    while ((match = REGEX_REMISSAO_LINK.exec(texto)) !== null) {
      const targetLexmlId = match[1];
      const textoLink = match[2].trim();

      const target = buscaDispositivoById(articulacao, targetLexmlId);
      if (target?.uuid === undefined) continue;

      entries.push({
        refId: gerarRefId(),
        targetLexmlId,
        targetUuid: target.uuid,
        sourceUuid: dispositivo.uuid,
        textoRef: textoLink,
      });
    }

    if (entries.length > 0) {
      remissoes[dispositivo.uuid] = entries;
    }
  }

  return remissoes;
};
