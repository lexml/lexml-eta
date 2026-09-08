import { RemissaoExternaDetectada } from './lexmlLinker.types';

/** Placeholder literal substituído pelo parser dentro de resolverUrl (LexML.Linker.Decorator.hs, makeTagsAHRef) — não é um valor real. */
const RESOLVER_URL_PLACEHOLDER = 'URNLEXML';

/** Template enviado como resolverUrl na requisição ao WASM — nunca exibido ao usuário, serve só para permitir extrair urn/fragmento do href de volta. */
export const RESOLVER_URL_TEMPLATE = `https://www.lexml.gov.br/urn/${RESOLVER_URL_PLACEHOLDER}`;

const RESOLVER_URL_PREFIXO = RESOLVER_URL_TEMPLATE.slice(0, RESOLVER_URL_TEMPLATE.indexOf(RESOLVER_URL_PLACEHOLDER));

const ENTIDADES_HTML: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** O lexml-linker escapa o HTML decorado com entidades básicas (&amp;/&quot;/etc.) — decodificar é necessário para os offsets baterem com o texto original. */
function decodeEntidadesHtml(texto: string): string {
  return texto.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entidade: string) => {
    if (entidade[0] === '#') {
      const codigo = entidade[1] === 'x' || entidade[1] === 'X' ? parseInt(entidade.slice(2), 16) : parseInt(entidade.slice(1), 10);
      return Number.isNaN(codigo) ? match : String.fromCodePoint(codigo);
    }
    return ENTIDADES_HTML[entidade] ?? match;
  });
}

const REGEX_LINK = /<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;

/**
 * Extrai offsets (relativos ao texto original, sem tags) de remissões externas a partir do
 * HTML decorado devolvido por outputType:"html". outputType:"urns" não devolve posição — ver
 * achado #2 do plano de integração.
 */
export function parseHtmlDecorado(html: string): RemissaoExternaDetectada[] {
  const resultado: RemissaoExternaDetectada[] = [];
  let offsetTextoPlano = 0;
  let ultimoIndice = 0;
  let match: RegExpExecArray | null;

  REGEX_LINK.lastIndex = 0;
  while ((match = REGEX_LINK.exec(html)) !== null) {
    const textoAntes = html.slice(ultimoIndice, match.index);
    offsetTextoPlano += decodeEntidadesHtml(textoAntes).length;

    const href = decodeEntidadesHtml(match[1]);
    const textoRef = decodeEntidadesHtml(match[2]);

    const inicio = offsetTextoPlano;
    const fim = inicio + textoRef.length;

    const hrefSemResolver = href.startsWith(RESOLVER_URL_PREFIXO) ? href.slice(RESOLVER_URL_PREFIXO.length) : href;
    const [targetUrn, targetFragmento] = hrefSemResolver.split('!');

    resultado.push({ inicio, fim, textoRef, targetUrn, targetFragmento: targetFragmento || undefined });

    offsetTextoPlano = fim;
    ultimoIndice = match.index + match[0].length;
  }

  return resultado;
}
