import { DescricaoSituacao } from '../../dispositivo/situacao';
import { DispositivoNovo } from './dispositivoNovo';

export class DispositivoAdicionado extends DispositivoNovo {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_ADICIONADO;
}
