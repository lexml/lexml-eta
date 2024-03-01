import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotFechaAspas extends EtaBlot {
  static blotName = 'EtaBlotFechaAspas';
  static tagName = 'fecha-aspas';
  static className = 'fecha-aspas';

  get instanceBlotName(): string {
    return EtaBlotFechaAspas.blotName;
  }

  private elemento: Elemento;
  constructor(elemento: Elemento) {
    super(EtaBlotFechaAspas.create(elemento));
    this.elemento = elemento;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotFechaAspas.className);

    EtaBlotFechaAspas.__atualizarAtributos(elemento, node);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.elemento = elemento;
    EtaBlotFechaAspas.__atualizarAtributos(elemento, this.domNode);
  }

  private static __atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    if (elemento.fechaAspas) {
      node.setAttribute('exibir', '');
    } else {
      node.removeAttribute('exibir');
    }
    node.innerHTML = EtaBlotFechaAspas.montarHTML(elemento);
  }

  private static montarHTML(elemento: Elemento): string {
    return elemento.fechaAspas ? '” ' : ' ';
  }
}
