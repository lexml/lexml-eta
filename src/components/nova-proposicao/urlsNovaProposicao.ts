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
export type ImportarArquivoCallback = (arquivo: File) => ResultadoImportacaoArquivo | Promise<ResultadoImportacaoArquivo>;

export interface ConfigNovaProposicao {
  casaLegislativaEditor?: string;
  urlVerificacaoProposicao?: string;
  urlTextoEstruturado?: string;
  urlComissoes?: string;
  urlImportacaoArquivo?: string;
  // Quando informado, o callback é usado no lugar da URL.
  onObterComissoes?: ObterComissoesCallback;
  onVerificarProposicao?: VerificarProposicaoCallback;
  onObterTexto?: ObterTextoCallback;
  onImportarArquivo?: ImportarArquivoCallback;
}

const ORIGENS_OBRIGATORIAS: { url: keyof ConfigNovaProposicao; callback: keyof ConfigNovaProposicao }[] = [
  { url: 'urlVerificacaoProposicao', callback: 'onVerificarProposicao' },
  { url: 'urlTextoEstruturado', callback: 'onObterTexto' },
  { url: 'urlComissoes', callback: 'onObterComissoes' },
  { url: 'urlImportacaoArquivo', callback: 'onImportarArquivo' },
];

// Pela extensão, e não por File.type, que varia por navegador e às vezes vem vazio. O .json não vai à conversão.
export const CONTENT_TYPE_IMPORTACAO: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  xml: 'application/xml',
};

/** Cada origem de dados exige a URL ou o callback; só a casa tem padrão. */
export const validarConfigNovaProposicao = (config?: ConfigNovaProposicao): void => {
  ORIGENS_OBRIGATORIAS.forEach(({ url, callback }) => {
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

export const montaUrlComissoes = (modelo: string, casa: string): string => modelo.replace(/\{casa\}/g, encodeURIComponent(casa));
