import { DocumentoMateria } from './urlsNovaProposicao';

/** "AAAA-MM-DD" -> "DD/MM/AAAA"; valor fora do formato é devolvido como veio. */
export const formataDataApresentacao = (data: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((data ?? '').trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (data ?? '').trim();
};

/** "PL 117/2025", "PRL 1 CSAUDE" (ano e comissão só quando existem). */
export const identificacaoDocumento = (doc: DocumentoMateria): string =>
  [`${doc.sigla} ${doc.numero}${doc.ano ? `/${doc.ano}` : ''}`, doc.siglaComissao].filter(parte => !!parte && String(parte).trim()).join(' ');

/** "Relatora: Dep. Fulana"; o tratamento "Dep." é fixo (a tela só existe na CD). */
export const descricaoAutor = (doc: DocumentoMateria): string => {
  const nome = (doc.nomeAutor ?? '').trim();
  if (!nome) return '';
  return `${doc.papelAutor ? `${doc.papelAutor}: ` : ''}Dep. ${nome}`;
};

/** Linha de metadados exibida sob o título. */
export const linhaDetalheDocumento = (doc: DocumentoMateria): string =>
  [identificacaoDocumento(doc), descricaoAutor(doc), formataDataApresentacao(doc.dataApresentacao)].filter(parte => !!parte).join(' · ');

const normaliza = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const textoPesquisavel = (doc: DocumentoMateria): string => normaliza([doc.titulo, doc.ementa ?? '', linhaDetalheDocumento(doc)].join(' '));

/** Filtro textual genérico sobre tudo o que a linha exibe (inclusive a data e a ementa), sem acento nem caixa; cada termo precisa aparecer. */
export const filtrarDocumentos = (documentos: DocumentoMateria[], filtro: string): DocumentoMateria[] => {
  const termos = normaliza(filtro ?? '')
    .split(/\s+/)
    .filter(t => !!t);
  if (!termos.length) return documentos;
  return documentos.filter(doc => {
    const texto = textoPesquisavel(doc);
    return termos.every(t => texto.includes(t));
  });
};

/** Só http(s) ou relativa vira link: o endereço vem do host e não pode ser `javascript:` etc. */
export const urlDocumentoSegura = (url?: string): string | undefined => {
  const endereco = (url ?? '').trim();
  if (!endereco) return undefined;
  try {
    const u = new URL(endereco, 'http://base.invalid');
    return u.protocol === 'http:' || u.protocol === 'https:' ? endereco : undefined;
  } catch {
    return undefined;
  }
};

export const TOOLTIP_DOCUMENTO_PADRAO = 'Abrir o documento em outra aba';

/** Texto do tooltip (e do aria-label) do ícone: o do host, ou o padrão quando ausente ou vazio. */
export const tooltipDoDocumento = (doc: DocumentoMateria): string => (doc.tooltipDocumento ?? '').trim() || TOOLTIP_DOCUMENTO_PADRAO;

export const textoEstruturadoDisponivel = (doc: DocumentoMateria): boolean => doc.textoEstruturadoDisponivel !== false;
