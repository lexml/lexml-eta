import { Dispositivo } from '../dispositivo/dispositivo';

export interface RangeArtigos {
  numInicial: number;
  numFinal: number;
}

export interface PaginaArticulacao {
  descricao: string;
  rangeArtigos: RangeArtigos;
  dispositivos: Dispositivo[];
  ids: string[];
}

export interface ConfiguracaoPaginacao {
  maxItensPorPagina?: number;
  rangeArtigos?: RangeArtigos[];
}
