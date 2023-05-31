import { generateUUID } from './../../util/uuid';
import { StateType } from '../../redux/state';
import { Elemento } from '../elemento';
import { Usuario } from './usuario';
import { LocalizadorElemento } from '../elemento/elemento';
import { buildDescricaoRevisao } from '../../redux/elemento/util/revisaoUtil';

export abstract class Revisao {
  id: string;
  usuario: Usuario;
  dataHora: string;
  descricao?: string;
  idsRevisoesAssociadas: string[];
  idRevisaoElementoPai?: string;
  idRevisaoElementoPrincipal?: string;

  constructor(usuario: Usuario, dataHora: string, descricao?: string, idsRevisoesAssociadas: string[] = []) {
    this.id = generateUUID();
    this.usuario = usuario;
    this.dataHora = dataHora;
    this.descricao = descricao;
    this.idsRevisoesAssociadas = [...idsRevisoesAssociadas];
  }
}

export class RevisaoJustificativa extends Revisao {}

export class RevisaoElemento extends Revisao {
  actionType: string;
  stateType: StateType;
  elementoAntesRevisao: Partial<Elemento> | undefined;
  elementoAposRevisao: Partial<Elemento>; // No caso de exclusão de elemento, o elementoAposRevisao terá o mesmo valor que o elementoAntesRevisao
  localizadorElementoPosicaoAntesRevisao?: LocalizadorElemento; // Localizador do elemento anterior ao elementoAntesRevisao

  constructor(
    actionType: string,
    stateType: StateType,
    descricao: string,
    usuario: Usuario,
    dataHora: string,
    elementoAntesRevisao: Partial<Elemento> | undefined,
    elementoAposRevisao: Partial<Elemento>,
    localizadorElementoPosicaoAntesRevisao?: LocalizadorElemento,
    idsRevisoesAssociadas: string[] = []
  ) {
    super(usuario, dataHora, descricao, idsRevisoesAssociadas);
    this.actionType = actionType;
    this.stateType = stateType;
    this.elementoAntesRevisao = elementoAntesRevisao;
    this.elementoAposRevisao = elementoAposRevisao;
    if (localizadorElementoPosicaoAntesRevisao) {
      this.localizadorElementoPosicaoAntesRevisao = { ...localizadorElementoPosicaoAntesRevisao };
    }
    this.descricao = descricao || buildDescricaoRevisao(this);
  }
}
