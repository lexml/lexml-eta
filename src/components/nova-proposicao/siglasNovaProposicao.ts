import { getVocabularioDaCasa } from '../../model/lexml/documento/vocabulario';
import { CasaLegislativaEditor, TipoDocumento, TipoRelacaoSubstitutivo } from '../../model/lexml/documento/vocabulario/tiposVocabulario';

const AUTORIDADE_CONGRESSO = 'congresso.nacional';

const autoridadeDaCasa = (casa: CasaLegislativaEditor): string => (casa === 'SF' ? 'senado.federal' : 'camara.deputados');

// Ativos antes dos inativos; cada grupo em ordem alfabética da sigla.
const ordenar = (tipos: TipoDocumento[]): TipoDocumento[] =>
  [...tipos].sort((a, b) => Number(b.ativo) - Number(a.ativo) || (a.sigla ?? '').localeCompare(b.sigla ?? '') || a.urnAutoridade.localeCompare(b.urnAutoridade));

/** Identifica um tipo de forma única na lista (a mesma sigla pode repetir em tipos diferentes, ex.: PLS). */
export const chaveTipo = (tipo: TipoDocumento): string => `${tipo.urnAutoridade}:${tipo.urn}`;

/** RN-00: siglas de nova proposição (tipos da casa e do Congresso que não são substitutivo nem subemenda; a MPV não entra). */
export const getSiglasNovaProposicao = (casa: CasaLegislativaEditor): TipoDocumento[] => {
  const autoridades = [autoridadeDaCasa(casa), AUTORIDADE_CONGRESSO];
  return ordenar(
    getVocabularioDaCasa().tiposDocumento.filter(
      t =>
        t.sigla &&
        autoridades.includes(t.urnAutoridade) &&
        t.tipoRelacaoSubstitutivo !== TipoRelacaoSubstitutivo.E_SUBSTITUTIVO &&
        t.tipoRelacaoSubstitutivo !== TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA
    )
  );
};

/** RN-00a: siglas da proposição que recebe substitutivo ou subemenda, ativas e inativas. */
export const getSiglasProposicaoReferenciada = (): TipoDocumento[] =>
  ordenar(getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla && t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO));

/** Tela 2, "texto de outra proposição": todas as siglas do vocabulário da casa, ativas e inativas (inclui a MPV). */
export const getSiglasOutraProposicao = (): TipoDocumento[] => ordenar(getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla));

/** g2 (CD): tipos ativos de substitutivo ou de subemenda substitutiva. */
export const getSiglasSubstitutivo = (relacao: TipoRelacaoSubstitutivo.E_SUBSTITUTIVO | TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA): TipoDocumento[] =>
  ordenar(getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla && t.ativo && t.tipoRelacaoSubstitutivo === relacao));

/** g4: a medida provisória do PLV (única utilização da autoridade `federal`). */
export const getTipoMpv = (): TipoDocumento | undefined => getVocabularioDaCasa().tiposDocumento.find(t => t.sigla === 'MPV' && t.urnTipoDocumento === 'medida.provisoria');
