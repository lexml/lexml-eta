import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotTituloDispositivo extends EtaBlot {
  static blotName = 'EtaBlotTituloDispositivo';
  static tagName = 'titulo-dispositivo';
  static className = 'titulo-dispositivo';

  private elemento: Elemento;
  constructor(elemento: Elemento) {
    super(EtaBlotTituloDispositivo.create(elemento));
    this.elemento = elemento;
  }

  get instanceBlotName(): string {
    return EtaBlotTituloDispositivo.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    node.setAttribute('contenteditable', 'false');
    EtaBlotTituloDispositivo.__atualizarAtributos(elemento, node);
    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.elemento = elemento;
    EtaBlotTituloDispositivo.__atualizarAtributos(elemento, this.domNode);
  }

  private static __atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.innerHTML = EtaBlotTituloDispositivo.montarHTML(elemento);
  }

  private static montarHTML(elemento: Elemento): string {
    return elemento.tituloDispositivo ?? '';
  }
}
