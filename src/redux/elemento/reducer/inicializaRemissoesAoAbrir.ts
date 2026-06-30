import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RemissaoInternaValue } from '../../../model/remissao';
import { SUFIXO_REVISAO } from '../../../model/remissao/remissao';
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
      const rawLexmlId = match[1];
      const textoLink = match[2].trim();

      const isRevisao = rawLexmlId.endsWith(SUFIXO_REVISAO);
      const targetLexmlId = isRevisao ? rawLexmlId.slice(0, -SUFIXO_REVISAO.length) : rawLexmlId;

      const target = buscaDispositivoById(articulacao, targetLexmlId);
      if (target?.uuid === undefined) continue;

      const entry: RemissaoInternaValue = {
        refId: gerarRefId(),
        targetLexmlId,
        targetUuid: target.uuid,
        sourceUuid: dispositivo.uuid,
        textoRef: textoLink,
      };
      if (isRevisao) entry.revisao = true;
      entries.push(entry);
    }

    if (entries.length > 0) {
      remissoes[dispositivo.uuid] = entries;

      // Corrige href e adiciona data-ref-id em dispositivo.texto
      let textoCorrigido = texto;
      for (const entry of entries) {
        const rawId = entry.revisao ? `${entry.targetLexmlId}${SUFIXO_REVISAO}` : entry.targetLexmlId!;
        const hrefAntigo = `href="${rawId}"`;
        const hrefNovo = `href="#lxEtaId${entry.targetUuid}" data-ref-id="${entry.refId}"`;
        textoCorrigido = substituirPrimeiraOcorrencia(textoCorrigido, hrefAntigo, hrefNovo);

        // Limpa @revisar do data-lexml-ref no texto vivo
        if (entry.revisao) {
          textoCorrigido = substituirPrimeiraOcorrencia(textoCorrigido, `data-lexml-ref="${entry.targetLexmlId}${SUFIXO_REVISAO}"`, `data-lexml-ref="${entry.targetLexmlId}"`);
        }
      }
      dispositivo.texto = textoCorrigido;
    }
  }

  return remissoes;
};
