// Identifica (sigla, número, ano) de um documento de teste da demo a partir da URN e extrai a ementa.

const SIGLA_POR_TIPO = {
  'projeto.lei': 'PL',
  'projeto.lei.complementar': 'PLP',
  'medida.provisoria': 'MPV',
};

export const SIGLAS_SERVIDAS = Object.values(SIGLA_POR_TIPO);

/** Retorna { sigla, numero, ano } ou undefined (tipo não servido ou URN sem número/ano, ex.: LEXML_URN_ID). */
export const identificarPorUrn = urn => {
  const partes = String(urn ?? '')
    .replace('urn:lex:br:', '')
    .split(':');
  const tipo = (partes[1] ?? '').split(';')[0];
  const sigla = SIGLA_POR_TIPO[tipo];
  const anoNumero = /^(\d{4})(?:-\d{2}-\d{2})?;(\d+)/.exec(partes[2] ?? '');
  if (!sigla || !anoNumero) return undefined;
  return { sigla, numero: String(Number(anoNumero[2])), ano: anoNumero[1] };
};

const textoDe = no => {
  if (typeof no === 'string') return no;
  if (Array.isArray(no)) return no.map(textoDe).join('');
  if (no && typeof no === 'object') return textoDe(no.content ?? no.value?.content ?? '');
  return '';
};

export const extrairEmenta = documento => textoDe(documento?.value?.projetoNorma?.norma?.parteInicial?.ementa?.content).replace(/\s+/g, ' ').trim();
