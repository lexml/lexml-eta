import { TipoDocumento } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { isPlv, semZerosAEsquerda } from './montaUrnNovaProposicao';
import { DadosIdentificacao } from './tiposNovaProposicao';

const artigo = (tipo: TipoDocumento): string => (tipo.genero === 'F' ? 'à' : 'ao');

// "Novo"/"Nova" concorda com o gênero do documento: substitutivo é masculino; subemenda substitutiva, feminino; nos demais, o do tipo.
export const getNovoOuNova = (dados: Pick<DadosIdentificacao, 'especie' | 'tipoProposicao'>): 'Novo' | 'Nova' => {
  if (dados.especie === 'substitutivo') return 'Novo';
  if (dados.especie === 'subemenda') return 'Nova';
  return dados.tipoProposicao?.genero === 'F' ? 'Nova' : 'Novo';
};

/** RN-08: texto da identificação dos cabeçalhos das Telas 2 e 3 ("Novo/Nova <identificação>."). */
export const getIdentificacaoDocumento = (dados: DadosIdentificacao): string => {
  const { especie, tipoProposicao } = dados;
  if (!tipoProposicao) return '';

  if (especie === 'proposicao') {
    return isPlv(dados) ? `${tipoProposicao.descricao} (Medida Provisória nº ${semZerosAEsquerda(dados.numeroMpv)} de ${dados.anoMpv.trim()})` : tipoProposicao.descricao;
  }

  const prefixo = especie === 'substitutivo' ? 'Substitutivo' : 'Subemenda Substitutiva';
  return `${prefixo} ${artigo(tipoProposicao)} ${tipoProposicao.descricao} nº ${semZerosAEsquerda(dados.numeroProposicao)} de ${dados.anoProposicao.trim()}`;
};
