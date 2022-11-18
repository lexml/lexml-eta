import { ElementoAction } from '.';
import { Tipo } from '../../dispositivo/tipo';
import { Referencia } from '../../elemento';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const AGRUPAR_ELEMENTO = 'AGRUPAR_ELEMENTO';

export class AgruparElemento implements ElementoAction {
  descricao: string;
  tipo: string;

  constructor(tipo: Tipo) {
    this.descricao = 'Adicionar ' + tipo.descricao;
    this.tipo = tipo.tipo;
  }

  execute(atual: Referencia, uuid: string): any {
    return {
      type: AGRUPAR_ELEMENTO,
      atual,
      novo: {
        tipo: this.tipo,
        uuid: +uuid,
      },
    };
  }
}
export const adicionarParte = new AgruparElemento(TipoDispositivo.parte);
export const adicionarLivro = new AgruparElemento(TipoDispositivo.livro);
export const adicionarTitulo = new AgruparElemento(TipoDispositivo.titulo);
export const adicionarCapitulo = new AgruparElemento(TipoDispositivo.capitulo);
export const adicionarSecao = new AgruparElemento(TipoDispositivo.secao);
export const adicionarSubsecao = new AgruparElemento(TipoDispositivo.subsecao);
