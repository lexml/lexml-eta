import { generoFromLetra } from '../../dispositivo/genero';
import { Autoridade } from '../../documento/autoridade';
import { Genero, generoFeminino, generoMasculino, NomeComGenero } from './../../dispositivo/genero';
import { VOCABULARIO } from './vocabulario';

export const getAutoridade = (urn: string): Autoridade | undefined => {
  const partes = urn.replace('urn:lex:br:', '')?.split(':');
  return VOCABULARIO.autoridades.filter(t => t.urn === partes[0])[0];
};

export const getSigla = (urn: string): string => {
  const tipo = getTipo(urn) ?? {};
  const fnProcurarPorUrnTipoDocumento = (item: any): any => item.urnTipoDocumento === tipo.urn;
  return VOCABULARIO.siglas.find(fnProcurarPorUrnTipoDocumento)?.sigla ?? VOCABULARIO.fakeUrns.find(fnProcurarPorUrnTipoDocumento)?.sigla ?? '';
};

export const getTipo = (urn: string): any => {
  const tipo = urn.replace('urn:lex:br:', '')?.split(':');
  return VOCABULARIO.tiposDocumento.filter(t => t.urn === tipo[1])[0];
};

export const getNumero = (urn: string): string => {
  const partes = urn.replace('urn:lex:br:', '')?.split(':');
  return partes[2]?.indexOf(';') > -1 ? partes[2]?.substring(partes[2].indexOf(';') + 1) : '';
};

export const formataNumero = (numero: string): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(+numero);
};

export const getData = (urn: string): string => {
  const partes = urn.replace('urn:lex:br:', '')?.split(':');

  if (partes.length < 3) {
    return '';
  }

  // Sem identificação (nem data nem número)
  // Ex: federal:lei:LEXML_URN_ID
  if (partes[2] === 'LEXML_URN_ID') {
    return '';
  }

  // Apenas ano
  // Ex: federal:lei:2020;123
  if (/^\d{4};$/.test(partes[2])) {
    return partes[2].split(';')[0];
  }

  // Data completa
  // Ex: federal:lei:2020-10-22;123
  const d = partes[2]?.substring(0, partes[2].indexOf(';'))?.split('-')?.reverse();
  return d ? d.join('/') : '';
};

export const getDataPorExtenso = (urn: string): string => {
  const mes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const partes = urn.replace('urn:lex:br:', '')?.split(':');

  const dataInformada = partes[2]?.substring(0, partes[2].indexOf(';'));

  if (/^\d{4}$/.test(dataInformada) || /\d{4}$/.test(dataInformada)) {
    return dataInformada;
  }
  const d = partes[2]?.substring(0, partes[2].indexOf(';'))?.split('-')?.reverse();

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
