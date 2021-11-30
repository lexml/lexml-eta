import { Metadado, Norma, ParteInicial, TextoArticulado } from '../model/documento';
import { buildArticulacao, getSubTipo } from '../model/documento/documentoUtil';
import { TipoDocumento } from '../model/documento/tipoDocumento';

const getUrn = (documento: any): string => {
  return documento?.value?.metadado?.identificacao?.urn;
};

const getMetadado = (documento: any): Metadado => {
  return {
    urn: getUrn(documento),
  };
};

const getParteInicial = (documento: any): ParteInicial => {
  const epigrafe = documento?.value?.projetoNorma?.norma?.parteInicial?.epigrafe?.content[0] ?? '';
  const ementa = documento?.value?.projetoNorma?.norma?.parteInicial?.ementa?.content[0] ?? '';
  const preambulo = documento?.value?.projetoNorma?.norma?.parteInicial?.preambulo?.p[0].content[0] ?? '';

  return {
    epigrafe: epigrafe.replaceAll('\n', '').trim(),
    ementa: ementa.replaceAll('\n', '').trim(),
    preambulo: preambulo?.replaceAll('\n', '').trim(),
  };
};

const getTextoArticulado = (documento: any): TextoArticulado => {
  return {
    articulacao: buildArticulacao(documento?.value?.projetoNorma?.norma?.articulacao),
  };
};

const getNorma = (documento: any): Norma => {
  return {
    tipo: TipoDocumento.NORMA,
    subTipo: getSubTipo(getUrn(documento)),
    ...getMetadado(documento),
    ...getParteInicial(documento),
    ...getTextoArticulado(documento),
  };
};

export const getDocumento = (documento: any): Norma | undefined => {
  if (documento.value?.projetoNorma) {
    return getNorma(documento);
  }
  return undefined;
};
