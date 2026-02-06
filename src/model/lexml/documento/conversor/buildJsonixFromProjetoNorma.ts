import {
  isDispositivoAlteracao,
  isUltimaAlteracao,
  getDispositivoCabecaAlteracao,
  isDispositivoCabecaAlteracao,
  isCaputComIrmaoUnico,
  isOmissisIrmaoUnico,
} from '../../hierarquia/hierarquiaUtil';
import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isCaput, isIncisoCaput, isOmissis } from '../../../dispositivo/tipo';
import { TEXTO_OMISSIS } from '../../conteudo/textoOmissis';
import { buildHref, buildId, buildIdAlteracao } from '../../util/idUtil';
import { isNorma, ProjetoNorma } from '../projetoNorma';
import { isValidText } from '../../../../util/string-util';

export const buildJsonixFromProjetoNorma = (projetoNorma: ProjetoNorma, urn: string): any => {
  const resultado = montaCabecalho(urn);

  resultado.value.projetoNorma = montaProjetoNorma(projetoNorma);

  return resultado;
};

export const buildJsonixArticulacaoFromProjetoNorma = (articulacaoProjetoNorma: Articulacao): any => {
  const articulacao = {
    TYPE_NAME: 'br_gov_lexml__1.Articulacao',
    lXhier: buildTree(articulacaoProjetoNorma, { articulacao: {} }),
  };

  return articulacao;
};

const montaCabecalho = (urn: string): any => {
  return {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: 'LexML',
      prefix: '',
      key: '{http://www.lexml.gov.br/1.0}LexML',
      string: '{http://www.lexml.gov.br/1.0}LexML',
    },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.LexML',
      metadado: {
        TYPE_NAME: 'br_gov_lexml__1.Metadado',
        identificacao: {
          TYPE_NAME: 'br_gov_lexml__1.Identificacao',
          urn: urn,
        },
      },
    },
  };
};

const montaProjetoNorma = (projetoNorma: any): any => {
  const p = {
    TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
  };

  p[isNorma(projetoNorma) ? 'norma' : 'projeto'] = {
    TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
    parteInicial: montaParteInicial(projetoNorma),
    articulacao: montaArticulacao(projetoNorma),
  };

  return p;
};

const montaParteInicial = (projetoNorma: any): any => {
  return {
    TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
    epigrafe: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      id: 'epigrafe',
      content: projetoNorma.epigrafe ? buildStructuredContent(projetoNorma.epigrafe, 'texto') : [],
    },
    ementa: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      id: 'ementa',
      content: projetoNorma.ementa ? buildStructuredContent(projetoNorma.ementa, 'texto') : [],
    },
    preambulo: {
      TYPE_NAME: 'br_gov_lexml__1.TextoType',
      id: 'preambulo',
      p: [
        {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: projetoNorma.preambulo ? buildStructuredContent(projetoNorma.preambulo, 'texto') : [],
        },
      ],
    },
  };
};

const montaArticulacao = (projetoNorma: any): any => {
  return {
    TYPE_NAME: 'br_gov_lexml__1.Articulacao',
    lXhier: buildTree(projetoNorma.articulacao, projetoNorma.articulacao),
  };
};

const buildTree = (dispositivo: Dispositivo, obj: any): any => {
  let tree;
  if (isAgrupador(dispositivo)) {
    tree = obj.lXhier = [];
  } else {
    tree = obj.lXcontainersOmissis = [];
  }

  if (isArtigo(dispositivo)) {
    const node = buildNode((dispositivo as Artigo).caput!);
    buildAlteracaoSeNecessario(dispositivo, node.value);

    tree.push(node);

    buildFilhos(
      dispositivo.filhos?.filter(f => !isCaput(f.pai!)),
      tree
    );

    buildTree((dispositivo as Artigo).caput!, node.value);
  } else {
    buildFilhos(dispositivo.filhos, tree);
  }

  if (obj.lXcontainersOmissis && obj.lXcontainersOmissis.length === 0) delete obj.lXcontainersOmissis;

  return tree;
};

const buildAlteracaoSeNecessario = (dispositivo: Dispositivo, node: any): void => {
  if (dispositivo.hasAlteracao()) {
    node['alteracao'] = {
      TYPE_NAME: 'br_gov_lexml__1.Alteracao',
      id: '',
      content: [],
    };

    if (dispositivo.alteracoes?.base) node.alteracao.base = dispositivo.alteracoes.base;
    node.alteracao.id = buildIdAlteracao((dispositivo as Artigo).caput!);

    dispositivo.alteracoes!.filhos?.forEach(filho => {
      const n = buildNode(filho);

      node.alteracao.content.push(n);

      buildTree(filho, n.value);
    });
  }
};

const buildFilhos = (filhos: Dispositivo[], tree: any): any => {
  filhos?.forEach(filho => {
    const node = buildNode(filho);
    tree.push(node);

    buildTree(filho, node.value);
  });
};

const buildNode = (dispositivo: Dispositivo): any => {
  const node = {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: dispositivo.tipo,
      prefix: '',
      key: `{http://www.lexml.gov.br/1.0}${dispositivo.tipo}`,
      string: `{http://www.lexml.gov.br/1.0}${dispositivo.tipo}`,
    },
    value: {
      TYPE_NAME: buildTypeName(dispositivo),
    },
  };

  buildDispositivo(dispositivo, node.value);

  return node;
};

const buildTypeName = (dispositivo: Dispositivo): string => {
  if (dispositivo.tipo === 'Omissis') return 'br_gov_lexml__1.Omissis';
  else if (isAgrupador(dispositivo) && !isArticulacao(dispositivo)) return 'br_gov_lexml__1.Hierarchy';

  return 'br_gov_lexml__1.DispositivoType';
};

const buildDispositivo = (dispositivo: Dispositivo, value: any): void => {
  value['id'] = buildId(dispositivo);
  if (!isCaput(dispositivo) && !isOmissis(dispositivo)) {
    value.rotulo = dispositivo.rotulo;
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    (dispositivo.tipo === 'Artigo' ||
      dispositivo.tipo === 'Caput' ||
      dispositivo.tipo === 'Inciso' ||
      dispositivo.tipo === 'Paragrafo' ||
      dispositivo.tipo === 'Alinea' ||
      dispositivo.tipo === 'Item' ||
      dispositivo.tipo === 'Omissis')
  ) {
    /* eslint-disable prettier/prettier */
    value['href'] = isCaput(dispositivo) && !isIncisoCaput(dispositivo) ? buildHref(dispositivo.pai!) + '_' + buildHref(dispositivo) : buildHref(dispositivo);
    /* eslint-enable prettier/prettier */
  }

  if (dispositivo.cabecaAlteracao || isDispositivoCabecaAlteracao(dispositivo)) {
    value['abreAspas'] = 's';
    value.rotulo = dispositivo.rotulo;
  } else if (isDispositivoAlteracao(dispositivo) && ((isCaput(dispositivo) && isCaputComIrmaoUnico(dispositivo)) || (isOmissis(dispositivo) && isOmissisIrmaoUnico(dispositivo)))) {
    if (dispositivo.id === 'art2_cpt_alt1_art203_omi1') {
      console.log('isDispositivoAlteracao(dispositivoTemp) && isUltimaAlteracao(dispositivoTemp)', isDispositivoAlteracao(dispositivo), isUltimaAlteracao(dispositivo, true));
    }
    value['fechaAspas'] = 's';
    const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivo);
    value['notaAlteracao'] = cabecaAlteracao.notaAlteracao || 'NR';
  } else {
    if (isDispositivoAlteracao(dispositivo)) {
      const dispositivoTemp = dispositivo;

      if (isDispositivoAlteracao(dispositivoTemp) && isUltimaAlteracao(dispositivoTemp)) {
        value['fechaAspas'] = 's';
        const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivoTemp);
        value['notaAlteracao'] = cabecaAlteracao.notaAlteracao || 'NR';
      }
    }
  }

  if (isValidText(dispositivo.tituloDispositivo)) {
    value.tituloDispositivo = {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      content: buildStructuredContent(dispositivo, 'tituloDispositivo'),
    };
  }

  if (dispositivo.tipo === 'Artigo') return;

  if (isAgrupador(dispositivo)) {
    value.nomeAgrupador = {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      content: buildStructuredContent(dispositivo, 'texto'),
    };
  } else if (!isArtigo(dispositivo) && !isOmissis(dispositivo)) {
    if (dispositivo.texto === TEXTO_OMISSIS) {
      value['textoOmitido'] = 's';
    } else {
      value['p'] = [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: buildStructuredContent(dispositivo, 'texto') }];
    }
  }
};

const buildStructuredContent = (dispositivo: Dispositivo, campo: string): any[] => {
  const regex = /<a[^>]+href="(.*?)"[^>]*>(.*?)<\/a>/gi;
  const result: any[] = [];

  const conteudo = dispositivo[campo];
  if (!conteudo && conteudo !== '') {
    result.push(dispositivo);
    return result;
  }

  const ocorrencias = conteudo.match(regex);
  if (!ocorrencias) {
    const fim = conteudo.indexOf('” (NR)');
    result.push(conteudo.substring(0, fim === -1 ? undefined : fim));
  } else if (!conteudo.startsWith(ocorrencias[0])) {
    result.push(conteudo.substring(0, conteudo.indexOf(ocorrencias![0])));
  }

  ocorrencias?.forEach((m, i) => {
    const http = m.match(regex) ? m : '';

    result.push(buildSpan(http ?? ''));

    const from = conteudo.indexOf(m) + m.length;

    if (from < conteudo.length) {
      const to = ocorrencias[i + 1] ? conteudo.indexOf(ocorrencias[i + 1]) : conteudo.length;
      result.push(
        conteudo
          .substring(from, to)
          ?.replace(/strong>/gi, 'b>')
          .replace(/em>/gi, 'i>')
      );
    }
  });
  return result;
};

const buildSpan = (m: string): any => {
  const resultHref = m.match(/href="(.*?)"*>/i);
  const href = resultHref && resultHref[1] ? resultHref[1] : '';

  const contentHref = m.match(/<a[^>]+href=".*?"[^>]*>(.*?)<\/a>/);
  const content = contentHref && contentHref[1] ? [contentHref[1]?.trim()] : [''];

  return {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: 'span',
      prefix: '',
      key: '{http://www.lexml.gov.br/1.0}span',
      string: '{http://www.lexml.gov.br/1.0}span',
    },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      href,
      content,
    },
  };
};
