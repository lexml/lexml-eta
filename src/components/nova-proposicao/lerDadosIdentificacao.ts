import { getVocabularioDaCasa } from '../../model/lexml/documento/vocabulario';
import { CasaLegislativaEditor, TipoDocumento, TipoRelacaoSubstitutivo } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { getAno, getNumero, getTipo, isSubstitutivo } from '../../model/lexml/documento/urnUtil';
import { chaveTipo } from './siglasNovaProposicao';
import { DadosIdentificacao, EspecieDocumento, NUMERO_NAO_NUMERADO, NumeroOriginal, SIGLA_PLV } from './tiposNovaProposicao';

export interface DadosIdentificacaoLidos {
  dados: DadosIdentificacao;
  numeroOriginal?: NumeroOriginal;
}

// Tipo da visão da casa (mesma instância das listas da Tela 1); fora dela, o da visão completa.
const resolverTipo = (urn: string): TipoDocumento | undefined => {
  const tipo = getTipo(urn);
  if (!tipo) return undefined;
  return getVocabularioDaCasa().tiposDocumento.find(t => chaveTipo(t) === chaveTipo(tipo)) ?? tipo;
};

const numeroReal = (urn: string): string => {
  const numero = getNumero(urn);
  return numero && numero !== NUMERO_NAO_NUMERADO ? numero : '';
};

/** Inverso de `montaUrnNovaProposicao`: URN e URN referenciada → dados da Tela 1 (design D3). */
export const lerDadosIdentificacao = (urn: string, urnDocumentoReferenciado: string | undefined, casa: CasaLegislativaEditor): DadosIdentificacaoLidos => {
  const tipo = resolverTipo(urn);
  if (!tipo) throw new Error(`Tipo de documento não encontrado na URN '${urn}'.`);

  const base: DadosIdentificacao = { casa, especie: 'proposicao', numeroProposicao: '', anoProposicao: getAno(urn), anoSubstitutivo: '', numeroMpv: '', anoMpv: '' };
  const original = (especie: EspecieDocumento, numero: string): NumeroOriginal | undefined => (numero ? { numero, especie, chaveTipo: chaveTipo(tipo) } : undefined);

  const relacao = tipo.tipoRelacaoSubstitutivo;
  if (relacao === TipoRelacaoSubstitutivo.E_SUBSTITUTIVO || relacao === TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA) {
    const especie: EspecieDocumento = relacao === TipoRelacaoSubstitutivo.E_SUBSTITUTIVO ? 'substitutivo' : 'subemenda';
    const referenciada = urnDocumentoReferenciado ? resolverTipo(urnDocumentoReferenciado) : undefined;
    const dados: DadosIdentificacao = {
      ...base,
      especie,
      tipoSubstitutivo: tipo,
      anoSubstitutivo: getAno(urn),
      tipoProposicao: referenciada,
      numeroProposicao: urnDocumentoReferenciado ? numeroReal(urnDocumentoReferenciado) : '',
      anoProposicao: urnDocumentoReferenciado ? getAno(urnDocumentoReferenciado) : '',
    };
    return { dados, numeroOriginal: original(especie, numeroReal(urn)) };
  }

  // Substitutivo do Senado: a URN é a da proposição, com o evento de apresentação; o número é o da proposição.
  if (isSubstitutivo(urn)) {
    return { dados: { ...base, especie: 'substitutivo', tipoProposicao: tipo, numeroProposicao: numeroReal(urn) } };
  }

  const dados: DadosIdentificacao = { ...base, tipoProposicao: tipo };
  if (tipo.sigla === SIGLA_PLV && urnDocumentoReferenciado) {
    dados.numeroMpv = numeroReal(urnDocumentoReferenciado);
    dados.anoMpv = getAno(urnDocumentoReferenciado);
  }
  return { dados, numeroOriginal: original('proposicao', numeroReal(urn)) };
};
