import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotAbreAspas extends EtaBlot {
  static blotName = 'EtaBlotAbreAspas';
  static tagName = 'span';
  static className = 'abre-aspas';

  private elemento: Elemento;
  constructor(elemento: Elemento) {
    super(EtaBlotAbreAspas.create(elemento));
    this.elemento = elemento;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotAbreAspas.className);

    node.innerHTML = EtaBlotAbreAspas.montarHTML(elemento);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.elemento = elemento;
    this.domNode.innerHTML = EtaBlotAbreAspas.montarHTML(elemento);
  }

  private static montarHTML(elemento: Elemento): string {
    return elemento.abreAspas ? '“' : '';
  }
}
