import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isOmissis, isPena } from '../../../dispositivo/tipo';
import { normalizaRotuloPena } from '../../numeracao/rotuloPena';
import { Metadado, ParteInicial, TextoArticulado } from '../../../documento';
import { ClassificacaoDocumento } from '../../../documento/classificacao';
import { TEXTO_OMISSIS } from '../../conteudo/textoOmissis';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../dispositivo/dispositivoLexmlFactory';
import { getDispositivoAndFilhosAsLista } from '../../hierarquia/hierarquiaUtil';
import { ProjetoNorma } from '../projetoNorma';
import PrivateQuill from '../../../../internal/quill/private-quill';
import { ANO_PROVISORIO, getAno, getPreambuloPadrao, getTipo, getTipoDocumentoUrn } from '../urnUtil';
import { Anexo, Autoria, ColegiadoApreciador, MimeType, OpcoesImpressao, Parlamentar, SIGLAS_CASA_COLEGIADO, TIPOS_COLEGIADO } from '../../../proposicao/proposicao';
import { TIPO_ANEXO_NAO_INFORMADO } from '../../../proposicao/tipoAnexo';
import { DadosLexEdit, RevisaoArticulacaoLida, RevisaoTextualLida } from '../documentoArticulado';
import { SituacaoNaNormaVigente } from './situacaoNaNormaVigente';
import { NAMESPACE_LEXEDIT } from './buildJsonixFromProjetoNorma';
import { Usuario } from '../../../revisao/usuario';
import { getOperacoesRevisao } from '../../../../redux/elemento/util/revisaoUtil';
import { formatDateTime, parseIsoToDateTime } from '../../../../util/date-util';

let ultimoDispositivoCriado: Dispositivo;

// Workaround para o problema de textos que possuam tags <b> ou <i> contendo <a> no meio
// O Quill faz um tratamento para que as tags <b> e <i> fiquem dentro da tag <a>
// Nesse caso, é necessário fazer esse ajuste antecipadamente para que o editor não trate a transformação como uma alteração
const ajustarTextosParaQuill = (projetoNorma: ProjetoNorma): void => {
  if (window.process.env.testMode) return;

  const fnAjustaFormatoQuill = (texto: string, container: any, quill: InstanceType<typeof PrivateQuill>): string => {
    const regexMatchTagsBoldOuItalicContendoTagAnchorDentro = /<(b|i)>(?:(?!(<\/\1>)).)*<a[^>]*>.*<\/a>.*<\/\1>/gi;
    if (texto?.match(regexMatchTagsBoldOuItalicContendoTagAnchorDentro)) {
      quill.setContents(quill.clipboard.convert(texto));
      return container.querySelector('.ql-editor p')!.innerHTML;
    }
    return texto;
  };

  const tempContainer = document.createElement('div');
  const tempQuill = new PrivateQuill(tempContainer, {});

  if (projetoNorma.ementa) {
    projetoNorma.ementa.texto = fnAjustaFormatoQuill(projetoNorma.ementa.texto, tempContainer, tempQuill);
  }

  if (projetoNorma.preambulo) {
    projetoNorma.preambulo.texto = fnAjustaFormatoQuill(projetoNorma.preambulo.texto, tempContainer, tempQuill);
  }

  if (projetoNorma.articulacao) {
    getDispositivoAndFilhosAsLista(projetoNorma.articulacao).forEach(d => {
      d.texto = fnAjustaFormatoQuill(d.texto, tempContainer, tempQuill);
    });
  }
};

export const buildProjetoNormaFromJsonix = (documentoLexml: any, preservarTexto = false): ProjetoNorma => {
  if (!documentoLexml?.value?.projetoNorma) {
    throw new Error('Não se trata de um documento lexml válido');
  }

  if (preservarTexto) documentoLexml = escaparTextoJsonix(documentoLexml);

  const projetoNorma: ProjetoNorma = {
    classificacao: documentoLexml.value?.projetoNorma.norma ? ClassificacaoDocumento.NORMA : ClassificacaoDocumento.PROJETO,
    tipo: getTipo(getUrn(documentoLexml)),
    ...getMetadado(documentoLexml),
    ...getParteInicial(documentoLexml, preservarTexto),
    ...getTextoArticulado(documentoLexml.value.projetoNorma.norma || documentoLexml.value.projetoNorma.projeto, buildTextoEpigrafeFromDocument(documentoLexml), preservarTexto),
  };

  if (projetoNorma.articulacao) {
    projetoNorma.articulacao.projetoNorma = projetoNorma;
    if (projetoNorma.ementa) {
      projetoNorma.ementa.pai = projetoNorma.articulacao;
    }
    if (projetoNorma.preambulo) {
      projetoNorma.preambulo.pai = projetoNorma.articulacao;
    }
  }

  ajustarTextosParaQuill(projetoNorma);

  return projetoNorma;
};

/** No arquivo Jsonix, strings são texto literal; somente os objetos representam marcação. */
const escaparTextoJsonix = (valor: any): any => {
  if (Array.isArray(valor)) return valor.map(escaparTextoJsonix);
  if (!valor || typeof valor !== 'object') return valor;
  return Object.fromEntries(
    Object.entries(valor).map(([chave, conteudo]) => [
      chave,
      chave === 'content' && Array.isArray(conteudo)
        ? conteudo.map(item => (typeof item === 'string' ? item.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : escaparTextoJsonix(item)))
        : escaparTextoJsonix(conteudo),
    ])
  );
};

const retiraCaracteresDesnecessarios = (texto: string): any => {
  return texto?.replace(/[\n]/g, '').trim();
};

export const getUrn = (documento: any): string => {
  return documento?.value?.metadado?.identificacao?.urn;
};

const isObjeto = (valor: any): boolean => !!valor && typeof valor === 'object';

/**
 * Conteúdo de `lexedit:Metadado` em `MetadadoProprietario`: primeiro o formato do conversor
 * jsonix-lexml 2.0.0 (`any[]`), depois a chave `lexedit` do formato provisório (design.md, Decisão 4).
 */
const lerConteudoLexEdit = (documento: any): any => {
  const grupos: any[] = documento?.value?.metadado?.metadadoProprietario ?? [];
  for (const grupo of grupos) {
    const elemento = (Array.isArray(grupo?.any) ? grupo.any : []).find(
      (item: any) => item?.name?.namespaceURI === NAMESPACE_LEXEDIT && item?.name?.localPart === 'Metadado' && isObjeto(item.value)
    );
    if (elemento) return elemento.value;
  }
  return grupos.find(grupo => isObjeto(grupo?.lexedit))?.lexedit;
};

/**
 * Lê os ids de remissões internas inválidas de `MetadadoProprietario/lexedit:Metadado`
 * (especificações 00 e 10) — tolerante a outros grupos do LexEdit ainda não implementados,
 * que simplesmente são ignorados.
 */
export const lerIdsRemissoesInvalidas = (documento: any): string[] => {
  const refIds = lerConteudoLexEdit(documento)?.remissoesInternasInvalidas?.refIdsRemissoesInternas;
  // Texto separado por espaço no formato novo; array no provisório.
  const ids = typeof refIds === 'string' ? refIds.split(/\s+/) : Array.isArray(refIds) ? refIds : [];
  return Array.from(new Set<string>(ids.filter((id: unknown) => typeof id === 'string' && id)));
};

/** Lê `lexedit:SituacaoNaNormaVigente` (especificação 13); atributo ausente ou com tipo inesperado equivale a lista vazia. */
export const lerSituacaoNaNormaVigente = (documento: any): SituacaoNaNormaVigente => {
  const lido = lerConteudoLexEdit(documento)?.situacaoNaNormaVigente;
  const ids = (valor: unknown): string[] => (typeof valor === 'string' ? Array.from(new Set(valor.split(/\s+/).filter(id => id))) : []);
  return { existentes: ids(lido?.refIdsDispositivosExistentes), novos: ids(lido?.refIdsDispositivosNovos) };
};

// Atributo ausente ou com tipo inesperado assume o padrão da classe, sem invalidar os demais (design.md, Decisão 3).
export const lerOpcoesImpressao = (lido: any): OpcoesImpressao | undefined => {
  if (!lido || typeof lido !== 'object') return undefined;
  const opcoes = new OpcoesImpressao();
  if (typeof lido.imprimirBrasao === 'boolean') opcoes.imprimirBrasao = lido.imprimirBrasao;
  if (typeof lido.textoCabecalho === 'string') opcoes.textoCabecalho = lido.textoCabecalho;
  if (typeof lido.reduzirEspacoEntreLinhas === 'boolean') opcoes.reduzirEspacoEntreLinhas = lido.reduzirEspacoEntreLinhas;
  if (Number.isInteger(lido.tamanhoFonte) && lido.tamanhoFonte > 0) opcoes.tamanhoFonte = lido.tamanhoFonte;
  return opcoes;
};

// Data fora de AAAA-MM-DD (inclusive vazia) equivale a data não informada (especificação 03).
export const lerFecho = (lexedit: any): Pick<DadosLexEdit, 'local' | 'data'> => ({
  ...(typeof lexedit?.local === 'string' && lexedit.local.trim() && { local: lexedit.local }),
  ...(typeof lexedit?.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(lexedit.data) && { data: lexedit.data }),
});

const textoNaoVazio = (valor: any): boolean => typeof valor === 'string' && !!valor.trim();

// Forma de xsd:dateTime (fuso e frações opcionais); o valor é devolvido como gravado.
const REGEX_XSD_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

const lerDataUltimaModificacao = (valor: any): string | undefined =>
  typeof valor === 'string' && REGEX_XSD_DATE_TIME.test(valor) && !Number.isNaN(Date.parse(valor)) ? valor : undefined;

// Sem identificação ou nome o parlamentar é descartado; os demais atributos assumem o padrão da classe.
const lerParlamentar = (lido: any): Parlamentar | undefined => {
  if (!isObjeto(lido) || !textoNaoVazio(lido.identificacao) || !textoNaoVazio(lido.nome)) return undefined;
  const parlamentar = new Parlamentar();
  parlamentar.identificacao = lido.identificacao;
  parlamentar.nome = lido.nome;
  if (['M', 'F'].includes(lido.sexo)) parlamentar.sexo = lido.sexo;
  if (typeof lido.siglaPartido === 'string') parlamentar.siglaPartido = lido.siglaPartido;
  if (typeof lido.siglaUF === 'string') parlamentar.siglaUF = lido.siglaUF;
  if (['SF', 'CD'].includes(lido.siglaCasaLegislativa)) parlamentar.siglaCasaLegislativa = lido.siglaCasaLegislativa;
  if (typeof lido.cargo === 'string') parlamentar.cargo = lido.cargo;
  return parlamentar;
};

// Só autoria de parlamentares (especificação 04); comissão ou nenhum parlamentar válido mantém a autoria padrão.
export const lerAutoria = (lido: any): Autoria | undefined => {
  if (!isObjeto(lido) || lido.tipo !== 'Parlamentar') return undefined;
  // O Jsonix pode entregar uma lista de um só elemento como objeto.
  const lista = lido.parlamentares?.parlamentar;
  const parlamentares = (Array.isArray(lista) ? lista : [lista]).map(lerParlamentar).filter((p): p is Parlamentar => !!p);
  if (!parlamentares.length) return undefined;
  const autoria = new Autoria();
  autoria.parlamentares = parlamentares;
  if (typeof lido.imprimirPartidoUF === 'boolean') autoria.imprimirPartidoUF = lido.imprimirPartidoUF;
  return autoria;
};

// Atributo ausente ou fora da enumeração assume o padrão da classe, sem invalidar os demais (especificação 14).
export const lerColegiadoApreciador = (lido: any): ColegiadoApreciador | undefined => {
  if (!isObjeto(lido)) return undefined;
  const colegiado = new ColegiadoApreciador();
  if ((SIGLAS_CASA_COLEGIADO as readonly string[]).includes(lido.siglaCasaLegislativa)) colegiado.siglaCasaLegislativa = lido.siglaCasaLegislativa;
  if ((TIPOS_COLEGIADO as readonly string[]).includes(lido.tipoColegiado)) colegiado.tipoColegiado = lido.tipoColegiado;
  if (textoNaoVazio(lido.siglaComissao)) colegiado.siglaComissao = lido.siglaComissao;
  return colegiado;
};

// Entrada sem chave, com chave vazia ou com valor não textual é descartada; em chave repetida vale a primeira (especificação 15).
export const lerOutrosMetadados = (lido: any): Record<string, string> | undefined => {
  if (!isObjeto(lido)) return undefined;
  const outros: Record<string, string> = {};
  for (const item of comoLista(lido.outroMetadado)) {
    if (!isObjeto(item) || !textoNaoVazio(item.chave) || typeof item.value !== 'string' || Object.prototype.hasOwnProperty.call(outros, item.chave)) continue;
    outros[item.chave] = item.value;
  }
  return Object.keys(outros).length > 0 ? outros : undefined;
};

// Anexo sem idArquivo ou nomeArquivo, ou de formato diferente de PDF/DOCX, é descartado; nomeDocumento e tipo ausentes assumem os padrões.
export const lerAnexos = (lido: any): Anexo[] | undefined => {
  if (!isObjeto(lido)) return undefined;
  const formatos = Object.values(MimeType) as string[];
  const anexos: Anexo[] = [];
  for (const item of comoLista(lido.anexo)) {
    if (!isObjeto(item) || !textoNaoVazio(item.idArquivo) || !textoNaoVazio(item.nomeArquivo) || !formatos.includes(item.mimeType)) continue;
    anexos.push({
      idArquivo: item.idArquivo,
      nomeArquivo: item.nomeArquivo,
      nomeDocumento: textoNaoVazio(item.nomeDocumento) ? item.nomeDocumento : item.nomeArquivo.replace(/\.[^.]*$/, ''),
      tipo: textoNaoVazio(item.tipo) ? item.tipo : TIPO_ANEXO_NAO_INFORMADO.codigo,
      mimeType: item.mimeType,
    });
  }
  return anexos.length > 0 ? anexos : undefined;
};

/** Lê os grupos de formulário de `MetadadoProprietario/lexedit:Metadado`, ignorando grupos desconhecidos. */
export const lerMetadadoLexEdit = (documento: any): DadosLexEdit => {
  const lexedit = lerConteudoLexEdit(documento);
  const opcoesImpressao = lerOpcoesImpressao(lexedit?.opcoesImpressao);
  const autoria = lerAutoria(lexedit?.autoria);
  const colegiadoApreciador = lerColegiadoApreciador(lexedit?.colegiadoApreciador);
  const revisoesLidas = lerRevisoesArticulacao(lexedit);
  const revisoesTextuais = lerRevisoesTextuais(lexedit);
  const outrosMetadados = lerOutrosMetadados(lexedit?.outrosMetadados);
  const anexos = lerAnexos(lexedit?.anexos);
  const dataUltimaModificacao = lerDataUltimaModificacao(lexedit?.dataUltimaModificacao);
  return {
    ...(lexedit?.anexoParecer === true && { anexoParecer: true }),
    ...(textoNaoVazio(lexedit?.urnDocumentoReferenciado) && { urnDocumentoReferenciado: lexedit.urnDocumentoReferenciado.trim() }),
    ...(dataUltimaModificacao && { dataUltimaModificacao }),
    ...lerFecho(lexedit),
    ...(opcoesImpressao && { opcoesImpressao }),
    ...(autoria && { autoria }),
    ...(colegiadoApreciador && { colegiadoApreciador }),
    ...(outrosMetadados && { outrosMetadados }),
    ...(anexos && { anexos }),
    ...(revisoesLidas.length > 0 && { revisoesLidas }),
    ...(Object.keys(revisoesTextuais).length > 0 && { revisoesTextuais }),
  };
};

const OPERACOES_CONHECIDAS = ['adicionado', 'excluido', 'alterado', 'movido', 'transformado', 'alteracaoRotulo'];

const NOMES_DISPOSITIVO_NA_REVISAO = [
  'parte',
  'livro',
  'titulo',
  'subtitulo',
  'capitulo',
  'secao',
  'subsecao',
  'artigo',
  'omissis',
  'agrupamentoHierarquico',
  'caput',
  'paragrafo',
  'inciso',
  'alinea',
  'item',
  'pena',
  'dispositivoGenerico',
];

// O Jsonix entrega lista de um só elemento como objeto.
const comoLista = (valor: any): any[] => (Array.isArray(valor) ? valor : valor === undefined || valor === null ? [] : [valor]);

// Operação desconhecida ou com argumento inválido é descartada, sem invalidar as demais.
const lerOperacoesRevisao = (revisao: unknown): LidaOperacao[] =>
  getOperacoesRevisao(typeof revisao === 'string' ? revisao : '').filter(o => {
    if (!OPERACOES_CONHECIDAS.includes(o.nome)) return false;
    if (o.nome === 'movido') return /^[1-9]\d*$/.test(o.argumento ?? '');
    if (o.nome === 'transformado' || o.nome === 'alteracaoRotulo') return !!o.argumento;
    return true;
  });

type LidaOperacao = RevisaoArticulacaoLida['operacoes'][number];

// Estado anterior de uma revisão não excluída: dispositivo sem id (sem título = não havia) ou, por tolerância, `p` solto (título não informado).
const lerEstadoAnterior = (lida: any): Pick<RevisaoArticulacaoLida, 'textoAnterior' | 'tituloAnterior' | 'rotuloAnterior'> => {
  const nome = NOMES_DISPOSITIVO_NA_REVISAO.find(n => isObjeto(lida[n]));
  const dispositivo = nome && lida[nome];
  const caput = dispositivo && comoLista(dispositivo.lXcontainersOmissis).find(n => n?.name?.localPart === 'Caput');
  const p = comoLista(dispositivo ? (caput?.value ?? dispositivo).p : lida.p)[0];
  const nomeAgrupador = dispositivo?.nomeAgrupador;
  const textoAnterior = isObjeto(nomeAgrupador) ? buildContent(escaparTextoJsonix(nomeAgrupador.content)) : isObjeto(p) ? buildContent(escaparTextoJsonix(p.content)) : undefined;
  const titulo = dispositivo?.tituloDispositivo;
  const tituloAnterior = dispositivo ? (isObjeto(titulo) ? buildContent(escaparTextoJsonix(titulo.content)) : null) : undefined;
  const rotuloAnterior = nome === 'pena' && textoNaoVazio(dispositivo.rotulo) ? normalizaRotuloPena(dispositivo.rotulo) : undefined;
  return {
    ...(textoAnterior !== undefined && { textoAnterior }),
    ...(tituloAnterior !== undefined && { tituloAnterior }),
    ...(rotuloAnterior !== undefined && { rotuloAnterior }),
  };
};

export const lerUsuarios = (lido: any): Map<string, Usuario> =>
  new Map(
    comoLista(lido?.usuario)
      .filter(u => isObjeto(u) && textoNaoVazio(u.idUsuario) && textoNaoVazio(u.nome))
      .map((u): [string, Usuario] => [u.idUsuario, new Usuario(u.nome, u.idUsuario, textoNaoVazio(u.sigla) ? u.sigla : undefined)])
  );

/**
 * Revisões da hierarquia (especificação 11) tolerantes: ignora a que não tem nenhuma operação conhecida, a não excluída sem
 * `refIdDispositivo` e a de exclusão sem o dispositivo excluído; `refIdUsuario` sem registro vira usuário com o próprio id.
 */
export const lerRevisoesArticulacao = (lexedit: any): RevisaoArticulacaoLida[] => {
  const usuarios = lerUsuarios(lexedit?.usuarios);
  return comoLista(lexedit?.revisoesArticulacao?.revisaoArticulacao)
    .filter(isObjeto)
    .map((lida): RevisaoArticulacaoLida | undefined => {
      const operacoes = lerOperacoesRevisao(lida.revisao);
      if (!operacoes.length) return undefined;

      const nomeDoExcluido = NOMES_DISPOSITIVO_NA_REVISAO.find(nome => isObjeto(lida[nome]));
      const excluida = operacoes.some(o => o.nome === 'excluido');
      if (excluida ? !nomeDoExcluido : !textoNaoVazio(lida.refIdDispositivo)) return undefined;

      const refIdUsuario = textoNaoVazio(lida.refIdUsuario) ? lida.refIdUsuario : '';
      const anterior = excluida ? {} : lerEstadoAnterior(lida);
      return {
        ...(!excluida && { refIdDispositivo: lida.refIdDispositivo }),
        operacoes,
        usuario: usuarios.get(refIdUsuario) ?? new Usuario(refIdUsuario || undefined, refIdUsuario || undefined),
        dataHora: (typeof lida.data === 'string' && parseIsoToDateTime(lida.data)) || formatDateTime(new Date()),
        ...anterior,
        ...(excluida && {
          excluido: {
            name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: nomeDoExcluido![0].toUpperCase() + nomeDoExcluido!.slice(1) },
            value: escaparTextoJsonix(lida[nomeDoExcluido!]),
          },
        }),
      };
    })
    .filter((r): r is RevisaoArticulacaoLida => !!r);
};

/** Revisões de texto (especificação 09) por `refIdRevisao`, tolerantes: ignora a sem `refIdRevisao`; usuário sem registro usa o próprio id e data inválida vira agora. */
export const lerRevisoesTextuais = (lexedit: any): Record<string, RevisaoTextualLida> => {
  const usuarios = lerUsuarios(lexedit?.usuarios);
  const lidas: Record<string, RevisaoTextualLida> = {};
  comoLista(lexedit?.revisoesTextuais?.revisaoTextual)
    .filter(lida => isObjeto(lida) && textoNaoVazio(lida.refIdRevisao))
    .forEach(lida => {
      const refIdUsuario = textoNaoVazio(lida.refIdUsuario) ? lida.refIdUsuario : '';
      lidas[lida.refIdRevisao] = {
        usuario: usuarios.get(refIdUsuario) ?? new Usuario(refIdUsuario || undefined, refIdUsuario || undefined),
        dataHora: (typeof lida.data === 'string' && parseIsoToDateTime(lida.data)) || formatDateTime(new Date()),
      };
    });
  return lidas;
};

const getMetadado = (documento: any): Metadado => {
  return {
    urn: getUrn(documento),
  };
};

const getParteInicial = (documento: any, preservarTexto: boolean): ParteInicial => {
  const estrutura = documento?.value?.projetoNorma;
  const parteInicial = (estrutura?.norma ?? estrutura?.projeto)?.parteInicial;
  const epigrafe = parteInicial?.epigrafe ? buildContent(parteInicial.epigrafe.content) : buildTextoEpigrafe(getUrn(documento));
  const ementa = buildContent(parteInicial?.ementa?.content);
  const paragrafos = parteInicial?.preambulo?.p ?? [];
  const preambulo = paragrafos.length > 1 ? paragrafos.map(p => `<p>${buildContent(p.content)}</p>`).join('') : buildContent(paragrafos[0]?.content);

  const textoPreambulo = retiraCaracteresDesnecessarios(preambulo) || getPreambuloPadrao(getUrn(documento));

  return {
    epigrafe: retiraCaracteresDesnecessarios(epigrafe),
    ementa: buildDispositivoEmenta(retiraCaracteresDesnecessarios(ementa), epigrafe, preservarTexto),
    preambulo: textoPreambulo ? buildDispositivoPreambulo(textoPreambulo, preservarTexto) : undefined,
  };
};

export const getTextoArticulado = (norma: any, textoArticulacao?: string, preservarTexto = false): TextoArticulado => {
  return {
    articulacao: buildArticulacao(norma.articulacao, textoArticulacao, preservarTexto),
  };
};

const buildDispositivoEmenta = (texto: string, textoArticulacao: string, preservarTexto: boolean): Dispositivo | undefined => {
  const dispositivo = criaDispositivo(createArticulacao(textoArticulacao), 'Ementa');
  dispositivo.pai = undefined;
  dispositivo.texto = preservarTexto ? texto : substituiAspasRetasPorCurvas(texto);
  dispositivo.rotulo = '';
  dispositivo.id = 'ementa';

  return dispositivo;
};

const buildDispositivoPreambulo = (texto: string, preservarTexto: boolean): Dispositivo => {
  const dispositivo = criaDispositivo(createArticulacao(), 'Preambulo');
  dispositivo.pai = undefined;
  dispositivo.texto = preservarTexto ? texto : substituiAspasRetasPorCurvas(texto);
  dispositivo.rotulo = '';
  dispositivo.id = 'preambulo';
  dispositivo.bloqueado = true;

  return dispositivo;
};

const buildTextoEpigrafeFromDocument = (documentoLexml: any): string => {
  const doc = documentoLexml.value.projetoNorma.norma || documentoLexml.value.projetoNorma.projeto;
  const textoEpigrafe = buildContent(doc.parteInicial?.epigrafe?.content);

  return textoEpigrafe ? textoEpigrafe : buildTextoEpigrafe(getUrn(documentoLexml));
};

const buildTextoEpigrafe = (urn: string): string => {
  const tipo = getTipoDocumentoUrn(urn);
  const ano = getAno(urn);
  return tipo ? `${tipo.descricao.toUpperCase()} Nº , DE ${ano === ANO_PROVISORIO ? '' : ano}` : '';
};

const buildArticulacao = (tree: any, textoArticulacao: string | undefined, preservarTexto: boolean): Articulacao => {
  const articulacao = createArticulacao(textoArticulacao);

  const filhos = tree.lXhier ? (tree.lXhier.lXhier ? tree.lXhier.lXhier : tree.lXhier) : tree;
  buildTree(articulacao, filhos, [], preservarTexto);

  return articulacao;
};

const buildTree = (pai: Dispositivo, filhos: any, cabecasAlteracao: Dispositivo[], preservarTexto: boolean): void => {
  if (!pai || !filhos) {
    return;
  }

  filhos?.forEach((el: any) => {
    let dispositivo;
    const notaAlteracao = el.value?.notaAlteracao;

    if (el.value?.fechaAspas) {
      const cabecaAlteracao = cabecasAlteracao.pop();
      if (cabecaAlteracao) {
        cabecaAlteracao.notaAlteracao = el.value?.notaAlteracao;
      }
    }

    if (el.name?.localPart === 'Caput') {
      if (el.value?.abreAspas === 's') {
        cabecasAlteracao.push(dispositivo);
        dispositivo.rotulo = el.value?.rotulo;
        dispositivo.cabecaAlteracao = true;
        dispositivo.notaAlteracao = notaAlteracao;
      } else if (el.value?.rotulo) {
        dispositivo.rotulo = el.value.rotulo;
        dispositivo.createNumeroFromRotulo(dispositivo.rotulo);
      }

      pai.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el, preservarTexto));

      (pai as Artigo).caput!.href = el.value?.href;
      (pai as Artigo).caput!.id = el.value?.id;
      buildAlteracao(pai, el.value?.alteracao, cabecasAlteracao, preservarTexto);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
      buildPena((pai as Artigo).caput!, el.value, cabecasAlteracao, preservarTexto);
    } else if (el.name?.localPart === 'alteracao') {
      buildAlteracao(pai, el, cabecasAlteracao, preservarTexto);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
    } else {
      if (el.name?.localPart === 'p') {
        adicionaTextoAoUltimoDispositivoCriado(el);
      } else {
        // Impede que sejam criados filhos em artigos que já possuam alterações
        if (!pai.alteracoes) {
          dispositivo = buildDispositivo(pai, el, cabecasAlteracao, preservarTexto);
          buildTree(dispositivo, el.value?.lXhier ?? el.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
          buildPena(dispositivo, el.value, cabecasAlteracao, preservarTexto);
        }
      }
    }
  });
};

/** Lê um nó jsonix de dispositivo (com seus filhos) como filho de `pai`, sem passar pela articulação do documento; texto literal, sem aspas curvas. */
export const buildDispositivoSoltoFromJsonix = (pai: Dispositivo, no: any): Dispositivo => {
  const dispositivo = buildDispositivo(pai, no, [], true);
  buildTree(dispositivo, no.value?.lXhier ?? no.value?.lXcontainersOmissis, [], true);
  buildPena(dispositivo, no.value, [], true);
  return dispositivo;
};

// A pena vem em value.pena (irmã de lXcontainersOmissis) e é sempre o último filho.
const buildPena = (pai: Dispositivo, value: any, cabecasAlteracao: Dispositivo[], preservarTexto: boolean): void => {
  if (!value?.pena) {
    return;
  }
  buildDispositivo(pai, { name: { localPart: 'Pena' }, value: value.pena }, cabecasAlteracao, preservarTexto);
};

const buildAlteracao = (pai: Dispositivo, el: any, cabecasAlteracao: Dispositivo[], preservarTexto: boolean): void => {
  if (el) {
    createAlteracao(pai);
    pai.alteracoes!.id = el.id;
    pai.alteracoes!.base = el.base;
    el.content?.forEach((c: any) => {
      if (c.name?.localPart === 'p') {
        adicionaTextoAoUltimoDispositivoCriado(c);
      } else {
        const d = buildDispositivo(pai.alteracoes!, c, cabecasAlteracao, preservarTexto);
        d.isDispositivoAlteracao = true;
        d.rotulo = c.value?.rotulo;
        buildTree(d!, c.value?.lXhier ?? c.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
        buildPena(d!, c.value, cabecasAlteracao, preservarTexto);
      }
    });
  }
};

const adicionaTextoAoUltimoDispositivoCriado = (el: any): void => {
  ultimoDispositivoCriado.texto = (ultimoDispositivoCriado.texto + ' ' + retiraCaracteresDesnecessarios(buildContent(el.value?.content))).replace(/\s+/g, ' ');
};

const buildDispositivo = (pai: Dispositivo, el: any, cabecasAlteracao: Dispositivo[], preservarTexto: boolean): Dispositivo => {
  const dispositivo = criaDispositivo(pai, el.name?.localPart);

  const notaAlteracao = el.value?.notaAlteracao;

  if (el.value?.fechaAspas) {
    const cabecaAlteracao = cabecasAlteracao.pop();
    if (cabecaAlteracao) {
      cabecaAlteracao.notaAlteracao = el.value?.notaAlteracao;
    }
  }

  if (!isOmissis(dispositivo)) {
    if (el.value?.abreAspas === 's') {
      cabecasAlteracao.push(dispositivo);
      dispositivo.rotulo = el.value?.rotulo;
      dispositivo.cabecaAlteracao = true;
      dispositivo.notaAlteracao = notaAlteracao;
    } else {
      dispositivo.rotulo = el.value?.rotulo;
    }
    dispositivo.createNumeroFromRotulo(dispositivo.rotulo!);
  }

  if (isPena(dispositivo)) {
    dispositivo.rotulo = normalizaRotuloPena(el.value?.rotulo);
  }

  dispositivo.href = el.value?.href;
  dispositivo.id = el.value?.id;
  dispositivo.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el, preservarTexto));
  if (el.value?.tituloDispositivo) {
    dispositivo.tituloDispositivo = buildContent(el.value.tituloDispositivo.content);
  }

  ultimoDispositivoCriado = dispositivo;
  return dispositivo;
};

const buildContentDispositivo = (el: any, preservarTexto: boolean): string => {
  let texto = '';
  if (el.value?.nomeAgrupador) {
    return getTextoSemHtml(el.value.nomeAgrupador.content);
  } else {
    el.value?.p
      ?.map((p: any) => p)
      ?.map((a: any) => a.content)
      .forEach((content: any) => (texto += buildContent(content)));
  }
  return preservarTexto ? texto : substituiAspasRetasPorCurvas(texto);
};

const getTextoSemHtml = (c: any): string => {
  let ret = '';
  c.forEach(ci => {
    if (ci.value) {
      ret += getTextoSemHtml(ci.value.content);
    } else {
      ret += ci ?? '';
    }
    ret += ' ';
  });
  return ret.trim();
};

const substituiAspasRetasPorCurvas = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent && node.textContent.indexOf('"') !== -1) {
      // Fecha se a aspa reta for precedida por letra/d\u00EDgito/pontua\u00E7\u00E3o (ou outra aspa curva j\u00E1 aberta); abre nos demais casos.
      node.textContent = node.textContent.replace(/"/g, (_match, offset: number, str: string) => {
        const anterior = str[offset - 1];
        const isFechamento = anterior !== undefined && /[\w,.?!)\-\u201C]/.test(anterior);
        return isFechamento ? '\u201D' : '\u201C';
      });
    }
  }
  return div.innerHTML.replace(/&nbsp;/g, ' ');
};

export const buildContent = (content: any): string => {
  let texto = '';
  content?.forEach((element: any) => {
    if (element.value) {
      texto += montaTag(element.name, element.value);
    } else {
      texto += element;
    }
  });
  return texto;
};

const montaTag = (name: any, value: any): string => {
  const localPart = name.localPart;
  //TODO Tentar montar com span.
  if (localPart === 'Remissao' && value.href) {
    const href = value.href as string;
    if (href.startsWith('urn:lex:')) {
      // Remissão externa: href = "urn:lex:...!fragmento" ou "urn:lex:..."
      const sepIdx = href.indexOf('!');
      const urn = sepIdx >= 0 ? href.substring(0, sepIdx) : href;
      const fragmento = sepIdx >= 0 ? href.substring(sepIdx + 1) : '';
      const attrFragmento = fragmento ? ` data-fragmento="${fragmento}"` : '';
      return `<a data-urn="${urn}"${attrFragmento} class="lexml-remissao-externa" href="#" target="_self">${buildContent(value.content)}</a>`;
    }
    const lexmlId = href;
    const atributoRiId = value.id ? ` data-ri-id="${value.id}"` : '';
    return `<a href="${lexmlId}" data-lexml-ref="${lexmlId}"${atributoRiId} class="lexml-remissao-interna" target="_self">${buildContent(value.content)}</a>`;
  }
  if (localPart === 'span' && value.href) {
    const spanHref = value.href as string;
    if (spanHref.startsWith('urn:lex:')) {
      // GenInline com URN: tratar como remissão externa (mesmo caminho que Remissao)
      const sepIdx = spanHref.indexOf('!');
      const urn = sepIdx >= 0 ? spanHref.substring(0, sepIdx) : spanHref;
      const fragmento = sepIdx >= 0 ? spanHref.substring(sepIdx + 1) : '';
      const attrFragmento = fragmento ? ` data-fragmento="${fragmento}"` : '';
      return `<a data-urn="${urn}"${attrFragmento} class="lexml-remissao-externa" href="#" target="_self">${buildContent(value.content)}</a>`;
    }
    return `<a href="${spanHref}">${buildContent(value.content)}</a>`;
  }
  if (['b', 'i', 'u', 'sub', 'sup', 'span'].includes(localPart)) {
    return `<${localPart}>${buildContent(value.content)}</${localPart}>`;
  }
  return '';
};
