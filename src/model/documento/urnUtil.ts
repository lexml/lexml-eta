import { Autoridade } from './autoridade';
import { VOCABULARIO } from './vocabulario';

export const getAutoridade = (urn: string): Autoridade | undefined => {
  const partes = urn.replace('urn:lex:br:', '')?.split(':');
  return VOCABULARIO.autoridades.filter(t => t.urn === partes[0])[0];
};

export const getTipo = (urn: string): any => {
  const tipo = urn.replace('urn:lex:br:', '')?.split(':');
  return VOCABULARIO.tiposDocumento.filter(t => t.urn === tipo[1])[0];
};

export const getNumero = (urn: string): string => {
  const partes = urn.replace('urn:lex:br:', '')?.split(':');
  return partes[2]?.indexOf(';') > -1 ? partes[2]?.substring(partes[2].indexOf(';') + 1) : '';
};

export const getData = (urn: string): string => {
  const partes = urn.replace('urn:lex:br:', '')?.split(':');
  const d = partes[2]?.substring(0, partes[2].indexOf(';'))?.split('-')?.reverse();
  return d ? d.join('/') : '';
};

const retiraFragmento = (urn: string): string => {
  const i = urn.indexOf('!');

  if (i !== -1) {
    return urn.substring(0, i);
  }
  return urn;
};

export const converteDataFormatoBrasileiroParaUrn = (data: string): string => {
  const dataRegex = data.match(/^(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](\d{4})$/);
  return dataRegex ? `${dataRegex[3]}-${dataRegex[2]}-${dataRegex[1]}` : '';
};

export const buildUrn = (autoridade: string, tipo: string, numero: string, data: string): string => {
  const dataPadrao = converteDataFormatoBrasileiroParaUrn(data) ?? data;
  return `urn:lex:br:${autoridade}:${tipo}:${dataPadrao};${numero}`;
};

export const validaUrn = (urn: string): boolean => {
  const autoridade = getAutoridade(urn)?.urn;
  const tipo = getTipo(urn)?.urn;
  const numero = /^\d{1,5}$/.test(getNumero(urn));
  const data = converteDataFormatoBrasileiroParaUrn(getData(urn)) ?? getData(urn);

  return urn?.startsWith('urn:lex:br:') && autoridade && tipo && numero && data;
};

export const getNomeExtenso = (urn: string): string => {
  const u = retiraFragmento(urn);
  const numero = getNumero(u);
  const tipo = getTipo(u)?.descricao;
  const data = getData(u);
  return (tipo ? tipo : '') + (numero ? ' nº ' + numero : '') + (data.length > 7 ? ' de ' + data : '');
};
