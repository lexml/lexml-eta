import { generateUUID } from './../../util/uuid';
import { StateType } from '../../redux/state';
import { Elemento } from '../elemento';
import { Usuario } from './usuario';
import { removeAtributosDoElemento, buildDescricaoRevisao } from '../../redux/elemento/util/revisaoUtil';

export abstract class Revisao {
  abstract type: string; // Necessário para identificação da classe no Java
  id: string;
  usuario: Usuario;
  dataHora: string;
  descricao?: string;

  constructor(usuario: Usuario, dataHora: string, descricao?: string) {
    this.id = generateUUID();
    this.usuario = usuario;
    this.dataHora = dataHora;
    this.descricao = descricao;
  }
}

export class RevisaoJustificativa extends Revisao {
  type = 'RevisaoJustificativa';
  constructor(usuario: Usuario, dataHora: string, descricao: string) {
    super(usuario, dataHora, descricao);
  }
}

export class RevisaoTextoLivre extends Revisao {
  type = 'RevisaoTextoLivre';
  constructor(usuario: Usuario, dataHora: string, descricao: string) {
    super(usuario, dataHora, descricao);
  }
}

export class RevisaoElemento extends Revisao {
  type = 'RevisaoElemento';
  actionType: string;
  stateType: StateType;
  elementoAntesRevisao: Partial<Elemento> | undefined;
  elementoAposRevisao: Partial<Elemento>; // No caso de exclusão de elemento, o elementoAposRevisao terá o mesmo valor que o elementoAntesRevisao
  idRevisaoElementoPai?: string;
  idRevisaoElementoPrincipal?: string;

  constructor(
    actionType: string,
    stateType: StateType,
    descricao: string,
    usuario: Usuario,
    dataHora: string,
    elementoAntesRevisao: Partial<Elemento> | undefined,
    elementoAposRevisao: Partial<Elemento>
  ) {
    super(usuario, dataHora, descricao);
    this.actionType = actionType;
    this.stateType = stateType;
    this.elementoAntesRevisao = elementoAntesRevisao;
    this.elementoAposRevisao = elementoAposRevisao;
    this.descricao = descricao || buildDescricaoRevisao(this);

    removeAtributosDoElemento(this.elementoAntesRevisao);
    removeAtributosDoElemento(this.elementoAposRevisao);
  }
}
