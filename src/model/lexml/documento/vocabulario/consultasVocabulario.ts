import { getVocabulario } from '.';
import { TipoDocumento, TipoRelacaoSubstitutivo } from './tiposVocabulario';

const proposicoes = (): TipoDocumento[] => getVocabulario().tiposDocumento.filter(t => t.sigla);

export const getTiposDocumentoAtivos = (): TipoDocumento[] => getVocabulario().tiposDocumentoAtivos;

export const getTiposDocumentoInativos = (): TipoDocumento[] => proposicoes().filter(t => !t.ativo);

export const getTipoPorSigla = (sigla: string): TipoDocumento | undefined => {
  const maiuscula = (sigla ?? '').toUpperCase();
  return getVocabulario().tiposDocumentoAtivos.find(t => t.sigla === maiuscula);
};

// Prefere a autoridade do tipo que referencia; sem ela, vale qualquer outra da casa.
const resolverReferencia = (urn: string, autoridade: string): TipoDocumento | undefined => {
  const candidatos = getVocabulario().tiposDocumento.filter(t => t.urn === urn);
  return candidatos.find(t => t.urnAutoridade === autoridade) ?? candidatos[0];
};

export const getTiposReferenciaveis = (tipo: TipoDocumento | undefined): TipoDocumento[] => {
  if (!tipo?.sigla || !tipo.ativo) return [];

  switch (tipo.tipoRelacaoSubstitutivo) {
    case TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO:
      return (tipo.tiposReferenciaveis ?? []).map(urn => resolverReferencia(urn, tipo.urnAutoridade)).filter((t): t is TipoDocumento => !!t);
    case TipoRelacaoSubstitutivo.E_SUBSTITUTIVO:
      return proposicoes().filter(t => t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO);
    case TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA:
      return proposicoes().filter(t => t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.E_SUBSTITUTIVO);
    default:
      return [];
  }
};
