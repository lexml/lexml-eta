import { Elemento } from '../../model/elemento';

const Inline = Quill.import('blots/inline');

export class EtaBlotAbreAspas extends Inline {
  static blotName = 'abre-aspas';
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
