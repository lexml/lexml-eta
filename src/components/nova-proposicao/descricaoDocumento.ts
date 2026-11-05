import { CasaLegislativaEditor } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { getNovoOuNova } from './identificacaoDocumento';
import { lerDadosIdentificacao } from './lerDadosIdentificacao';
import { semZerosAEsquerda } from './montaUrnNovaProposicao';
import { DadosIdentificacao, SIGLA_PLV } from './tiposNovaProposicao';

const nomeComSigla = (dados: Pick<DadosIdentificacao, 'tipoProposicao'>): string => `${dados.tipoProposicao?.descricao} (${dados.tipoProposicao?.sigla})`;

const identificacao = (dados: DadosIdentificacao): string => `${nomeComSigla(dados)} nº ${semZerosAEsquerda(dados.numeroProposicao)}, de ${dados.anoProposicao.trim()}`;

/** Descrição do documento no grupo "Dados básicos" da aba, derivada das URNs (flexão Novo/Nova, ao/à). */
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

  if (numeroOriginal) return `${identificacao({ ...dados, numeroProposicao: numeroOriginal.numero })}`;

  if (tipoProposicao.sigla === SIGLA_PLV) {
    return `${getNovoOuNova(dados)} ${tipoProposicao.descricao} (MPV nº ${semZerosAEsquerda(dados.numeroMpv)}, de ${dados.anoMpv.trim()})`;
  }
  return `${getNovoOuNova(dados)} ${nomeComSigla(dados)}`;
};
