import { camara } from './camara';
import { comum } from './comum';
import { congresso } from './congresso';
import { federal } from './federal';
import { mesclar } from './mesclar';
import { senado } from './senado';

// Ordem de mesclagem: define qual cópia vence nos lookups com fallback.
export const VOCABULARIO = mesclar(comum, [federal, senado, camara, congresso]);
