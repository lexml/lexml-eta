import { TipoDocumento } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { getTipoMpv } from './siglasNovaProposicao';
import { DadosIdentificacao, NUMERO_NAO_NUMERADO, SIGLA_PLV, SUFIXO_SUBSTITUTIVO_SF, UrnNovaProposicao } from './tiposNovaProposicao';

export const semZerosAEsquerda = (valor: string): string => (valor ?? '').trim().replace(/^0+(?=\d)/, '');

const montarUrn = (tipo: TipoDocumento, ano: string, numero: string): string => `urn:lex:br:${tipo.urnAutoridade}:${tipo.urn}:${ano.trim()};${numero}`;

export const isPlv = (dados: Pick<DadosIdentificacao, 'especie' | 'tipoProposicao'>): boolean => dados.especie === 'proposicao' && dados.tipoProposicao?.sigla === SIGLA_PLV;

const urnMpv = (dados: DadosIdentificacao): string => {
  const mpv = getTipoMpv();
  if (!mpv) throw new Error('Tipo MPV não encontrado no vocabulário.');
  return montarUrn(mpv, dados.anoMpv, semZerosAEsquerda(dados.numeroMpv));
};

/** RN-11 a RN-14 e RN-22: URN do novo documento e do documento referenciado. */
export const montaUrnNovaProposicao = (dados: DadosIdentificacao): UrnNovaProposicao => {
  const { especie, casa, tipoProposicao, tipoSubstitutivo } = dados;
  if (!tipoProposicao) throw new Error('Sigla da proposição não informada.');

  if (especie === 'proposicao') {
    const urn = montarUrn(tipoProposicao, dados.anoProposicao, NUMERO_NAO_NUMERADO);
    return isPlv(dados) ? { urn, urnDocumentoReferenciado: urnMpv(dados) } : { urn };
  }

  const urnReferenciada = montarUrn(tipoProposicao, dados.anoProposicao, semZerosAEsquerda(dados.numeroProposicao));

  if (casa === 'SF') {
    return { urn: `${urnReferenciada}${SUFIXO_SUBSTITUTIVO_SF}`, urnDocumentoReferenciado: urnReferenciada };
  }

  if (!tipoSubstitutivo) throw new Error('Sigla do substitutivo não informada.');
  return { urn: montarUrn(tipoSubstitutivo, dados.anoSubstitutivo, NUMERO_NAO_NUMERADO), urnDocumentoReferenciado: urnReferenciada };
};
