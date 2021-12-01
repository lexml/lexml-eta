import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { Metadado, Norma, ParteInicial, TextoArticulado } from '../model/documento';
import { getSubTipo } from '../model/documento/documentoUtil';
import { TipoDocumento } from '../model/documento/tipoDocumento';
import { createAlteracao, createArticulacao, criaDispositivo } from '../model/lexml/dispositivo/dispositivoLexmlFactory';
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
  const ementa = buildContent(documento?.value?.projetoNorma?.norma?.parteInicial?.ementa.content);
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
  if (!pai || !filhos) {
    return;
  }

  filhos?.forEach((el: any) => {
    let dispositivo;

    if (el.name?.localPart === 'Caput') {
      pai.texto = retiraCaracteresDesnecessarios(buildContentDispositivo(el));
      buildAlteracao(pai, el.value?.alteracao);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis);
    } else if (el.name?.localPart === 'alteracao') {
      buildAlteracao(pai, el);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis);
    } else {
      dispositivo = buildDispositivo(pai, el);
      buildTree(dispositivo, el.value?.lXhier ?? el.value?.lXcontainersOmissis);
    }
  });
};

const buildAlteracao = (pai: Dispositivo, el: any): void => {
  if (el) {
    createAlteracao(pai);
    pai.alteracoes!.uuid = el.id;
    pai.alteracoes!.base = el.base;
    el.content?.forEach(c => {
      const d = buildDispositivo(pai.alteracoes!, c);
      d.isDispositivoAlteracao = true;
      d.rotulo = '\u201C' + c.value?.rotulo;

      buildTree(d!, c.value?.lXhier ?? c.value?.lXcontainersOmissis);
    });
  }
};

const buildDispositivo = (pai: Dispositivo, el: any): Dispositivo => {
  const dispositivo = criaDispositivo(pai, el.name?.localPart);
  dispositivo.rotulo = el.value?.rotulo;
  dispositivo.id = el.value?.id;
  if (isEmendamento) {
    dispositivo.situacao = new DispositivoOriginal();
  }
  dispositivo.texto = retiraCaracteresDesnecessarios(buildContentDispositivo(el));
  return dispositivo;
};

const montaReferencia = (value: any): string => {
  return `<a href="${value.href}"> ${value.content[0]} </a>`;
};

const buildContentDispositivo = (el: any): string => {
  let texto = '';
  if (el.value?.nomeAgrupador) {
    return el.value.nomeAgrupador.content[0] ?? '';
  } else {
    el.value?.p
      ?.map(p => p)
      ?.map(a => a.content)
      .forEach(content => (texto += buildContent(content)));
  }
  return texto;
};

const buildContent = (content: any): string => {
  let texto = '';
  content.forEach(element => {
    if (element.value) {
      texto += montaReferencia(element.value);
    } else {
      texto += element;
    }
  });

  return texto;
};
