import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotFechaAspas extends EtaBlot {
  static blotName = 'fecha-aspas';
  static tagName = 'span';
  static className = 'fecha-aspas';

  private elemento: Elemento;
  constructor(elemento: Elemento) {
    super(EtaBlotFechaAspas.create(elemento));
    this.elemento = elemento;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotFechaAspas.className);

    node.innerHTML = EtaBlotFechaAspas.montarHTML(elemento);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.elemento = elemento;
    this.domNode.innerHTML = EtaBlotFechaAspas.montarHTML(elemento);
  }

  private static montarHTML(elemento: Elemento): string {
    return elemento.fechaAspas ? '” ' : ' ';
  }
}
