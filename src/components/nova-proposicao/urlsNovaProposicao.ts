import { semZerosAEsquerda } from './montaUrnNovaProposicao';

export interface ComissaoNovaProposicao {
  siglaCasaLegislativa: string;
  sigla: string;
  nome: string;
}

/** Valores já normalizados: sigla em maiúsculas e número sem zeros à esquerda. */
export interface ConsultaProposicao {
  sigla: string;
  numero: string;
  ano: string;
}

export interface ResultadoVerificacaoProposicao {
  ementa: string;
  /** Verdadeiro quando ausente. */
  textoEstruturadoDisponivel?: boolean;
  /** Só tem efeito em PLS e PLC; falso quando ausente. */
  complementar?: boolean;
}

/** Documento associado a uma matéria (Tela 2b, só na CD). */
export interface DocumentoMateria {
  id: string;
  titulo: string;
  sigla: string;
  numero: string;
  ano?: number;
  urlInteiroTeor: string;
  /** Verdadeiro quando ausente. */
  textoEstruturadoDisponivel?: boolean;
  /** Sem tratamento: o componente acrescenta "Dep.". */
  nomeAutor: string;
  /** Já flexionado pelo host (ex.: "Relatora"). */
  papelAutor: string;
  indSexoAutor: string;
  /** AAAA-MM-DD. */
  dataApresentacao: string;
  siglaComissao?: string;
}

export interface ConsultaDocumento {
  id: string;
}

export interface ResultadoImportacaoArquivo {
  /** Documento articulado em JSONIX. */
  texto?: unknown;
  erros: string[];
}

/** Recebe a casa (`SF`, `CD` ou `CN`) da autoridade da URN do novo documento. */
export type ObterComissoesCallback = (casa: string) => ComissaoNovaProposicao[] | Promise<ComissaoNovaProposicao[]>;
/** `undefined` indica documento inexistente. */
export type VerificarProposicaoCallback = (consulta: ConsultaProposicao) => ResultadoVerificacaoProposicao | undefined | Promise<ResultadoVerificacaoProposicao | undefined>;
/** `undefined` indica texto indisponível; o texto é o JSONIX do documento. */
export type ObterTextoCallback = (consulta: ConsultaProposicao) => unknown | Promise<unknown>;
/** `undefined` indica matéria inexistente. */
export type ListarDocumentosCallback = (consulta: ConsultaProposicao) => DocumentoMateria[] | undefined | Promise<DocumentoMateria[] | undefined>;
/** `undefined` indica texto indisponível; o texto é o JSONIX do documento. */
export type ObterTextoDocumentoCallback = (consulta: ConsultaDocumento) => unknown | Promise<unknown>;
export type ImportarArquivoCallback = (arquivo: File) => ResultadoImportacaoArquivo | Promise<ResultadoImportacaoArquivo>;

export interface ConfigNovaProposicao {
  casaLegislativaEditor?: string;
  urlVerificacaoProposicao?: string;
  urlTextoEstruturado?: string;
  urlComissoes?: string;
  urlImportacaoArquivo?: string;
  // Só exigidas na CD (Tela 2b).
  urlDocumentosMateria?: string;
  urlTextoDocumento?: string;
  // Quando informado, o callback é usado no lugar da URL.
  onObterComissoes?: ObterComissoesCallback;
  onVerificarProposicao?: VerificarProposicaoCallback;
  onObterTexto?: ObterTextoCallback;
  onImportarArquivo?: ImportarArquivoCallback;
  onListarDocumentos?: ListarDocumentosCallback;
  onObterTextoDocumento?: ObterTextoDocumentoCallback;
}

const ORIGENS_OBRIGATORIAS: { url: keyof ConfigNovaProposicao; callback: keyof ConfigNovaProposicao }[] = [
  { url: 'urlVerificacaoProposicao', callback: 'onVerificarProposicao' },
  { url: 'urlTextoEstruturado', callback: 'onObterTexto' },
  { url: 'urlComissoes', callback: 'onObterComissoes' },
  { url: 'urlImportacaoArquivo', callback: 'onImportarArquivo' },
];

const ORIGENS_OBRIGATORIAS_CD: { url: keyof ConfigNovaProposicao; callback: keyof ConfigNovaProposicao }[] = [
  { url: 'urlDocumentosMateria', callback: 'onListarDocumentos' },
  { url: 'urlTextoDocumento', callback: 'onObterTextoDocumento' },
];

// Pela extensão, e não por File.type, que varia por navegador e às vezes vem vazio. O .json não vai à conversão.
export const CONTENT_TYPE_IMPORTACAO: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  xml: 'application/xml',
};

/** Cada origem de dados exige a URL ou o callback (as da Tela 2b, só na CD); só a casa tem padrão. */
export const validarConfigNovaProposicao = (config?: ConfigNovaProposicao): void => {
  const origens = config?.casaLegislativaEditor === 'CD' ? [...ORIGENS_OBRIGATORIAS, ...ORIGENS_OBRIGATORIAS_CD] : ORIGENS_OBRIGATORIAS;
  origens.forEach(({ url, callback }) => {
    const urlInformada = typeof config?.[url] === 'string' && !!(config[url] as string).trim();
    if (!urlInformada && typeof config?.[callback] !== 'function') {
      throw new Error(`Configuração da nova proposição inválida: '${url}' não informada (ou informe '${callback}').`);
    }
  });
};

/** Sigla em maiúsculas e número sem zeros à esquerda. */
export const normalizaConsultaProposicao = (sigla: string, numero: string, ano: string): ConsultaProposicao => ({
  sigla: sigla.trim().toUpperCase(),
  numero: semZerosAEsquerda(numero),
  ano: ano.trim(),
});

export const montaUrlProposicao = (modelo: string, sigla: string, numero: string, ano: string): string => {
  const consulta = normalizaConsultaProposicao(sigla, numero, ano);
  return modelo
    .replace(/\{sigla\}/g, encodeURIComponent(consulta.sigla))
    .replace(/\{numero\}/g, encodeURIComponent(consulta.numero))
    .replace(/\{ano\}/g, encodeURIComponent(consulta.ano));
};

export const montaUrlTextoDocumento = (modelo: string, id: string): string => modelo.replace(/\{id\}/g, encodeURIComponent(id));

export const montaUrlComissoes = (modelo: string, casa: string): string => modelo.replace(/\{casa\}/g, encodeURIComponent(casa));
