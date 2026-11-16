import { CasaLegislativaEditor } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { lerDadosIdentificacao } from './lerDadosIdentificacao';
import { semZerosAEsquerda } from './montaUrnNovaProposicao';
import { DadosIdentificacao, SIGLA_PLV } from './tiposNovaProposicao';

const nomeComSigla = (dados: Pick<DadosIdentificacao, 'tipoProposicao'>): string => `${dados.tipoProposicao?.descricao} (${dados.tipoProposicao?.sigla})`;

const identificacao = (dados: DadosIdentificacao): string => `${nomeComSigla(dados)} nº ${semZerosAEsquerda(dados.numeroProposicao)}, de ${dados.anoProposicao.trim()}`;

/** Descrição do documento no grupo "Dados básicos" da aba, derivada das URNs (sem "Novo/Nova"; flexão ao/à no substitutivo). */
export const descricaoDocumento = (urn: string, urnDocumentoReferenciado: string | undefined, casa: CasaLegislativaEditor): string => {
  const { dados, numeroOriginal } = lerDadosIdentificacao(urn, urnDocumentoReferenciado, casa);
  const { especie, tipoProposicao, tipoSubstitutivo } = dados;
  if (!tipoProposicao) return '';

  if (especie === 'substitutivo' || especie === 'subemenda') {
    const artigo = tipoProposicao.genero === 'F' ? 'à' : 'ao';
    const nome = especie === 'subemenda' ? 'Subemenda Substitutiva' : 'Substitutivo';
    const proprio = tipoSubstitutivo ? `${nome} (${tipoSubstitutivo.sigla})` : nome;
    return `${proprio} ${artigo} ${identificacao(dados)}`;
  }

  const mpv = tipoProposicao.sigla === SIGLA_PLV && dados.numeroMpv ? `(MPV nº ${semZerosAEsquerda(dados.numeroMpv)}, de ${dados.anoMpv.trim()})` : '';

  if (numeroOriginal) {
    const numerado = identificacao({ ...dados, numeroProposicao: numeroOriginal.numero });
    return mpv ? `${numerado} ${mpv}` : numerado;
  }

  return mpv ? `${tipoProposicao.descricao} ${mpv}` : nomeComSigla(dados);
};
