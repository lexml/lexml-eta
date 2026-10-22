import { montarVocabulario } from './montarVocabulario';
import { CasaLegislativaEditor, Vocabulario } from './tiposVocabulario';

const CASA_PADRAO: CasaLegislativaEditor = 'SF';

let vocabularioAtual: Vocabulario | undefined;

// Sem inicialização prévia (testes, utilitários isolados), vale o vocabulário de SF.
export const getVocabulario = (): Vocabulario => {
  if (!vocabularioAtual) {
    vocabularioAtual = montarVocabulario(CASA_PADRAO);
  }
  return vocabularioAtual;
};

export const inicializarVocabulario = (casa?: string): Vocabulario => {
  const valida = casa === 'SF' || casa === 'CD';
  if (!valida) {
    console.warn(`casaLegislativaEditor '${casa}' inválida; usando '${CASA_PADRAO}'.`);
  }
  vocabularioAtual = montarVocabulario(valida ? casa : CASA_PADRAO);
  return vocabularioAtual;
};
