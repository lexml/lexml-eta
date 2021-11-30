import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { Metadado, Norma, ParteInicial, TextoArticulado } from '../model/documento';
import { getSubTipo } from '../model/documento/documentoUtil';
import { TipoDocumento } from '../model/documento/tipoDocumento';
import { createArticulacao, criaDispositivo } from '../model/lexml/dispositivo/dispositivoLexmlFactory';
import { DispositivoOriginal } from '../model/lexml/situacao/dispositivoOriginal';

export let isEmendamento = false;

const retiraCaracteresDesnecessarios = (texto: string): any => {
  return texto?.replace(/[\n]/g, '').trim();
};

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
    epigrafe: retiraCaracteresDesnecessarios(epigrafe),
    ementa: retiraCaracteresDesnecessarios(ementa),
    preambulo: retiraCaracteresDesnecessarios(preambulo),
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

export const getDocumento = (documento: any, emendamento = false): Norma => {
  isEmendamento = emendamento;

  if (documento.value?.projetoNorma) {
    return getNorma(documento);
  }
  return {
    tipo: TipoDocumento.NORMA,
  };
};

const buildArticulacao = (tree: any): Articulacao => {
  const articulacao = createArticulacao();

  buildTree(articulacao, tree.lXhier);
  return articulacao;
};

const buildTree = (pai: Dispositivo, filhos: any): void => {
  filhos?.forEach((el: any) => {
    let dispositivo;

    if (el.name?.localPart === 'Caput') {
      buildContent(pai, el);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis);
    } else {
      dispositivo = buildDispositivo(pai, el);
      buildTree(dispositivo, el.value?.lXhier ?? el.value?.lXcontainersOmissis);
    }
  });
};

const buildDispositivo = (pai: Dispositivo, el: any): Dispositivo => {
  const dispositivo = criaDispositivo(pai, el.name?.localPart);
  dispositivo.rotulo = el.value?.rotulo;
  dispositivo.id = el.value?.id;
  if (isEmendamento) {
    dispositivo.situacao = new DispositivoOriginal();
  }
  buildContent(dispositivo, el);
  return dispositivo;
};

const montaReferencia = (value: any): string => {
  return `<a href="${value.href}"> ${value.content[0]} </a>`;
};

const buildContent = (dispositivo: Dispositivo, el: any): void => {
  let texto = '';
  if (el.value?.nomeAgrupador) {
    texto = el.value.nomeAgrupador.content[0] ?? '';
  } else {
    el.value?.p
      ?.map(p => p)
      ?.map(a => a.content)
      .forEach(content =>
        content.forEach(element => {
          if (element.value) {
            texto += montaReferencia(element.value);
          } else {
            texto += element;
          }
        })
      );
  }
  dispositivo.texto = retiraCaracteresDesnecessarios(texto);
};
