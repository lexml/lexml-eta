export class Emenda {
  metadados: MetadadosEmenda = {};
  tipo = TipoEmenda.EMENDA;
  numero?: number;
  proposicao = new RefProposicaoEmendada();
  destino = new DestinoEmenda();
  epigrafe = new Epigrafe();
  dispositivos = new DispositivosEmenda();
  comandoEmenda = new ComandoEmenda();
  justificativa = '';
  local = '';
  data?: string; // formato “YYYY-MM-DD”
  autoria = new Autoria();
}

export type MetadadosEmenda = {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
};

export enum TipoEmenda {
  EMENDA = 'emenda',
  EMENDA_ARTIGO_ONDE_COUBER = 'emendaArtigoOndeCouber',
}

// Dados da proposição ----------------------------
export class RefProposicaoEmendada {
  urn = '';
  sigla = '';
  numero = '';
  ano = '';
  genero: 'M' | 'F' = 'M';
  substitutivo = false;
  identificacaoTexto = '';
}

// Destino da emenda ----------------------------
export class DestinoEmenda {
  siglaCasaLegislativa: 'CN' | 'SF' | 'CD' = 'CN';
  tipoColegiado: 'Plenário' | 'Comissão' = 'Plenário';
  siglaComissao?: string;
}

// Epígrafe ----------------------------
export class Epigrafe {
  texto = '';
  complemento = '';
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
}

export class DispositivoEmendaSuprimido extends DispositivoEmenda {}

export class DispositivoEmendaModificado extends DispositivoEmenda {
  texto = '';
}

export class DispositivoEmendaAdicionado extends DispositivoEmenda {
  idPai?: string;
  idIrmaoAnterior?: string;
  texto?: string;
  urnNormaAlterada?: string;
  textoOmitido?: boolean;
  abreAspas?: boolean;
  fechaAspas?: boolean;
  notaAlteracao?: '(NR)' | '(AC)';
  situacaoNormaVigente?: 'DE' | 'DN';
}

export class ComandoEmenda {
  cabecalhoComum?: string;
  comandos: ItemComandoEmenda[] = [];
}

export class ItemComandoEmenda {
  constructor(public cabecalho: string, public citacao?: string) {}
}

// Autoria ----------------------------
export enum TipoAutoria {
  NAO_IDENTIFICADO = 'Não identificado',
  PARLAMENTAR = 'Parlamentar',
  COMISSAO = 'Comissão',
}
export class Autoria {
  tipo = TipoAutoria.PARLAMENTAR;
  imprimirPartidoUF = true;
  quantidadeAssinaturasAdicionaisSenadores = 0;
  quantidadeAssinaturasAdicionaisDeputados = 0;
  parlamentares: Array<Parlamentar> = [];
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
