import { TipoDocumento } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { isPlv, semZerosAEsquerda } from './montaUrnNovaProposicao';
import { DadosIdentificacao } from './tiposNovaProposicao';

const artigo = (tipo: TipoDocumento): string => (tipo.genero === 'F' ? 'à' : 'ao');

/** RN-08: texto "Novo(a) <identificação>" dos cabeçalhos das Telas 2 e 3. */
export const getIdentificacaoDocumento = (dados: DadosIdentificacao): string => {
  const { especie, tipoProposicao } = dados;
  if (!tipoProposicao) return '';

  if (especie === 'proposicao') {
    return isPlv(dados) ? `${tipoProposicao.descricao} (Medida Provisória nº ${semZerosAEsquerda(dados.numeroMpv)} de ${dados.anoMpv.trim()})` : tipoProposicao.descricao;
  }

  const prefixo = especie === 'substitutivo' ? 'Substitutivo' : 'Subemenda Substitutiva';
  return `${prefixo} ${artigo(tipoProposicao)} ${tipoProposicao.descricao} nº ${semZerosAEsquerda(dados.numeroProposicao)} de ${dados.anoProposicao.trim()}`;
};
