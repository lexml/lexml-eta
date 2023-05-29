import { generateUUID } from './../../util/uuid';
import { StateType } from '../../redux/state';
import { Elemento } from '../elemento';
import { Usuario } from './usuario';
import { LocalizadorElemento } from '../elemento/elemento';

export abstract class Revisao {
  id: string;
  usuario: Usuario;
  dataHora: string;
  descricao?: string;
  idsRevisoesAssociadas: string[];
  idRevisaoElementoPai?: string;
  idRevisaoElementoPrincipal?: string;
  mensagem?: string;

  constructor(usuario: Usuario, dataHora: string, descricao?: string, idsRevisoesAssociadas: string[] = [], mensagem?: string) {
    this.id = generateUUID();
    this.usuario = usuario;
    this.dataHora = dataHora;
    this.descricao = descricao;
    this.idsRevisoesAssociadas = [...idsRevisoesAssociadas];
    this.mensagem = mensagem;
  }
}

export class RevisaoJustificativa extends Revisao {}

export class RevisaoElemento extends Revisao {
  actionType: string;
  stateType: StateType;
  // tipo: TipoRevisao;
  elementoAntesRevisao: Partial<Elemento> | undefined;
  localizadorElementoRevisado: LocalizadorElemento;
  localizadorElementoPosicaoAntesRevisao?: LocalizadorElemento;
  // uuidRevisado: number;
  // uuidPosicaoAntesRevisao?: number;

  constructor(
    actionType: string,
    stateType: StateType,
    descricao: string,
    usuario: Usuario,
    dataHora: string,
    elementoAntesRevisao: Partial<Elemento> | undefined,
    // uuidRevisado: number,
    // uuidPosicaoAntesRevisao?: number,
    mensagem: string,
    localizadorElementoRevisado: LocalizadorElemento,
    localizadorElementoPosicaoAntesRevisao?: LocalizadorElemento,
    idsRevisoesAssociadas: string[] = []
  ) {
    super(usuario, dataHora, descricao, idsRevisoesAssociadas, mensagem);
    this.actionType = actionType;
    this.stateType = stateType;
    this.elementoAntesRevisao = elementoAntesRevisao;
    // this.uuidRevisado = uuidRevisado;
    // this.uuidPosicaoAntesRevisao = uuidPosicaoAntesRevisao;
    this.localizadorElementoRevisado = { ...localizadorElementoRevisado };
    if (localizadorElementoPosicaoAntesRevisao) {
      this.localizadorElementoPosicaoAntesRevisao = { ...localizadorElementoPosicaoAntesRevisao };
    }
  }
}
