import { Genero } from '../../dispositivo/genero';
import { Tipo } from '../../dispositivo/tipo';
import { TipoDispositivo } from './tipoDispositivo';

export class TipoLexml implements Tipo {
  tipo: string;
  name?: string;
  descricao?: string;
  genero?: Genero;

  tagId?: string;

  tiposPermitidosPai?: string[];
  tiposPermitidosFilhos?: string[];

  tipoProvavelFilho?: string;

  INDICADOR_SEQUENCIA?: string[];
  INDICADOR_FIM_SEQUENCIA?: string[];
  INDICADOR_DESDOBRAMENTO?: string[];

  constructor(tipo: string) {
    this.tipo = TipoDispositivo[tipo].tipo;
    this.tagId = TipoDispositivo[tipo].tagId;
    this.name = TipoDispositivo[tipo].name;
    this.descricao = TipoDispositivo[tipo].descricao;

    this.tiposPermitidosPai = TipoDispositivo[tipo].tiposPermitidosPai;
    this.tiposPermitidosFilhos = TipoDispositivo[tipo].tiposPermitidosFilhos;

    this.tipoProvavelFilho = TipoDispositivo[tipo].tipoProvavelFilho;

    this.INDICADOR_SEQUENCIA = TipoDispositivo[tipo].INDICADOR_SEQUENCIA;
    this.INDICADOR_FIM_SEQUENCIA = TipoDispositivo[tipo].INDICADOR_FIM_SEQUENCIA;
    this.INDICADOR_DESDOBRAMENTO = TipoDispositivo[tipo].INDICADOR_DESDOBRAMENTO;
  }
}
