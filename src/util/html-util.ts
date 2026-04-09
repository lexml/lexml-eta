export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function stripHtml(texto: string): string {
  return texto.replace(/<[^>]+>/g, '');
}

/**
 * Remove o <span> gerado pelo Parchment Attributor do moduloRemissao ao redor de links de
 * remissão interna. O Quill registra data-lexml-ref e data-ref-id como INLINE_ATTRIBUTE
 * attributors, o que faz o serializer criar um <span> envolvendo o <a> do blot.
 */
export function removerSpanParchmentRemissao(html: string): string {
  return html.replace(/<span\b[^>]*\bdata-lexml-ref="[^"]*"[^>]*>(<a\b[\s\S]*?<\/a>)<\/span>/gi, '$1');
}

/**
 * Substitui textoRef por um link de remissão interna no trecho de html que está fora de
 * elementos <a> já existentes. Só substitui a primeira ocorrência encontrada.
 */
export function substituirTextoRefForaDeLinks(html: string, textoRef: string, targetLexmlId: string): string {
  if (!html.includes(textoRef)) return html;
  const link = `<a href="${targetLexmlId}" data-lexml-ref="${targetLexmlId}" class="lexml-remissao-interna" target="_self">${textoRef}</a>`;
  // split com grupo capturante preserva os delimitadores no array resultante
  const partes = html.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi);
  for (let i = 0; i < partes.length; i += 2) {
    // índices pares: segmentos fora de links; índices ímpares: links existentes
    if (partes[i].includes(textoRef)) {
      partes[i] = partes[i].replace(textoRef, link);
      break;
    }
  }
  return partes.join('');
}
