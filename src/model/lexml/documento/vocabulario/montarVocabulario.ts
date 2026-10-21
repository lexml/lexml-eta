import { camara } from './camara';
import { comum } from './comum';
import { congresso } from './congresso';
import { federal } from './federal';
import { mesclar } from './mesclar';
import { senado } from './senado';
import { CasaLegislativaEditor, Vocabulario, VocabularioAutoridade } from './tipos';

const AUTORIDADES_POR_CASA: Record<CasaLegislativaEditor, VocabularioAutoridade[]> = {
  SF: [federal, senado, congresso],
  CD: [federal, camara, congresso],
};

export const montarVocabulario = (casa: CasaLegislativaEditor): Vocabulario => mesclar(comum, AUTORIDADES_POR_CASA[casa]);
