import { getAno, getTipo } from '../../model/lexml/documento/urnUtil';

// Caso padrão enquanto o serviço de epígrafe do vocabulário (#1053) não existe: sem sufixo, número em branco.
export const montaEpigrafePadrao = (urn: string): string => {
  const descricao = (getTipo(urn)?.descricao ?? '').toLocaleUpperCase('pt-BR');
  return `${descricao} Nº   , DE ${getAno(urn)}`;
};
