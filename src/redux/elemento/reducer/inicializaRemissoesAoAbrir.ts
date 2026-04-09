import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RemissaoInternaValue } from '../../../model/remissao';
import { gerarRefId } from '../../../model/remissao/refId';

// Regex para detectar links de remissão interna pelo atributo data-lexml-ref
const REGEX_REMISSAO_LINK = /<a\b[^>]*data-lexml-ref="([^"]+)"[^>]*>([^<]*)<\/a>/gi;

// Substitui apenas a primeira ocorrência de `busca` em `texto`
const substituirPrimeiraOcorrencia = (texto: string, busca: string, substituto: string): string => {
  const idx = texto.indexOf(busca);
  if (idx === -1) return texto;
  return texto.substring(0, idx) + substituto + texto.substring(idx + busca.length);
};

/**
 * Reconstrói o registry de remissões internas ao abrir um documento,
 * varrendo o HTML de todos os dispositivos em busca de links com data-lexml-ref.
 * Corrige dispositivo.texto substituindo href="lexmlId" por
 * href="#lxEtaId{uuid}" e adicionando data-ref-id="{refId}"
 * Deve ser chamado ANTES de load() em abreArticulacao para que
 * a correção do texto seja refletida nos Elementos criados por getElementos().
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

      // Corrige href e adiciona data-ref-id em dispositivo.texto
      let textoCorrigido = texto;
      for (const entry of entries) {
        const hrefAntigo = `href="${entry.targetLexmlId}"`;
        const hrefNovo = `href="#lxEtaId${entry.targetUuid}" data-ref-id="${entry.refId}"`;
        textoCorrigido = substituirPrimeiraOcorrencia(textoCorrigido, hrefAntigo, hrefNovo);
      }
      dispositivo.texto = textoCorrigido;
    }
  }

  return remissoes;
};
