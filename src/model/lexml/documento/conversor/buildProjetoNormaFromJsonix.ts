import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { TEXTO_OMISSIS } from '../../../dispositivo/omissis';
import { Metadado, ParteInicial, TextoArticulado } from '../../../documento';
import { ClassificacaoDocumento } from '../../../documento/classificacao';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../dispositivo/dispositivoLexmlFactory';
import { DispositivoOriginal } from '../../situacao/dispositivoOriginal';
import { ProjetoNorma } from '../projetoNorma';
import { getTipo } from '../urnUtil';

export let isEmendamento = false;

export const buildProjetoNormaFromJsonix = (documentoLexml: any, emendamento = false): ProjetoNorma => {
  isEmendamento = emendamento;

  if (!documentoLexml?.value?.projetoNorma) {
    throw new Error('Não se trata de um documento lexml válido');
  }

  return {
    classificacao: documentoLexml.value?.projetoNorma.norma ? ClassificacaoDocumento.NORMA : ClassificacaoDocumento.PROJETO,
    tipo: getTipo(getUrn(documentoLexml)),
    ...getMetadado(documentoLexml),
    ...getParteInicial(documentoLexml),
    ...getTextoArticulado(documentoLexml.value.projetoNorma.norma ? documentoLexml.value.projetoNorma.norma : documentoLexml.value.projetoNorma.projeto),
  };
};

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

const getTextoArticulado = (norma: any): TextoArticulado => {
  return {
    articulacao: buildArticulacao(norma.articulacao),
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
      pai.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el));

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
    el.content?.forEach((c: any) => {
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

  const complemento = el.value?.notaAlteracao === 'NR' ? '” (NR)' : '';
  dispositivo.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el)) + complemento;
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
      ?.map((p: any) => p)
      ?.map((a: any) => a.content)
      .forEach((content: any) => (texto += buildContent(content)));
  }
  return texto;
};

const buildContent = (content: any): string => {
  let texto = '';
  content?.forEach((element: any) => {
    if (element.value) {
      texto += montaReferencia(element.value);
    } else {
      texto += element;
    }
  });

  return texto;
};
