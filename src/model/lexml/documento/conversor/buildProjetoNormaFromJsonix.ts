import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isOmissis } from '../../../dispositivo/tipo';
import { Metadado, ParteInicial, TextoArticulado } from '../../../documento';
import { ClassificacaoDocumento } from '../../../documento/classificacao';
import { TEXTO_OMISSIS } from '../../conteudo/textoOmissis';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../dispositivo/dispositivoLexmlFactory';
import { DispositivoOriginal } from '../../situacao/dispositivoOriginal';
import { ProjetoNorma } from '../projetoNorma';
import { getTipo } from '../urnUtil';
import { isArtigo } from './../../../dispositivo/tipo';

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

export const getUrn = (documento: any): string => {
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
    const notaAlteracao = el.value?.notaAlteracao;
    const complemento = el.value?.fechaAspas !== undefined ? (notaAlteracao ? `” (${notaAlteracao})` : '” (NR)') : '';

    if (el.name?.localPart === 'Caput') {
      if (el.value?.abreAspas === 's') {
        dispositivo.rotulo = '\u201C' + el.value?.rotulo;
        dispositivo.cabecaAlteracao = true;
        dispositivo.notaAlteracao = notaAlteracao;
      } else if (el.value?.rotulo) {
        dispositivo.rotulo = el.value.rotulo;
        dispositivo.createNumeroFromRotulo(dispositivo.rotulo);
      }

      pai.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el)) + complemento;

      (pai as Artigo).caput!.href = el.value?.href;
      (pai as Artigo).caput!.id = el.value?.id;
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
    pai.alteracoes!.id = el.id;
    pai.alteracoes!.base = el.base;
    if (isEmendamento) {
      pai.alteracoes!.situacao = new DispositivoOriginal();
    }
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

  const notaAlteracao = el.value?.notaAlteracao;
  const complemento = el.value?.fechaAspas !== undefined ? (notaAlteracao ? `” (${notaAlteracao})` : '” (NR)') : '';

  if (!isOmissis(dispositivo)) {
    if (el.value?.abreAspas === 's') {
      dispositivo.rotulo = '\u201C' + el.value?.rotulo;
      dispositivo.cabecaAlteracao = true;
      dispositivo.notaAlteracao = notaAlteracao;
    } else {
      dispositivo.rotulo = el.value?.rotulo;
    }
    dispositivo.createNumeroFromRotulo(dispositivo.rotulo!);
  }

  dispositivo.href = el.value?.href;
  dispositivo.id = el.value?.id;
  if (isEmendamento) {
    dispositivo.situacao = new DispositivoOriginal();
    if (isArtigo(dispositivo)) {
      (dispositivo as Artigo).caput!.situacao = new DispositivoOriginal();
    }
  }
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
  return texto.replace(/b>/gi, 'strong>').replace(/i>/gi, 'em>');
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
