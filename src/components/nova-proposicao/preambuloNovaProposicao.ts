import { getPreambuloPadrao } from '../../model/lexml/documento/urnUtil';

export const PREAMBULO_FALLBACK = 'O CONGRESSO NACIONAL decreta:';

// O fallback é do componente: a abertura de documentos segue sem preâmbulo para tipo sem modelo.
export const getPreambuloNovaProposicao = (urn: string): string => {
  const texto = getPreambuloPadrao(urn);
  if (texto) return texto;
  console.error(`Preâmbulo padrão não encontrado para a URN '${urn}'.`);
  return PREAMBULO_FALLBACK;
};
