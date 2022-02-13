import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isAgrupador, isArtigo, isCaput, isOmissis } from '../../../dispositivo/tipo';
import { TEXTO_OMISSIS } from '../../conteudo/textoOmissis';
import { buildHref, buildId, buildIdAlteracao } from '../../util/idUtil';
import { isNorma, ProjetoNorma } from '../projetoNorma';

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
      content: projetoNorma.epigrafe,
    },
    ementa: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      id: 'ementa',
      content: projetoNorma.ementa,
    },
    preambulo: {
      TYPE_NAME: 'br_gov_lexml__1.TextoType',
      id: 'preambulo',
      p: projetoNorma.preambulo,
    },
  };
};

const montaArticulacao = (projetoNorma: any): any => {
  const articulacao = {
    TYPE_NAME: 'br_gov_lexml__1.Articulacao',
    lXhier: buildTree(projetoNorma.articulacao, projetoNorma.articulacao),
  };

  return articulacao;
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

  return tree;
};

const buildAlteracaoSeNecessario = (dispositivo: Dispositivo, node: any): void => {
  if (dispositivo.hasAlteracao()) {
    node['alteracao'] = {
      TYPE_NAME: 'br_gov_lexml__1.Alteracao',
      base: '',
      id: '',
      content: [],
    };

    node.alteracao.base = dispositivo.alteracoes?.base ?? '';
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
      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
    },
  };

  buildDispositivo(dispositivo, node.value);

  return node;
};

const buildDispositivo = (dispositivo: Dispositivo, value: any): void => {
  value['href'] = isCaput(dispositivo) ? buildHref(dispositivo.pai!) + '_' + buildHref(dispositivo) : buildHref(dispositivo);

  value['id'] = buildId(dispositivo);

  if (dispositivo.rotulo && /^["”“].*/.test(dispositivo.rotulo)) {
    value['abreAspas'] = 's';
    value.rotulo = dispositivo.rotulo.substring(1);
  } else if (!isCaput(dispositivo) && !isOmissis(dispositivo)) {
    value.rotulo = dispositivo.rotulo;
  }

  if (isCaput(dispositivo)) {
    if (/”.*(NR)/.test(dispositivo.texto)) {
      value['fechaAspas'] = 's';
      value['notaAlteracao'] = 'NR';
    }
  }

  if (isAgrupador(dispositivo)) {
    value.nomeAgrupador = {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      content: buildContent(dispositivo),
    };
  } else if (!isArtigo(dispositivo)) {
    if (dispositivo.texto === TEXTO_OMISSIS) {
      value['textoOmitido'] = 's';
    } else {
      value['p'] = [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: buildContent(dispositivo) }];
    }
  }
};

const buildContent = (dispositivo: Dispositivo): any[] => {
  const regex = /<a[^>]+href="(.*?)"[^>]*>(.*?)<\/a>/gi;
  const result: any[] = [];

  const ocorrencias = dispositivo.texto.match(regex);

  if (!ocorrencias) {
    const fim = dispositivo.texto.indexOf('” (NR)');
    result.push(dispositivo.texto.substring(0, fim === -1 ? undefined : fim));
  } else if (!dispositivo.texto.startsWith(ocorrencias[0])) {
    result.push(dispositivo.texto.substring(0, dispositivo.texto.indexOf(ocorrencias![0])));
  }

  ocorrencias?.forEach((m, i) => {
    const http = m.match(regex) ? m : '';

    result.push(buildSpan(http ?? ''));

    const from = dispositivo.texto?.indexOf(m) + m.length;

    if (from < dispositivo.texto.length - 1) {
      const to = ocorrencias[i + 1] ? dispositivo.texto.indexOf(ocorrencias[i + 1]) : dispositivo.texto.length;
      result.push(dispositivo.texto.substring(from, to));
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
