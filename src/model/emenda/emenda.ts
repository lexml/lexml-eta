import { NotaRodape } from '../../components/editor-texto-rico/notaRodape';
import { Revisao } from '../revisao/revisao';

export class Emenda {
  // Metadados padronizados para o lexml-eta-emenda
  dataUltimaModificacao = new Date().toISOString();
  aplicacao = '';
  versaoAplicacao = '';
  modoEdicao = ModoEdicaoEmenda.EMENDA;
  // Metadados específicos de sistemas
  metadados: MetadadosEmenda = {};
  pendenciasPreenchimento: string[] = [];
  proposicao = new RefProposicaoEmendada();
  epigrafe = new Epigrafe();
  componentes = [new ComponenteEmendado()];
  comandoEmendaTextoLivre = new ComandoEmendaTextoLivre();
  comandoEmenda = new ComandoEmenda();
  substituicaoTermo?: SubstituicaoTermo;
  anexos: Anexo[] = [];
  justificativa = '';
  justificativaAntesRevisao?: string;
  local = '';
  data?: string = new Date().toISOString().replace(/T.*/, ''); // formato “YYYY-MM-DD”
  autoria = new Autoria();
  opcoesImpressao = new OpcoesImpressao();
  revisoes: Revisao[] = [];
  colegiadoApreciador = new ColegiadoApreciador();
  notasRodape: NotaRodape[] = [];
}

export type MetadadosEmenda = {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
};

export enum ModoEdicaoEmenda {
  EMENDA = 'emenda',
  EMENDA_ARTIGO_ONDE_COUBER = 'emendaArtigoOndeCouber',
  EMENDA_TEXTO_LIVRE = 'emendaTextoLivre',
  EMENDA_SUBSTITUICAO_TERMO = 'emendaSubstituicaoTermo',
}

// Dados da proposição ----------------------------
export class RefProposicaoEmendada {
  urn = '';
  sigla = '';
  numero = '';
  ano = '';
  ementa = '';
  identificacaoTexto = '';
  emendarTextoSubstitutivo = false;
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

// Componente emendado -------------------------------
export class ComponenteEmendado {
  urn = '';
  articulado = true;
  rotuloAnexo?: string;
  tituloAnexo?: string;
  dispositivos = new DispositivosEmenda();
}

// Dispositivos da emenda ----------------------------
export class DispositivosEmenda {
  dispositivosSuprimidos: DispositivoEmendaSuprimido[] = [];
  dispositivosModificados: DispositivoEmendaModificado[] = [];
  dispositivosAdicionados: DispositivoEmendaAdicionado[] = [];
}

export class DispositivoEmenda {
  tipo = ''; // Tipo do dispositivo
  id = ''; // ID LexML
  rotulo?: string;
  urnNormaAlterada?: string;
}

export class DispositivoEmendaSuprimido extends DispositivoEmenda {}

export class DispositivoEmendaModificado extends DispositivoEmenda {
  texto?: string;
  textoOmitido?: boolean;
  abreAspas?: boolean;
  fechaAspas?: boolean;
  notaAlteracao?: 'NR' | 'AC';
}

export class DispositivoEmendaAdicionado extends DispositivoEmendaModificado {
  idPai?: string;
  idIrmaoAnterior?: string;
  idPosicaoAgrupador?: string;
  existeNaNormaAlterada?: boolean;
  filhos?: Array<DispositivoEmendaAdicionado>;
}

export class ComandoEmenda {
  cabecalhoComum?: string;
  comandos: ItemComandoEmenda[] = [];
}

export class ComandoEmendaTextoLivre {
  motivo?: string;
  texto?: string;
  textoAntesRevisao?: string;
}

export class ItemComandoEmenda {
  constructor(public cabecalho: string, public citacao?: string) {}
  rotulo?: string;
  complemento?: string;
}

// Autoria ----------------------------
export enum TipoAutoria {
  NAO_IDENTIFICADO = 'Não identificado',
  PARLAMENTAR = 'Parlamentar',
  COMISSAO = 'Comissão',
  CASA_LEGISLATIVA = 'Casa Legislativa',
}
export class Autoria {
  tipo = TipoAutoria.PARLAMENTAR;
  imprimirPartidoUF = true;
  quantidadeAssinaturasAdicionaisSenadores = 0;
  quantidadeAssinaturasAdicionaisDeputados = 0;
  // TODO - Tornar opcional quando formos implementar outro tipo de autoria.
  parlamentares: Array<Parlamentar> = [];
  colegiado?: ColegiadoAutor;
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

export type TipoSubstituicaoTermo = 'Expressão' | 'Palavra' | 'Número';
export class SubstituicaoTermo {
  tipo: TipoSubstituicaoTermo = 'Expressão';
  termo = '';
  novoTermo = '';
  flexaoGenero = false;
  flexaoNumero = false;
}
