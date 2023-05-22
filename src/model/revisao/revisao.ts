import { generateUUID } from './../../util/uuid';
import { StateType } from '../../redux/state';
import { Elemento } from '../elemento';
import { Usuario } from './usuario';

export abstract class Revisao {
  id: string;
  usuario: Usuario;
  dataHora: string;
  descricao?: string;
  idRevisaoAssociada?: string;

  constructor(usuario: Usuario, dataHora: string, descricao?: string, idRevisaoAssociada?: string) {
    this.id = generateUUID();
    this.usuario = usuario;
    this.dataHora = dataHora;
    this.descricao = descricao;
    this.idRevisaoAssociada = idRevisaoAssociada;
  }
}

export class RevisaoJustificativa extends Revisao {}

export class RevisaoElemento extends Revisao {
  actionType: string;
  stateType: StateType;
  // tipo: TipoRevisao;
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
    uuidPosicaoAntesRevisao?: number,
    idRevisaoAssociada?: string
  ) {
    super(usuario, dataHora, descricao, idRevisaoAssociada);
    this.actionType = actionType;
    this.stateType = stateType;
    this.elementoAntesRevisao = elementoAntesRevisao;
    this.uuidRevisado = uuidRevisado;
    this.uuidPosicaoAntesRevisao = uuidPosicaoAntesRevisao;
  }
}
