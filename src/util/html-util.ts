export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function stripHtml(texto: string): string {
  return texto.replace(/<[^>]+>/g, '');
}

const TAGS_TITULO_DISPOSITIVO = ['i', 'u', 'sub', 'sup'];

/**
 * Reduz o HTML do título de dispositivo a texto com apenas i, u, sub e sup (sem atributos).
 * Outras tags (inclusive links de remissão) são descartadas, mantendo o texto interno; em vira i.
 */
export function sanitizarTituloDispositivo(html: string | undefined): string {
  if (!html) return '';

  const semBlocosInertes = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const pilha: string[] = [];
  let resultado = '';
  let ultimoIndice = 0;

  for (const m of semBlocosInertes.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g)) {
    resultado += semBlocosInertes.substring(ultimoIndice, m.index);
    ultimoIndice = m.index! + m[0].length;

    const fechamento = m[1] === '/';
    const nome = m[2].toLowerCase() === 'em' ? 'i' : m[2].toLowerCase();
    if (!TAGS_TITULO_DISPOSITIVO.includes(nome)) continue;

    if (!fechamento) {
      pilha.push(nome);
      resultado += `<${nome}>`;
    } else if (pilha.includes(nome)) {
      // Fecha as tags abertas depois desta e as reabre, evitando sobreposição entre elas.
      const reabrir: string[] = [];
      while (pilha[pilha.length - 1] !== nome) {
        const aberta = pilha.pop()!;
        resultado += `</${aberta}>`;
        reabrir.unshift(aberta);
      }
      pilha.pop();
      resultado += `</${nome}>`;
      reabrir.forEach(r => {
        pilha.push(r);
        resultado += `<${r}>`;
      });
    }
  }

  resultado += semBlocosInertes.substring(ultimoIndice);
  while (pilha.length) resultado += `</${pilha.pop()}>`;

  let anterior: string;
  do {
    anterior = resultado;
    resultado = resultado.replace(/<(i|u|sub|sup)><\/\1>/g, '');
  } while (resultado !== anterior);

  return resultado.trim();
}

/**
 * Remove o <span> gerado pelo Parchment Attributor do moduloRemissao ao redor de links de
 * remissão interna/externa. O Quill registra data-lexml-ref e data-ref-id como INLINE_ATTRIBUTE
 * attributors, o que faz o serializer criar um <span> envolvendo o <a> do blot.
 */
export function removerSpanParchmentRemissao(html: string): string {
  // Casa spans com data-lexml-ref OU data-ref-id (ambos criados por Parchment Inline Attributors)
  let resultado = html.replace(/<span\b[^>]*\b(?:data-lexml-ref|data-ref-id)="[^"]*"[^>]*>(<a\b[\s\S]*?<\/a>)<\/span>/gi, '$1');

  // Resíduo sem <a> (unwrap sem limpar atributos); descasca do span mais interno pra fora, camada por camada.
  let anterior: string;
  do {
    anterior = resultado;
    resultado = resultado.replace(/<span\b[^>]*\b(?:data-lexml-ref|data-ref-id)="[^"]*"[^>]*>((?:(?!<span\b)[\s\S])*?)<\/span>/gi, '$1');
  } while (resultado !== anterior);

  return resultado;
}

// Links de remissão (interna ou externa, válidos ou inválidos) reduzidos ao texto: compara textos ignorando só essa marcação.
export function removerMarcacaoRemissao(html: string): string {
  return removerSpanParchmentRemissao(html).replace(/<a\b[^>]*\b(?:class="[^"]*\blexml-remissao-[^"]*"|data-lexml-ref=)[^>]*>([\s\S]*?)<\/a>/gi, '$1');
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
