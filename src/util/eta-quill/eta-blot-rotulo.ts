import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotRotulo extends EtaBlot {
  static blotName = 'rotulo';
  static tagName = 'LABEL';

  static formatoStyle = 'STYLE';

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('style', EtaBlotRotulo.criarAtributoStyle(elemento));
    node.setAttribute('data-rotulo', elemento.rotulo);
    node.innerHTML = '';
    return node;
  }

  get rotulo(): string {
    return this.domNode.getAttribute('data-rotulo');
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRotulo.create(elemento));
  }

  format(name: string, value: any): void {
    if (name === EtaBlotRotulo.blotName) {
      this.domNode.setAttribute('data-rotulo', value);
    } else if (name === EtaBlotRotulo.formatoStyle) {
      this.domNode.setAttribute('style', EtaBlotRotulo.criarAtributoStyle(value));
    } else {
      super.format(name, value);
    }
  }

  private static criarAtributoStyle(elemento: Elemento): string {
    let style = elemento.tipo === 'Articulacao' ? 'color: #4a4a4a; line-height: 0.42;' : 'color: #4a4a4a; line-height: 1.42;';

    if (elemento.agrupador) {
      style = `${style} display: block; font-size: 1rem; text-align: center;`;
    } else {
      style = `${style} float: left; margin-right: 10px;`;
    }
    return style;
  }
}
