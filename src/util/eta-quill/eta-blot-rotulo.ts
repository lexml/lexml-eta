import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotRotulo extends EtaBlot {
  static blotName = 'rotulo';
  static tagName = 'LABEL';

  static formatoStyle = 'STYLE';

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRotulo.getClasseCSS(elemento));
    node.setAttribute('data-rotulo', (elemento.abreAspas ? '\u201C' : '') + elemento.rotulo);
    node.innerHTML = '';
    node.onclick = (): boolean => node.dispatchEvent(new CustomEvent('rotulo', { bubbles: true, cancelable: true, detail: { elemento } }));
    return node;
  }

  get rotulo(): string {
    return this.domNode.getAttribute('data-rotulo');
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRotulo.create(elemento));
  }

  format(name: string, value: any, abreAspas?: boolean): void {
    if (name === EtaBlotRotulo.blotName) {
      this.domNode.setAttribute('data-rotulo', (abreAspas ? '\u201C' : '') + value);
    } else if (name === EtaBlotRotulo.formatoStyle) {
      this.domNode.setAttribute('style', EtaBlotRotulo.criarAtributoStyle(value));
    } else {
      super.format(name, value);
    }
  }

  private static criarAtributoStyle(elemento: Elemento): string {
    let style = elemento.tipo === 'Articulacao' ? 'color: #373634; font-weight: 600; line-height: 0.42;' : 'color: #373634; font-weight: 600; line-height: 1.42;';

    if (elemento.agrupador) {
      style = `${style} display: block; font-size: 1rem; text-align: center;`;
    } else {
      style = `${style} float: left; margin-right: 10px;`;
    }
    return style;
  }

  public static getClasseCSS(elemento: Elemento): string {
    return 'texto__rotulo' + (elemento.agrupador ? ' texto__rotulo--agrupador' : ' texto__rotulo--padrao');
  }
}
