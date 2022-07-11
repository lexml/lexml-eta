import { ElementoAction } from '.';
import { Tipo } from '../../dispositivo/tipo';
import { Referencia } from '../../elemento';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const TRANSFORMAR_TIPO_ELEMENTO = 'TRANSFORMAR_TIPO_ELEMENTO';

export class TransformarElemento implements ElementoAction {
  descricao: string;
  tipo: string;
  nomeAcao?: string;
  hotkey?: string;

  constructor(tipo: Tipo, descricao: string, nomeAcao: string, hotkey?: string) {
    this.descricao = descricao;
    this.tipo = tipo.tipo;
    this.nomeAcao = nomeAcao;
    this.hotkey = hotkey;
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
export const transformarEmOmissisAlinea = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Alíneas', 'transformarAlineaEmOmissisAlinea', 'Ctrl O');
export const transformarEmOmissisIncisoCaput = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Incisos', 'transformarIncisoCaputEmOmissisIncisoCaput', 'Ctrl O');
export const transformarEmOmissisItem = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Itens', 'transformarItemEmOmissisItem', 'Ctrl O');
export const transformarEmOmissisParagrafo = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Parágrafos', 'transformarParagrafoEmOmissisParagrafo', 'Ctrl O');
export const transformarEmOmissisIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.omissis,
  'Omitir Incisos',
  'transformarIncisoParagrafoEmOmissisIncisoParagrafo',
  'Ctrl O'
);

export const transformarAlineaEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarAlineaEmIncisoCaput', 'Ctrl N');
export const transformarAlineaEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarAlineaEmIncisoParagrafo', 'Ctrl N');
export const transformaAlineaEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarAlineaEmItem', 'Ctrl T');
export const transformarArtigoEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar em Parágrafo', 'transformarArtigoEmParagrafo', 'Ctrl P');
export const transformarGenericoEmInciso = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarDispositivoGenericoEmInciso', 'Ctrl N');
export const transformarGenericoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarDispositivoGenericoEmAlinea', 'Ctrl L');
export const transformarGenericoEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarDispositivoGenericoEmItem', 'Ctrl T');
export const transformarIncisoParagrafoEmParagrafo = new TransformarElemento(
  TipoDispositivo.paragrafo,
  'Transformar em Parágrafo',
  'transformarIncisoParagrafoEmParagrafo',
  'Ctrl P'
);
export const transformarIncisoCaputEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar em Parágrafo', 'transformarIncisoCaputEmParagrafo', 'Ctrl P');
export const transformarIncisoCaputEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarIncisoCaputEmAlinea', 'Ctrl L');
export const transformarIncisoParagrafoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarIncisoParagrafoEmAlinea', 'Ctrl L');

export const transformarOmissisEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarOmissisEmAlinea', 'Ctrl L');
export const transformarOmissisEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar em Artigo', 'transformarOmissisEmArtigo', 'Ctrl A');
export const transformarOmissisEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarOmissisEmIncisoCaput', 'Ctrl N');
export const transformarOmissisEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarOmissisEmIncisoParagrafo', 'Ctrl N');
export const transformarOmissisEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarOmissisEmItem', 'Ctrl T');
export const transformarOmissisEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar em Parágrafo', 'transformarOmissisEmParagrafo', 'Ctrl P');

export const transformarItemEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarItemEmAlinea', 'Ctrl L');
export const transformarParagrafoEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar em Artigo', 'transformarParagrafoEmArtigo', 'Ctrl A');
export const transformarParagrafoEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarParagrafoEmIncisoParagrafo', 'Ctrl N');
export const transformarParagrafoEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarParagrafoEmIncisoCaput', 'Ctrl N');
