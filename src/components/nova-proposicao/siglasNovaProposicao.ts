import { getVocabularioDaCasa } from '../../model/lexml/documento/vocabulario';
import { CasaLegislativaEditor, TipoDocumento, TipoRelacaoSubstitutivo } from '../../model/lexml/documento/vocabulario/tiposVocabulario';

const AUTORIDADE_CONGRESSO = 'congresso.nacional';

const autoridadeDaCasa = (casa: CasaLegislativaEditor): string => (casa === 'SF' ? 'senado.federal' : 'camara.deputados');

// Ativos antes dos inativos; cada grupo em ordem alfabética da sigla.
const ordenar = (tipos: TipoDocumento[]): TipoDocumento[] =>
  [...tipos].sort((a, b) => Number(b.ativo) - Number(a.ativo) || (a.sigla ?? '').localeCompare(b.sigla ?? '') || a.urnAutoridade.localeCompare(b.urnAutoridade));

/** Identifica um tipo de forma única (a mesma sigla pode repetir em tipos diferentes, ex.: PLS). */
export const chaveTipo = (tipo: TipoDocumento): string => `${tipo.urnAutoridade}:${tipo.urn}`;

// Uma entrada por sigla, a primeira da ordenação (ex.: PLS e PLC existem como lei ordinária e complementar).
const unicasPorSigla = (tipos: TipoDocumento[]): TipoDocumento[] => tipos.filter((t, i) => tipos.findIndex(o => o.sigla === t.sigla) === i);

const ehComplementar = (tipo: TipoDocumento): boolean => /^[^;]*\.complementar(;|$)/.test(tipo.urn);

/** Para sigla com tipo ordinário e complementar na mesma autoridade, devolve o tipo indicado por `complementar`; senão, o próprio tipo. */
export const resolverTipoComplementar = (tipo: TipoDocumento, complementar: boolean): TipoDocumento => {
  const irmaos = getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla === tipo.sigla && t.urnAutoridade === tipo.urnAutoridade);
  if (!irmaos.some(ehComplementar) || !irmaos.some(t => !ehComplementar(t))) return tipo;
  return irmaos.find(t => ehComplementar(t) === complementar) ?? tipo;
};

/** RN-00: siglas de nova proposição (só tipos ativos da casa e do Congresso que não são substitutivo nem subemenda; a MPV não entra). */
export const getSiglasNovaProposicao = (casa: CasaLegislativaEditor): TipoDocumento[] => {
  const autoridades = [autoridadeDaCasa(casa), AUTORIDADE_CONGRESSO];
  return ordenar(
    getVocabularioDaCasa().tiposDocumento.filter(
      t =>
        t.sigla &&
        t.ativo &&
        autoridades.includes(t.urnAutoridade) &&
        t.tipoRelacaoSubstitutivo !== TipoRelacaoSubstitutivo.E_SUBSTITUTIVO &&
        t.tipoRelacaoSubstitutivo !== TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA
    )
  );
};

/** RN-00a: siglas da proposição que recebe substitutivo ou subemenda, ativas e inativas, uma vez cada. */
export const getSiglasProposicaoReferenciada = (): TipoDocumento[] =>
  unicasPorSigla(ordenar(getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla && t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO)));

/** Tela 2, "texto de outra proposição": todas as siglas do vocabulário da casa, ativas e inativas (inclui a MPV), uma vez cada. */
export const getSiglasOutraProposicao = (): TipoDocumento[] => unicasPorSigla(ordenar(getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla)));

/** g2 (CD): tipos ativos de substitutivo ou de subemenda substitutiva. */
export const getSiglasSubstitutivo = (relacao: TipoRelacaoSubstitutivo.E_SUBSTITUTIVO | TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA): TipoDocumento[] =>
  ordenar(getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla && t.ativo && t.tipoRelacaoSubstitutivo === relacao));

/** g4: a medida provisória do PLV (única utilização da autoridade `federal`). */
export const getTipoMpv = (): TipoDocumento | undefined => getVocabularioDaCasa().tiposDocumento.find(t => t.sigla === 'MPV' && t.urnTipoDocumento === 'medida.provisoria');
