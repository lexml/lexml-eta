import { StateType } from '../../redux/state';
import { Elemento } from '../elemento';
import { Usuario } from './usuario';

export class Revisao {
  actionType: string;
  stateType: StateType;
  // tipo: TipoRevisao;
  descricao: string;
  usuario: Usuario;
  dataHora: string;
  elementoAntesRevisao: Partial<Elemento> | undefined;
  uuidRevisado: number;
  uuidPosicaoAntesRevisao?: number;

  constructor(
    actionType: string,
    stateType: StateType,
    descricao: string,
    usuario: Usuario,
    dataHora: string,
    elementoAntesRevisao: Partial<Elemento> | undefined,
    uuidRevisado: number,
    uuidPosicaoAntesRevisao?: number
  ) {
    this.actionType = actionType;
    this.stateType = stateType;
    this.descricao = descricao;
    this.usuario = usuario;
    this.dataHora = dataHora;
    this.elementoAntesRevisao = elementoAntesRevisao;
    this.uuidRevisado = uuidRevisado;
    this.uuidPosicaoAntesRevisao = uuidPosicaoAntesRevisao;
  }
}

export enum TipoRevisao {
  DispositivoAdicionado = 'DispositivoAdicionado',
  DispositivoSuprimido = 'DispositivoSuprimido',
  DispositivoModificado = 'DispositivoModificado',
}
