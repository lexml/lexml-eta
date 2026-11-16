import { getVocabularioCompleto } from './vocabulario';
import { TipoDocumento } from './vocabulario/tiposVocabulario';
import { ANO_PROVISORIO, formataNumero, getAno, getNumero, getTipo, isSubstitutivo, NUMERO_PROVISORIO } from './urnUtil';

export const MODELO_EPIGRAFE_PADRAO = '{descricaoMaiusculas} Nº {numero}, DE {ano}';

// Espaço para o número ser preenchido à mão no documento impresso.
const NUMERO_EM_BRANCO = '       ';

const codificaXml = (texto: string): string => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const maiusculas = (texto: string): string => texto.toLocaleUpperCase('pt-BR');

const numeroDaUrn = (urn: string): string => {
  const numero = getNumero(urn);
  return numero === NUMERO_PROVISORIO ? NUMERO_EM_BRANCO : formataNumero(numero);
};

const anoDaUrn = (urn: string): string => {
  const ano = getAno(urn);
  return ano === ANO_PROVISORIO ? '' : ano;
};

const preposicao = (tipo?: TipoDocumento): string => (tipo?.genero === 'M' ? 'ao' : tipo?.genero === 'F' ? 'à' : '');

const valoresDaUrn = (urn: string | undefined, prefixo: string): Record<string, string> => {
  if (!urn) return {};
  const tipo: TipoDocumento | undefined = getTipo(urn);
  const descricao = tipo?.descricao ?? '';
  return {
    [`${prefixo}sigla`]: tipo?.sigla ?? '',
    [`${prefixo}numero`]: numeroDaUrn(urn),
    [`${prefixo}ano`]: anoDaUrn(urn),
    [`${prefixo}descricao`]: descricao,
    [`${prefixo}descricaoMaiusculas`]: maiusculas(descricao),
  };
};

const PLACEHOLDERS_CONHECIDOS = ['sigla', 'numero', 'ano', 'descricao', 'descricaoMaiusculas'];
const PLACEHOLDERS_DO_REFERENCIADO = [...PLACEHOLDERS_CONHECIDOS, 'preposicao', 'preposicaoMaiusculas'].map(p => `dr.${p}`);
const PLACEHOLDERS = new Set([...PLACEHOLDERS_CONHECIDOS, ...PLACEHOLDERS_DO_REFERENCIADO, 'sufixo']);

const escolheModelo = (urn: string): string => {
  const tipo: TipoDocumento | undefined = getTipo(urn);
  if (!tipo) return MODELO_EPIGRAFE_PADRAO;
  const codigo = (isSubstitutivo(urn) && tipo.modeloEpigrafeSubstitutivo) || tipo.modeloEpigrafe;
  const modelo = codigo && getVocabularioCompleto().modelosEpigrafe.find(m => m.urnAutoridade === tipo.urnAutoridade && m.codigo === codigo);
  return modelo ? modelo.modelo : MODELO_EPIGRAFE_PADRAO;
};

// O modelo pode conter elementos XML aceitos em Epigrafe (ex.: <br/>); só os valores substituídos são codificados.
export const preencheModeloEpigrafe = (modelo: string, urn: string, urnDocumentoReferenciado?: string, sufixo?: string): string => {
  const tipoReferenciado: TipoDocumento | undefined = urnDocumentoReferenciado ? getTipo(urnDocumentoReferenciado) : undefined;
  const preposicaoReferenciado = preposicao(tipoReferenciado);
  const valores: Record<string, string> = {
    ...valoresDaUrn(urn, ''),
    ...valoresDaUrn(urnDocumentoReferenciado, 'dr.'),
    'dr.preposicao': preposicaoReferenciado,
    'dr.preposicaoMaiusculas': maiusculas(preposicaoReferenciado),
    sufixo: sufixo ?? '',
  };

  // Placeholder desconhecido fica no texto, para que um erro no modelo apareça.
  return modelo.replace(/\{([\w.]+)\}/g, (placeholder, nome: string) => (PLACEHOLDERS.has(nome) ? codificaXml(valores[nome] ?? '') : placeholder));
};

export const montaEpigrafe = (urn: string, urnDocumentoReferenciado?: string, sufixo?: string): string =>
  preencheModeloEpigrafe(escolheModelo(urn), urn, urnDocumentoReferenciado, sufixo);
