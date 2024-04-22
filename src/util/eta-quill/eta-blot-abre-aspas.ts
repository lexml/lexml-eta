import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotAbreAspas extends EtaBlot {
  static blotName = 'EtaBlotAbreAspas';
  static tagName = 'abre-aspas';
  static className = 'abre-aspas';

  private elemento: Elemento;
  constructor(elemento: Elemento) {
    super(EtaBlotAbreAspas.create(elemento));
    this.elemento = elemento;
  }

  get instanceBlotName(): string {
    return EtaBlotAbreAspas.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotAbreAspas.className);

    EtaBlotAbreAspas.__atualizarAtributos(elemento, node);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.elemento = elemento;
    EtaBlotAbreAspas.__atualizarAtributos(elemento, this.domNode);
  }

  private static __atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    if (elemento.abreAspas) {
      node.setAttribute('exibir', '');
    } else {
      node.removeAttribute('exibir');
    }
    node.innerHTML = EtaBlotAbreAspas.montarHTML(elemento);
  }

  private static montarHTML(elemento: Elemento): string {
    return elemento.abreAspas ? '“' : '';
  }
}
