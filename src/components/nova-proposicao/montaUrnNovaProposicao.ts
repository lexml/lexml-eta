import { TipoDocumento } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { chaveTipo, getTipoMpv } from './siglasNovaProposicao';
import { DadosIdentificacao, EspecieDocumento, NUMERO_NAO_NUMERADO, NumeroOriginal, SIGLA_PLV, SUFIXO_SUBSTITUTIVO_SF, UrnNovaProposicao } from './tiposNovaProposicao';

export const semZerosAEsquerda = (valor: string): string => (valor ?? '').trim().replace(/^0+(?=\d)/, '');

const montarUrn = (tipo: TipoDocumento, ano: string, numero: string): string => `urn:lex:br:${tipo.urnAutoridade}:${tipo.urn}:${ano.trim()};${numero}`;

export const isPlv = (dados: Pick<DadosIdentificacao, 'especie' | 'tipoProposicao'>): boolean => dados.especie === 'proposicao' && dados.tipoProposicao?.sigla === SIGLA_PLV;

const urnMpv = (dados: DadosIdentificacao): string => {
  const mpv = getTipoMpv();
  if (!mpv) throw new Error('Tipo MPV não encontrado no vocabulário.');
  return montarUrn(mpv, dados.anoMpv, semZerosAEsquerda(dados.numeroMpv));
};

// O número original só vale enquanto espécie e tipo do próprio documento (o substitutivo, na CD) forem os iniciais.
export const numeroOriginalVale = (especie: EspecieDocumento, tipo: TipoDocumento | undefined, original?: NumeroOriginal): original is NumeroOriginal =>
  !!original && !!tipo && original.especie === especie && original.chaveTipo === chaveTipo(tipo);

const numeroDoDocumento = (dados: DadosIdentificacao, tipo: TipoDocumento, original?: NumeroOriginal): string =>
  numeroOriginalVale(dados.especie, tipo, original) ? original.numero : NUMERO_NAO_NUMERADO;

/** RN-11 a RN-14 e RN-22: URN do novo documento e do documento referenciado. */
export const montaUrnNovaProposicao = (dados: DadosIdentificacao, numeroOriginal?: NumeroOriginal): UrnNovaProposicao => {
  const { especie, casa, tipoProposicao, tipoSubstitutivo } = dados;
  if (!tipoProposicao) throw new Error('Sigla da proposição não informada.');

  if (especie === 'proposicao') {
    const urn = montarUrn(tipoProposicao, dados.anoProposicao, numeroDoDocumento(dados, tipoProposicao, numeroOriginal));
    return isPlv(dados) ? { urn, urnDocumentoReferenciado: urnMpv(dados) } : { urn };
  }

  const urnReferenciada = montarUrn(tipoProposicao, dados.anoProposicao, semZerosAEsquerda(dados.numeroProposicao));

  if (casa === 'SF') {
    return { urn: `${urnReferenciada}${SUFIXO_SUBSTITUTIVO_SF}`, urnDocumentoReferenciado: urnReferenciada };
  }

  if (!tipoSubstitutivo) throw new Error('Sigla do substitutivo não informada.');
  return { urn: montarUrn(tipoSubstitutivo, dados.anoSubstitutivo, numeroDoDocumento(dados, tipoSubstitutivo, numeroOriginal)), urnDocumentoReferenciado: urnReferenciada };
};
