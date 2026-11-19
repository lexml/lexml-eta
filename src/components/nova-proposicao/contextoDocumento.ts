import { semZerosAEsquerda } from './montaUrnNovaProposicao';
import { getTipoMpv } from './siglasNovaProposicao';
import { ColegiadoDestino, DadosIdentificacao, UrnNovaProposicao } from './tiposNovaProposicao';
import { ContextoDocumento } from './urlsNovaProposicao';

export interface EscolhasDestino {
  colegiadoDestino: ColegiadoDestino;
  anexoParecer: boolean;
}

/** Contexto do documento a partir dos dados da Tela 1, das URNs já calculadas e do destino e da forma de apresentação. */
export const montaContextoDocumento = (
  dados: DadosIdentificacao,
  { urn, urnDocumentoReferenciado }: UrnNovaProposicao,
  { colegiadoDestino, anexoParecer }: EscolhasDestino
): ContextoDocumento => {
  const { casa, especie, tipoProposicao, tipoSubstitutivo } = dados;
  // No substitutivo do SF não há tipo próprio: vale a sigla da proposição referenciada.
  const siglaDocumento = (tipoSubstitutivo ?? tipoProposicao)?.sigla ?? '';

  let documentoReferenciado: ContextoDocumento['documentoReferenciado'];
  if (urnDocumentoReferenciado) {
    const plv = especie === 'proposicao';
    documentoReferenciado = Object.freeze({
      urn: urnDocumentoReferenciado,
      sigla: (plv ? getTipoMpv()?.sigla : tipoProposicao?.sigla) ?? '',
      numero: semZerosAEsquerda(plv ? dados.numeroMpv : dados.numeroProposicao),
      ano: (plv ? dados.anoMpv : dados.anoProposicao).trim(),
    });
  }

  return Object.freeze({
    casa,
    especie,
    urn,
    siglaDocumento,
    ...(documentoReferenciado && { documentoReferenciado }),
    colegiadoDestino: Object.freeze({ ...colegiadoDestino }),
    anexoParecer,
  });
};
