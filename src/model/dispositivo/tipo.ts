import { Dispositivo } from './dispositivo';

export interface Tipo {
  tipo: string;
  name?: string;
  descricao?: string;

  tiposPermitidosPai?: string[];
  tiposPermitidosFilhos?: string[];

  tipoProvavelFilho?: string;

  INDICADOR_SEQUENCIA?: string[];
  INDICADOR_FIM_SEQUENCIA?: string[];
  INDICADOR_DESDOBRAMENTO?: string[];
}

export const TipoDispositivo: Record<string, Tipo> = {
  agrupadorGenerico: {
    tipo: 'DispositivoAgrupadorGenerico',
    name: undefined,
    descricao: undefined,
    tiposPermitidosPai: ['Articulacao', 'Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao'],
    tiposPermitidosFilhos: ['Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao', 'Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: [''],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
  alinea: {
    tipo: 'Alinea',
    name: 'Alinea',
    descricao: 'Alínea',
    tiposPermitidosPai: ['Inciso'],
    tiposPermitidosFilhos: ['Item'],
    tipoProvavelFilho: 'Item',
    INDICADOR_SEQUENCIA: [';', '; e', '; ou'],
    INDICADOR_FIM_SEQUENCIA: ['.'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  articulacao: {
    tipo: 'Articulacao',
    name: 'Articulacao',
    descricao: 'Articulação',
    tiposPermitidosPai: [],
    tiposPermitidosFilhos: ['Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao', 'Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['.'],
    INDICADOR_FIM_SEQUENCIA: ['NA'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  artigo: {
    tipo: 'Artigo',
    name: 'Artigo',
    descricao: 'Artigo',
    tiposPermitidosPai: ['Articulacao', 'Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao', 'Subsecao'],
    tiposPermitidosFilhos: ['Paragrafo', 'Inciso'],
    tipoProvavelFilho: 'Inciso',
    INDICADOR_SEQUENCIA: ['.'],
    INDICADOR_FIM_SEQUENCIA: ['NA'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  capitulo: {
    tipo: 'Capitulo',
    name: 'Capitulo',
    descricao: 'Capítulo',
    tiposPermitidosPai: ['Articulacao', 'Parte', 'Livro', 'Titulo'],
    tiposPermitidosFilhos: ['Secao', 'Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: [''],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
  caput: {
    tipo: 'Caput',
    name: 'Caput',
    descricao: 'Caput',
    tiposPermitidosPai: ['Artigo'],
    tiposPermitidosFilhos: ['Inciso'],
    tipoProvavelFilho: 'Inciso',
    INDICADOR_SEQUENCIA: ['.'],
    INDICADOR_FIM_SEQUENCIA: ['NA'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  generico: {
    tipo: 'DispositivoGenerico',
    name: undefined,
    descricao: 'Dispositivo genérico',
    tiposPermitidosPai: ['Articulacao', 'Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao', 'Subsecao'],
    tiposPermitidosFilhos: ['Paragrafo', 'Inciso', 'Alinea', 'Item'],
    tipoProvavelFilho: 'DispositivoGenerico',
    INDICADOR_SEQUENCIA: [';', '; e', '; ou'],
    INDICADOR_FIM_SEQUENCIA: ['.'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  inciso: {
    tipo: 'Inciso',
    name: 'Inciso',
    descricao: 'Inciso',
    tiposPermitidosPai: ['Artigo', 'Caput', 'Paragrafo'],
    tiposPermitidosFilhos: ['Alinea'],
    tipoProvavelFilho: 'Alinea',
    INDICADOR_SEQUENCIA: [';', '; e', '; ou'],
    INDICADOR_FIM_SEQUENCIA: ['.'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  item: {
    tipo: 'Item',
    name: 'Item',
    descricao: 'Item',
    tiposPermitidosPai: ['Alinea'],
    tiposPermitidosFilhos: [],
    tipoProvavelFilho: 'DispositivoGenerico',
    INDICADOR_SEQUENCIA: [';', '; e', '; ou'],
    INDICADOR_FIM_SEQUENCIA: ['.'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  livro: {
    tipo: 'Livro',
    name: 'Livro',
    descricao: 'Livro',
    tiposPermitidosPai: ['Articulacao', 'Parte'],
    tiposPermitidosFilhos: ['Titulo', 'Capitulo', 'Secao', 'Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: [''],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
  omissis: {
    tipo: 'Omissis',
    name: 'Omissis',
    descricao: 'Omissis',
    tiposPermitidosPai: ['Articulacao', 'Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao', 'Subsecao', 'Artigo', 'Paragrafo', 'Alinea', 'Inciso'],
    tiposPermitidosFilhos: ['Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao', 'Subsecao', 'Artigo', 'Paragrafo', 'Alinea', 'Inciso', 'Item'],
    tipoProvavelFilho: 'Omissis',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: ['NA'],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
  paragrafo: {
    tipo: 'Paragrafo',
    name: 'Paragrafo',
    descricao: 'Parágrafo',
    tiposPermitidosPai: ['Artigo'],
    tiposPermitidosFilhos: ['Inciso'],
    tipoProvavelFilho: 'Inciso',
    INDICADOR_SEQUENCIA: ['.'],
    INDICADOR_FIM_SEQUENCIA: ['NA'],
    INDICADOR_DESDOBRAMENTO: [':'],
  },
  parte: {
    tipo: 'Parte',
    name: 'Parte',
    descricao: 'Parte',
    tiposPermitidosPai: ['Articulacao'],
    tiposPermitidosFilhos: ['Livro', 'Titulo', 'Capitulo', 'Secao', 'Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: [''],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
  secao: {
    tipo: 'Secao',
    name: 'Secao',
    descricao: 'Seção',
    tiposPermitidosPai: ['Articulacao', 'Parte', 'Livro', 'Titulo', 'Capitulo'],
    tiposPermitidosFilhos: ['Subsecao', 'Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: [''],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
  subsecao: {
    tipo: 'Subsecao',
    name: 'Subsecao',
    descricao: 'Subseção',
    tiposPermitidosPai: ['Secao'],
    tiposPermitidosFilhos: ['Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: [''],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
  titulo: {
    tipo: 'Titulo',
    name: 'Titulo',
    descricao: 'Título',
    tiposPermitidosPai: ['Articulacao', 'Parte', 'Livro'],
    tiposPermitidosFilhos: ['Capitulo', 'Secao', 'Artigo'],
    tipoProvavelFilho: 'Artigo',
    INDICADOR_SEQUENCIA: ['NA'],
    INDICADOR_FIM_SEQUENCIA: [''],
    INDICADOR_DESDOBRAMENTO: ['NA'],
  },
};

export const isArticulacao = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.articulacao.tipo;
};

export const isDispositivoGenerico = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.generico.tipo;
};

export const isArtigo = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.artigo.tipo;
};

export const isCaput = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.caput.tipo;
};

export const isParagrafo = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.paragrafo.tipo;
};

export const isInciso = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.inciso.tipo;
};

export const isIncisoCaput = (dispositivo: Dispositivo): boolean => {
  return isInciso(dispositivo) && isCaput(dispositivo.pai!);
};

export const isAlinea = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.alinea.tipo;
};

export const isItem = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.item.tipo;
};

export const isAgrupador = (dispositivo: Dispositivo): boolean => {
  return [
    TipoDispositivo.articulacao.tipo,
    TipoDispositivo.agrupadorGenerico.tipo,
    TipoDispositivo.capitulo.tipo,
    TipoDispositivo.livro.tipo,
    TipoDispositivo.parte.tipo,
    TipoDispositivo.secao.tipo,
    TipoDispositivo.subsecao.tipo,
    TipoDispositivo.titulo.tipo,
  ].includes(dispositivo.tipo);
};

export const isAgrupadorGenerico = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.agrupadorGenerico.tipo;
};

export const isDispositivoDeArtigo = (dispositivo: Dispositivo): boolean => {
  return [TipoDispositivo.paragrafo.tipo, TipoDispositivo.inciso.tipo, TipoDispositivo.alinea.tipo, TipoDispositivo.item.tipo].includes(dispositivo.tipo);
};
