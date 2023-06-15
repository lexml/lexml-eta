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
export const transformarEmOmissisAlinea = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Alíneas', 'transformarAlineaEmOmissisAlinea', '(Ctrl+Alt+O)');
export const transformarEmOmissisIncisoCaput = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Incisos', 'transformarIncisoCaputEmOmissisIncisoCaput', '(Ctrl+Alt+O)');
export const transformarEmOmissisItem = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Itens', 'transformarItemEmOmissisItem', '(Ctrl+Alt+O)');
export const transformarEmOmissisParagrafo = new TransformarElemento(TipoDispositivo.omissis, 'Omitir Parágrafos', 'transformarParagrafoEmOmissisParagrafo', '(Ctrl+Alt+O)');
export const transformarEmOmissisIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.omissis,
  'Omitir Incisos',
  'transformarIncisoParagrafoEmOmissisIncisoParagrafo',
  '(Ctrl+Alt+O)'
);

export const transformarAlineaEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarAlineaEmIncisoCaput', '(Shift+Tab)');
export const transformarAlineaEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarAlineaEmIncisoParagrafo', '(Shift+Tab)');
export const transformaAlineaEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarAlineaEmItem', '(Tab)');
export const transformarArtigoEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar em Parágrafo', 'transformarArtigoEmParagrafo', '(Tab)');
export const transformarGenericoEmInciso = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarDispositivoGenericoEmInciso');
export const transformarGenericoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarDispositivoGenericoEmAlinea');
export const transformarGenericoEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarDispositivoGenericoEmItem');
export const transformarIncisoParagrafoEmParagrafo = new TransformarElemento(
  TipoDispositivo.paragrafo,
  'Transformar em Parágrafo',
  'transformarIncisoParagrafoEmParagrafo',
  '(Shift+Tab)'
);
export const transformarIncisoCaputEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar em Parágrafo', 'transformarIncisoCaputEmParagrafo', '(Shift+Tab)');
export const transformarIncisoCaputEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarIncisoCaputEmAlinea', '(Tab)');
export const transformarIncisoParagrafoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarIncisoParagrafoEmAlinea', '(Tab)');

export const transformarOmissisEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarOmissisEmAlinea');
export const transformarOmissisEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar em Artigo', 'transformarOmissisEmArtigo');
export const transformarOmissisEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarOmissisEmIncisoCaput');
export const transformarOmissisEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarOmissisEmIncisoParagrafo');
export const transformarOmissisEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarOmissisEmItem');
export const transformarOmissisEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar em Parágrafo', 'transformarOmissisEmParagrafo');

export const transformarItemEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarItemEmAlinea', '(Shift+Tab)');
export const transformarParagrafoEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar em Artigo', 'transformarParagrafoEmArtigo', '(Shift+Tab)');
export const transformarParagrafoEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarParagrafoEmIncisoParagrafo', '(Tab)');
export const transformarParagrafoEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarParagrafoEmIncisoCaput', '(Tab)');
