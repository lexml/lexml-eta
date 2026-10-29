import { montarVocabulario, montarVocabularioCompleto } from './montarVocabulario';
import { CasaLegislativaEditor, Vocabulario } from './tiposVocabulario';

const CASA_PADRAO: CasaLegislativaEditor = 'SF';

let vocabularioCompleto: Vocabulario | undefined;
let vocabularioDaCasa: Vocabulario | undefined;
let casaDoVocabulario: CasaLegislativaEditor | undefined;

// Consultas que partem de uma URN: todas as autoridades, qualquer que seja a casa do editor.
export const getVocabularioCompleto = (): Vocabulario => {
  if (!vocabularioCompleto) {
    vocabularioCompleto = montarVocabularioCompleto();
  }
  return vocabularioCompleto;
};

// Consultas sem autoridade (sigla, listagens). Sem inicialização prévia (testes, utilitários isolados), vale SF.
export const getVocabularioDaCasa = (): Vocabulario => {
  return vocabularioDaCasa ?? inicializarVocabulario(CASA_PADRAO);
};

// Mesma casa já montada: reaproveita (o componente inicializa no construtor e a cada atribuição da config).
export const inicializarVocabulario = (casa?: string): Vocabulario => {
  const valida = casa === 'SF' || casa === 'CD';
  if (!valida) {
    console.warn(`casaLegislativaEditor '${casa}' inválida; usando '${CASA_PADRAO}'.`);
  }
  const casaEfetiva: CasaLegislativaEditor = valida ? casa : CASA_PADRAO;
  if (!vocabularioDaCasa || casaDoVocabulario !== casaEfetiva) {
    vocabularioDaCasa = montarVocabulario(casaEfetiva);
    casaDoVocabulario = casaEfetiva;
  }
  return vocabularioDaCasa;
};
