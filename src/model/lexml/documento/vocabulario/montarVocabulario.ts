import { camara } from './vocabularioCamara';
import { comum } from './vocabularioComum';
import { congresso } from './vocabularioCongresso';
import { federal } from './vocabularioFederal';
import { mesclar } from './mesclarVocabulario';
import { senado } from './vocabularioSenado';
import { CasaLegislativaEditor, Vocabulario, VocabularioAutoridade } from './tiposVocabulario';

const AUTORIDADES_POR_CASA: Record<CasaLegislativaEditor, VocabularioAutoridade[]> = {
  SF: [federal, senado, congresso],
  CD: [federal, camara, congresso],
};

const TODAS_AS_AUTORIDADES: VocabularioAutoridade[] = [federal, senado, camara, congresso];

export const montarVocabulario = (casa: CasaLegislativaEditor): Vocabulario => mesclar(comum, AUTORIDADES_POR_CASA[casa]);

// Valida as duas casas aqui para que um erro de dados de uma apareça mesmo quando o editor só usa a outra.
export const montarVocabularioCompleto = (): Vocabulario => {
  (Object.keys(AUTORIDADES_POR_CASA) as CasaLegislativaEditor[]).forEach(montarVocabulario);
  return mesclar(comum, TODAS_AS_AUTORIDADES, { siglaAtivaUnica: false });
};
