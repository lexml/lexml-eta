import { Revisao } from '../revisao/revisao';
import { NotaRodape } from '../../components/editor-texto-rico/notaRodape';
import { ProjetoNorma } from '../lexml/documento/projetoNorma';
import { RemissaoTextoFixo } from '../remissao';

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
  remissoesTextoFixo: RemissaoTextoFixo[] = [];
  colegiadoApreciador = new ColegiadoApreciador();
  notasRodape: NotaRodape[] = [];
  projetoNorma?: ProjetoNorma;

  urn = '';
  sigla = '';
  numero = '';
  ano = '';
  ementa = '';
  substitutivo = false;
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

// Colegiado apreciador da emenda ----------------------------
export class ColegiadoApreciador {
  siglaCasaLegislativa?: 'CN' | 'SF' | 'CD' = 'CN';
  tipoColegiado: 'Plenário' | 'Comissão' | 'Plenário via Comissão' = 'Plenário';
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
  quantidadeAssinaturasAdicionaisSenadores = 0;
  quantidadeAssinaturasAdicionaisDeputados = 0;
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

export class Anexo {
  nomeArquivo = '';
  base64 = '';
}
