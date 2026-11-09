import { montaEpigrafe } from '../../model/lexml/documento/epigrafe';
import type { CasaLegislativaEditor } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { ColegiadoDestino } from './tiposNovaProposicao';

// Só o SF identifica o colegiado na epígrafe.
export const getSufixoEpigrafe = (casa: CasaLegislativaEditor, colegiado: ColegiadoDestino): string | undefined => {
  if (casa !== 'SF') return undefined;
  return colegiado.tipoColegiado === 'Comissão' ? `- ${colegiado.siglaComissao}` : '- PLEN';
};

export const montaEpigrafeNovaProposicao = (urn: string, urnDocumentoReferenciado: string | undefined, casa: CasaLegislativaEditor, colegiado: ColegiadoDestino): string =>
  montaEpigrafe(urn, urnDocumentoReferenciado, getSufixoEpigrafe(casa, colegiado));
