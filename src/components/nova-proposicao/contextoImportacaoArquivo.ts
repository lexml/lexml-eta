import { semZerosAEsquerda } from './montaUrnNovaProposicao';
import { getTipoMpv } from './siglasNovaProposicao';
import { DadosIdentificacao, UrnNovaProposicao } from './tiposNovaProposicao';
import { ContextoImportacaoArquivo } from './urlsNovaProposicao';

/** Contexto da importação a partir dos dados da Tela 1 e das URNs já calculadas. */
export const montaContextoImportacaoArquivo = (dados: DadosIdentificacao, { urn, urnDocumentoReferenciado }: UrnNovaProposicao): ContextoImportacaoArquivo => {
  const { casa, especie, tipoProposicao, tipoSubstitutivo } = dados;
  // No substitutivo do SF não há tipo próprio: vale a sigla da proposição referenciada.
  const siglaDocumento = (tipoSubstitutivo ?? tipoProposicao)?.sigla ?? '';

  let documentoReferenciado: ContextoImportacaoArquivo['documentoReferenciado'];
  if (urnDocumentoReferenciado) {
    const plv = especie === 'proposicao';
    documentoReferenciado = Object.freeze({
      urn: urnDocumentoReferenciado,
      sigla: (plv ? getTipoMpv()?.sigla : tipoProposicao?.sigla) ?? '',
      numero: semZerosAEsquerda(plv ? dados.numeroMpv : dados.numeroProposicao),
      ano: (plv ? dados.anoMpv : dados.anoProposicao).trim(),
    });
  }

  return Object.freeze({ casa, especie, urn, siglaDocumento, ...(documentoReferenciado && { documentoReferenciado }) });
};
