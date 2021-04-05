import { Articulacao, Dispositivo } from '../../dispositivo/dispositivo';
import { getDispositivosAlteracao, hasFilhos } from '../hierarquia/hierarquia-util';
import { TipoLexml } from './tipo-lexml';

export class TipoArtigo extends TipoLexml {
  _blocoAlteracao?: Articulacao;

  constructor() {
    super('artigo');
  }

  caput?: Dispositivo;

  get texto(): string {
    return this.caput?.texto ?? '';
  }

  set texto(texto: string) {
    this.caput!.texto = texto;
  }

  get blocoAlteracao(): Articulacao | undefined {
    return this._blocoAlteracao;
  }

  set blocoAlteracao(articulacao: Articulacao | undefined) {
    this._blocoAlteracao = articulacao;
    this._blocoAlteracao !== undefined ? (this._blocoAlteracao.isBlocoAlteracao = true) : undefined;
  }

  get dispositivosAlteracao(): Dispositivo[] {
    return getDispositivosAlteracao(this._blocoAlteracao);
  }

  hasAlteracao(): boolean {
    return this.blocoAlteracao !== undefined;
  }

  hasDispositivosAlterados(): boolean {
    return this.blocoAlteracao !== undefined && hasFilhos(this.blocoAlteracao);
  }
}
