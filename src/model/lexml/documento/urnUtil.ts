import { generoFromLetra } from '../../dispositivo/genero';
import { Autoridade } from '../../documento/autoridade';
import { Genero, generoFeminino, generoMasculino, NomeComGenero } from './../../dispositivo/genero';
import { VOCABULARIO } from './vocabulario';

type DadosURN = {
  nivel: string;
  autoridade: string;
  tipo: string;
  identificador: string;
};

const _parseURN = (urn: string): DadosURN => {
  const partes = urn.replace('urn:lex:br:', '')?.split(':');
  const nivelImplicito = partes.length === 3;
  if (nivelImplicito) {
    return {
      nivel: 'federal',
      autoridade: partes[0],
      tipo: partes[1],
      identificador: partes[2],
    };
  } else {
    return {
      nivel: partes[0],
      autoridade: partes[1],
      tipo: partes[2],
      identificador: partes[3],
    };
  }
};

export const getAutoridade = (urn: string): Autoridade | undefined => {
  const dadosURN = _parseURN(urn);
  return VOCABULARIO.autoridades.find(t => t.urn === dadosURN.autoridade);
};

export const getSigla = (urn: string): string => {
  const tipo = getTipo(urn) ?? {};
  const fnProcurarPorUrnTipoDocumento = (item: any): any => item.urnTipoDocumento === tipo.urn;
  return VOCABULARIO.siglas.find(fnProcurarPorUrnTipoDocumento)?.sigla ?? VOCABULARIO.fakeUrns.find(fnProcurarPorUrnTipoDocumento)?.sigla ?? '';
};

export const getTipo = (urn: string): any => {
  const dadosURN = _parseURN(urn);
  return VOCABULARIO.tiposDocumento.find(t => t.urn === dadosURN.tipo);
};

export const getNumero = (urn: string): string => {
  // urn:lex:br:federal:medida.provisoria:2019-11-11;905
  // urn:lex:br:senado.federal:proposta.emenda.constitucional;pec:2019;16@data.evento;leitura;2019-03-19t14.00
  const dadosURN = _parseURN(urn);
  const anoNumero = dadosURN.identificador.replace(/@.+$/, '').split(';');
  return anoNumero.length > 1 ? anoNumero[1] : '';
};

export const formataNumero = (numero: string): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(+numero);
};

export const getData = (urn: string): string => {
  const dadosURN = _parseURN(urn);

  /*  este caso pode acontecer?
if (partes.length < 3) {
    return '';
  }*/

  // Sem identificação (nem data nem número)
  // Ex: federal:lei:LEXML_URN_ID
  if (dadosURN.identificador === 'LEXML_URN_ID') {
    return '';
  }

  // Apenas ano
  // Ex: federal:lei:2020;123
  if (/^\d{4};$/.test(dadosURN.identificador)) {
    return dadosURN.identificador.split(';')[0];
  }

  // Data completa
  // Ex: federal:lei:2020-10-22;123
  const d = dadosURN.identificador?.substring(0, dadosURN.identificador.indexOf(';'))?.split('-')?.reverse();
  return d ? d.join('/') : '';
};

export const getDataPorExtenso = (urn: string): string => {
  const mes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const dadosURN = _parseURN(urn);

  const dataInformada = dadosURN.identificador?.substring(0, dadosURN.identificador.indexOf(';'));

  if (/^\d{4}$/.test(dataInformada) || /\d{4}$/.test(dataInformada)) {
    return dataInformada;
  }
  const d = dadosURN.identificador?.substring(0, dadosURN.identificador.indexOf(';'))?.split('-')?.reverse();

  if (d) {
    d[1] = mes[+d[1] - 1];
    return d.join(' de ');
  }
  return '';
};

export const getAno = (urn: string): string => (/^\d{4}$/.test(getData(urn)) ? getData(urn) : getData(urn).split('/').slice(-1)[0]);

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
  const dataPadrao = /\d{4}[-]/.test(data) || /^\d{4}$/.test(data) ? data : converteDataFormatoBrasileiroParaUrn(data);
  return `urn:lex:br:${autoridade}:${tipo}:${dataPadrao};${numero}`;
};

// Para inicialização de edição de emenda sem texto lexml
export const buildFakeUrn = (sigla: string, numero: string, ano: string): string => {
  const fake = VOCABULARIO.fakeUrns.find(f => f.sigla === sigla.toUpperCase());
  if (fake) {
    return buildUrn(fake.urnAutoridade, fake.urnTipoDocumento, numero, ano);
  }
  throw `Sigla '${sigla}' não encontrada no vocabulário para montagem da urn.`;
};

export const validaUrn = (urn: string): boolean => {
  const autoridade = getAutoridade(urn)?.urn;
  const tipo = getTipo(urn)?.urn;
  const numero = /^\d{1,5}$/.test(getNumero(urn));
  const data = /\d{4}[-]/.test(getData(urn)) || /^\d{4}$/.test(getData(urn)) ? getData(urn) : converteDataFormatoBrasileiroParaUrn(getData(urn));
  return urn?.startsWith('urn:lex:br:') && autoridade && tipo && numero && data;
};

export const getNomeExtenso = (urn: string): string => {
  const u = retiraFragmento(urn);
  const numero = getNumero(u);
  const tipo = getTipo(u)?.descricao;
  const data = getData(u);
  return (tipo ? tipo : '') + (numero ? ' nº ' + numero : '') + (data.length > 7 ? ' de ' + data : '');
};

export const getNomeExtensoComDataExtenso = (urn: string): string => {
  const atalho = VOCABULARIO.atalhosUrn.find(a => a.urn === urn);
  if (atalho) {
    return atalho.nome;
  }
  const u = retiraFragmento(urn);
  const numero = getNumero(u);
  const tipo = getTipo(u)?.descricao;
  const dataString = getData(u);
  const [diaOuApenasAno, mes, ano] = dataString.split('/').map(p => parseInt(p));
  const dataExtenso = dataString.includes('/') ? getDataExtenso(new Date(ano, mes - 1, diaOuApenasAno)) : diaOuApenasAno;
  return (tipo ? tipo : '') + (numero ? ' nº ' + parseInt(numero).toLocaleString('pt-BR') : '') + ', de ' + dataExtenso;
};

export const buildHtmlLink = (urn: string): string => {
  const nomeExtenso = getNomeExtensoComDataExtenso(urn);
  return `<a href="${urn}">${nomeExtenso}</a>`;
};

const getDataExtenso = (data: Date) => {
  return data ? data.getDate() + ' de ' + data.toLocaleDateString('pt-BR', { month: 'long' }) + ' de ' + data.getFullYear() : undefined;
};

export const getRefGenericaProjeto = (urn: string): NomeComGenero => {
  const tipo = getTipo(urn);
  let genero = generoFromLetra(tipo.genero);
  // TODO - Implementar UrnService.isSubstitutivo
  const substitutivo = false;

  let nome = 'Projeto';
  if (genero === generoFeminino) {
    if (tipo.urn.startsWith('medida.provisoria')) {
      nome = 'Medida Provisória';
    } else {
      nome = 'Proposta';
    }
  }

  if (substitutivo) {
    if (genero === generoFeminino) {
      nome = 'Substitutivo à ' + nome;
    } else {
      nome = 'Substitutivo ao ' + nome;
    }
    genero = generoMasculino;
  }

  return new NomeComGenero(nome, genero);
};

export const getGeneroUrnNorma = (urn: string): Genero => {
  const tipo = getTipo(urn);
  return generoFromLetra(tipo.genero);
};
