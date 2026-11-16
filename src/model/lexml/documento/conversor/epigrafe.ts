// Quebra de linha da epígrafe (#1053). Só a epígrafe aceita `br`: ementa e dispositivos seguem os conversores gerais.
const NAMESPACE_LEXML = 'http://www.lexml.gov.br/1.0';
const REGEX_QUEBRA = /<br\s*\/?>/i;

export const QUEBRA_LINHA_EPIGRAFE = '<br/>';

export const criaElementoBr = (): any => ({
  name: { namespaceURI: NAMESPACE_LEXML, localPart: 'br', prefix: '', key: `{${NAMESPACE_LEXML}}br`, string: `{${NAMESPACE_LEXML}}br` },
  value: { TYPE_NAME: 'br_gov_lexml__1.Br' },
});

export const isElementoBr = (elemento: any): boolean => elemento?.name?.localPart === 'br';

// Junta os conteúdos de cada trecho com um `br` entre eles.
const intercalaQuebras = (trechos: any[][]): any[] => trechos.flatMap((conteudo, i) => (i === 0 ? conteudo : [criaElementoBr(), ...conteudo]));

// Ao salvar: cada trecho passa pelo conversor geral do texto.
export const montaConteudoEpigrafe = (html: string, montaTrecho: (trecho: string) => any[]): any[] =>
  intercalaQuebras(html.split(new RegExp(REGEX_QUEBRA, 'gi')).map(trecho => (trecho ? montaTrecho(trecho) : [])));

// Ao abrir: o `br` vira `<br/>`; o resto passa pelo conversor geral.
export const lerConteudoEpigrafe = (content: any[] | undefined, lerTrecho: (content: any[]) => string): string =>
  (content ?? []).map(elemento => (isElementoBr(elemento) ? QUEBRA_LINHA_EPIGRAFE : lerTrecho([elemento]))).join('');

// Epígrafe recebida como XML (ex.: de `montaEpigrafe`): entidades viram texto, o `br` vira elemento e os demais elementos ficam só com o texto.
export const montaConteudoEpigrafeDeXml = (xml: string): any[] => {
  const raiz = new DOMParser().parseFromString(`<epigrafe>${xml}</epigrafe>`, 'application/xml').documentElement;
  if (raiz.getElementsByTagName('parsererror').length) return [xml];
  const conteudo: any[] = [];
  const percorre = (no: Node): void =>
    no.childNodes.forEach(filho => {
      if (filho.nodeType === Node.ELEMENT_NODE && (filho as Element).localName === 'br') conteudo.push(criaElementoBr());
      else if (filho.nodeType === Node.ELEMENT_NODE) percorre(filho);
      else if (filho.textContent) conteudo.push(filho.textContent);
    });
  percorre(raiz);
  return conteudo;
};
