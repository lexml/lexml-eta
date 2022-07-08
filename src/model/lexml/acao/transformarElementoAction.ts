import { ElementoAction } from '.';
import { Tipo } from '../../dispositivo/tipo';
import { Referencia } from '../../elemento';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const TRANSFORMAR_TIPO_ELEMENTO = 'TRANSFORMAR_TIPO_ELEMENTO';

export class TransformarElemento implements ElementoAction {
  descricao: string;
  tipo: string;
  nomeAcao?: string;

  constructor(tipo: Tipo, descricao: string, nomeAcao: string) {
    this.descricao = descricao;
    this.tipo = tipo.tipo;
    this.nomeAcao = nomeAcao;
  }

  execute(atual: Referencia): any {
    return {
      type: TRANSFORMAR_TIPO_ELEMENTO,
      subType: this.nomeAcao,
      atual,
      novo: {
        tipo: this.tipo,
      },
    };
  }
}
export const transformarEmOmissisAlinea = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Alíneas', 'transformarAlineaEmOmissisAlinea');
export const transformarEmOmissisIncisoCaput = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Incisos de Caput', 'transformarIncisoCaputEmOmissisIncisoCaput');
export const transformarEmOmissisItem = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Itens', 'transformarItemEmOmissisItem');
export const transformarEmOmissisParagrafo = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Parágrafos', 'transformarParagrafoEmOmissisParagrafo');
export const transformarEmOmissisIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.omissis,
  'Omitir Incisos de Parágrafo',
  'transformarIncisoParagrafoEmOmissisIncisoParagrafo'
);

export const transformarAlineaEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Alínea em Inciso', 'transformarAlineaEmIncisoCaput');
export const transformarAlineaEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Alínea em Inciso', 'transformarAlineaEmIncisoParagrafo');
export const transformaAlineaEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar Alínea em Item', 'transformarAlineaEmItem');
export const transformarArtigoEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Artigo em Parágrafo', 'transformarArtigoEmParagrafo');
export const transformarGenericoEmInciso = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarDispositivoGenericoEmInciso');
export const transformarGenericoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarDispositivoGenericoEmAlinea');
export const transformarGenericoEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarDispositivoGenericoEmItem');
export const transformarIncisoParagrafoEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Inciso em Parágrafo', 'transformarIncisoParagrafoEmParagrafo');
export const transformarIncisoCaputEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Inciso Caput em Parágrafo', 'transformarIncisoCaputEmParagrafo');
export const transformarIncisoCaputEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Inciso de Caput em Alínea', 'transformarIncisoCaputEmAlinea');
export const transformarIncisoParagrafoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Inciso de Caput em Alínea', 'transformarIncisoParagrafoEmAlinea');

export const transformarOmissisEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Omissis em Alínea', 'transformarOmissisEmAlinea');
export const transformarOmissisEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar Omissis em Artigo', 'transformarOmissisEmArtigo');
export const transformarOmissisEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Omissis em Inciso de Caput', 'transformarOmissisEmIncisoCaput');
export const transformarOmissisEmIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.inciso,
  'Transformar Omissis em Inciso de Parágrafo',
  'transformarOmissisEmIncisoParagrafo'
);
export const transformarOmissisEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar Omissis em Item', 'transformarOmissisEmItem');
export const transformarOmissisEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Omissis em Parágrafo', 'transformarOmissisEmParagrafo');

export const transformarItemEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Item em Alínea', 'transformarItemEmAlinea');
export const transformarParagrafoEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar Parágrafo em Artigo', 'transformarParagrafoEmArtigo');
export const transformarParagrafoEmIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.inciso,
  'Transformar Parágrafo em Inciso de Parágrafo',
  'transformarParagrafoEmIncisoParagrafo'
);
export const transformarParagrafoEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Parágrafo em Inciso de Caput', 'transformarParagrafoEmIncisoCaput');
