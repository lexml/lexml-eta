import { ElementoAction } from '.';
import { Tipo } from '../../dispositivo/tipo';
import { Referencia } from '../../elemento';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const ADICIONAR_ELEMENTO = 'ADICIONAR_ELEMENTO';

export class AdicionarElemento implements ElementoAction {
  descricao: string;
  tipo?: string;
  isDispositivoAlteracao = false;
  posicao?: string;
  constructor(tipo?: Tipo, posicao?: string) {
    this.descricao = `Adicionar ${tipo?.descricao ?? ''} ${posicao ?? ''}`;
    this.tipo = tipo?.tipo;
    this.posicao = posicao;
  }
  execute(atual: Referencia, conteudo?: string, tipo?: Referencia, hasDesmembramento = false): any {
    return {
      type: ADICIONAR_ELEMENTO,
      atual,
      novo: {
        tipo: tipo ?? this.tipo,
        isDispositivoAlteracao: this.isDispositivoAlteracao,
        conteudo: {
          texto: conteudo,
        },
      },
      hasDesmembramento,
      posicao: this.posicao,
    };
  }
}

export const adicionarElementoAction = new AdicionarElemento();

export const adicionarArtigo = new AdicionarElemento(TipoDispositivo.artigo);
export const adicionarArtigoAntes = new AdicionarElemento(TipoDispositivo.artigo, 'antes');
export const adicionarArtigoDepois = new AdicionarElemento(TipoDispositivo.artigo, 'depois');

export const adicionarAlinea = new AdicionarElemento(TipoDispositivo.alinea);
export const adicionarAlineaAntes = new AdicionarElemento(TipoDispositivo.alinea, 'antes');
export const adicionarAlineaDepois = new AdicionarElemento(TipoDispositivo.alinea, 'depois');

export const adicionarInciso = new AdicionarElemento(TipoDispositivo.inciso);
export const adicionarIncisoAntes = new AdicionarElemento(TipoDispositivo.inciso, 'antes');
export const adicionarIncisoDepois = new AdicionarElemento(TipoDispositivo.inciso, 'depois');

export const adicionarItem = new AdicionarElemento(TipoDispositivo.item);
export const adicionarItemAntes = new AdicionarElemento(TipoDispositivo.item, 'antes');
export const adicionarItemDepois = new AdicionarElemento(TipoDispositivo.item, 'depois');

export const omissis = new AdicionarElemento(TipoDispositivo.omissis);

export const adicionarParagrafo = new AdicionarElemento(TipoDispositivo.paragrafo);
export const adicionarParagrafoAntes = new AdicionarElemento(TipoDispositivo.paragrafo, 'antes');
export const adicionarParagrafoDepois = new AdicionarElemento(TipoDispositivo.paragrafo, 'depois');
