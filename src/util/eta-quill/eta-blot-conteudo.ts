import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotConteudo extends EtaBlot {
  static blotName = 'texto';
  static tagName = 'P';
  static className = 'texto__dispositivo';

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    const conteudo: string = (elemento.conteudo?.texto ?? '').trim();

    node.setAttribute('contenteditable', elemento?.editavel ? 'true' : 'false');
    node.innerHTML = conteudo !== '' ? conteudo : '<br>';
    return node;
  }

  private _htmlAnt: string;
  set htmlAnt(htmlAnt: string) {
    this._htmlAnt = htmlAnt;
  }

  get htmlAnt(): string {
    return this._htmlAnt;
  }

  get alterado(): boolean {
    return this._htmlAnt !== this.html;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotConteudo.create(elemento));
    this._htmlAnt = '';
  }
}
