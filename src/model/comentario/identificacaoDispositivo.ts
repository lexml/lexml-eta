import { Dispositivo } from '../dispositivo/dispositivo';
import { buildId } from '../lexml/util/idUtil';
import { lexmlIdParaTextoCanonico, tipoDoUltimoSegmento } from '../remissao/lexmlIdUtil';

// Bloco de alteração: o que vem antes de "_alt<n>" é o artigo do projeto; o resto, o dispositivo da norma alterada.
const ALTERACAO = /^(.+?)(?:_cpt)?_alt\d+_(.+)$/;

const maiuscula = (texto: string): string => texto.charAt(0).toUpperCase() + texto.slice(1);

const conector = (lexmlId: string): string => (['ali', 'sec', 'sub', 'prt'].includes(tipoDoUltimoSegmento(lexmlId)) ? 'da' : 'do');

/** Identificação de um dispositivo comentado a partir do id, no formato do lexml-emenda (ex.: "inciso I do § 2º do art. 3º"). */
export const identificarLexmlId = (lexmlId: string): string => {
  if (lexmlId === 'ementa') {
    return 'ementa';
  }
  if (lexmlId === 'preambulo') {
    return 'preâmbulo';
  }

  const alteracao = lexmlId.match(ALTERACAO);
  if (alteracao) {
    return `${maiuscula(identificarLexmlId(alteracao[2]))} citado no ${identificarLexmlId(alteracao[1])}`;
  }

  if (lexmlId.endsWith('_pena')) {
    // A pena do artigo pertence ao caput, mas é identificada pelo artigo.
    const dono = lexmlId.slice(0, -'_pena'.length).replace(/_cpt$/, '');
    return `pena ${conector(dono)} ${identificarLexmlId(dono)}`;
  }

  if (lexmlId.endsWith('_cpt')) {
    return `caput do ${identificarLexmlId(lexmlId.slice(0, -'_cpt'.length))}`;
  }

  // A remissão escreve "alínea b)"; o lexml-emenda, "alínea “b”".
  return lexmlIdParaTextoCanonico(lexmlId).replace(/alínea ([a-z]+)\)/g, 'alínea “$1”');
};

// Calculada do dispositivo atual: acompanha a renumeração sem guardar texto.
export const identificarDispositivoComentado = (dispositivo: Dispositivo): string => {
  if (dispositivo.tipo === 'Ementa') {
    return 'ementa';
  }
  if (dispositivo.tipo === 'Preambulo') {
    return 'preâmbulo';
  }
  return identificarLexmlId(buildId(dispositivo));
};
