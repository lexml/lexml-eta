import { ElementoAction } from '.';
import { Tipo } from '../../dispositivo/tipo';
import { Referencia } from '../../elemento';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const ADICIONAR_ELEMENTO = 'ADICIONAR_ELEMENTO';

export class AdicionarElemento implements ElementoAction {
  descricao: string;
  tipo?: string;
  isDispositivoAlteracao = false;
  constructor(tipo?: Tipo) {
    this.descricao = `Adicionar ${tipo?.descricao ?? ''}`;
    this.tipo = tipo?.tipo;
  }
  execute(atual: Referencia, conteudo?: string, tipo?: Referencia, hasDesmembramento = false): any {
    return {
      type: ADICIONAR_ELEMENTO,
      atual,
      novo: {
        tipo,
        isDispositivoAlteracao: this.isDispositivoAlteracao,
        conteudo: {
          texto: conteudo,
        },
      },
      hasDesmembramento,
    };
  }
}

export const adicionarElementoAction = new AdicionarElemento();
export const adicionarArtigo = new AdicionarElemento(TipoDispositivo.artigo);
export const adicionarAlinea = new AdicionarElemento(TipoDispositivo.alinea);
export const adicionarInciso = new AdicionarElemento(TipoDispositivo.inciso);
export const adicionarItem = new AdicionarElemento(TipoDispositivo.item);
export const omissis = new AdicionarElemento(TipoDispositivo.omissis);
export const adicionarParagrafo = new AdicionarElemento(TipoDispositivo.paragrafo);
