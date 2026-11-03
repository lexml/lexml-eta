import { Revisao } from '../revisao/revisao';
import { NotaRodape } from '../../components/editor-texto-rico/notaRodape';
import { ProjetoNorma } from '../lexml/documento/projetoNorma';

export class Proposicao {
  // Metadados padronizados para o lexml-eta-proposicao
  dataUltimaModificacao = new Date().toISOString();
  aplicacao = '';
  versaoAplicacao = '';
  metadados: Metadados = {};
  epigrafe = new Epigrafe();
  pendenciasPreenchimento: string[] = [];
  anexos: Anexo[] = [];
  justificativa = '';
  justificativaAntesRevisao?: string;
  local = '';
  autoria = new Autoria();
  opcoesImpressao = new OpcoesImpressao();
  revisoes: Revisao[] = [];
  // Sem valor padrão: só existe quando definido na criação ou lido do arquivo.
  colegiadoApreciador?: ColegiadoApreciador;
  notasRodape: NotaRodape[] = [];
  projetoNorma?: ProjetoNorma;

  urn = '';
  sigla = '';
  numero = '';
  ano = '';
  ementa = '';
}

export const getRefProposicaoReduzida = (proposicao: Proposicao): RefProposicaoReduzida => {
  return {
    urn: proposicao.urn,
    sigla: proposicao.sigla,
    numero: proposicao.numero,
    ano: proposicao.ano,
    ementa: proposicao.ementa,
  };
};

export type Metadados = {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
};

// Referência reduzida da proposição ----------------------------
export class RefProposicaoReduzida {
  urn = '';
  sigla = '';
  numero = '';
  ano = '';
  ementa = '';
}

// Colegiado apreciador da proposição ----------------------------
export const TIPOS_COLEGIADO = ['Plenário', 'Comissão'] as const;
export const SIGLAS_CASA_COLEGIADO = ['CN', 'SF', 'CD'] as const;

export class ColegiadoApreciador {
  siglaCasaLegislativa?: (typeof SIGLAS_CASA_COLEGIADO)[number] = 'CN';
  tipoColegiado: (typeof TIPOS_COLEGIADO)[number] = 'Plenário';
  siglaComissao?: string;
}

// Epígrafe ----------------------------
export class Epigrafe {
  texto = '';
  complemento = '';
}

// Autoria ----------------------------
export class Autoria {
  tipo = TipoAutoria.PARLAMENTAR;
  imprimirPartidoUF = true;
  // TODO - Tornar opcional quando formos implementar outro tipo de autoria.
  parlamentares: Array<Parlamentar> = [];
  colegiado?: ColegiadoAutor;
}

// Autoria ----------------------------
export enum TipoAutoria {
  NAO_IDENTIFICADO = 'Não identificado',
  PARLAMENTAR = 'Parlamentar',
  COMISSAO = 'Comissão',
  CASA_LEGISLATIVA = 'Casa Legislativa',
}

export class Parlamentar {
  identificacao = '';
  nome = '';
  sexo: 'M' | 'F' = 'M';
  siglaPartido = '';
  siglaUF = '';
  siglaCasaLegislativa: 'SF' | 'CD' = 'CD';
  cargo = '';
}

// Casa diferente de SF recebe o tratamento da Câmara.
export const tratamentoParlamentar = (sexo: string, siglaCasaLegislativa: string): string => {
  const feminino = sexo === 'F';
  if (siglaCasaLegislativa === 'SF') return feminino ? 'Senadora' : 'Senador';
  return feminino ? 'Deputada' : 'Deputado';
};

export class ColegiadoAutor {
  identificacao = '';
  nome = '';
  sigla = '';
}

// Opções de impressão -----------------------------
export class OpcoesImpressao {
  imprimirBrasao = true;
  textoCabecalho = '';
  reduzirEspacoEntreLinhas = false;
  tamanhoFonte = 14;
}

export enum MimeType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

// Só os metadados: o conteúdo do arquivo fica com o host, que o recupera pelo idArquivo.
export interface Anexo {
  idArquivo: string;
  nomeArquivo: string;
  nomeDocumento: string;
  tipo: string;
  mimeType: MimeType;
}

// Substituição de termo -----------------------------
export type TipoSubstituicaoTermo = 'Expressão' | 'Palavra' | 'Número';
export class SubstituicaoTermo {
  tipo: TipoSubstituicaoTermo = 'Expressão';
  termo = '';
  novoTermo = '';
  flexaoGenero = false;
  flexaoNumero = false;
}
