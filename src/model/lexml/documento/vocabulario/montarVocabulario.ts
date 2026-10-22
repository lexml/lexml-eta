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

export const montarVocabulario = (casa: CasaLegislativaEditor): Vocabulario => mesclar(comum, AUTORIDADES_POR_CASA[casa]);
