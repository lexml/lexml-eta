import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotTipoOmissis extends EtaBlot {
  static blotName = 'tipo-omissis';
  static tagName = 'span';
  static className = 'blot-tipo-omissis';

  constructor(elemento: Elemento) {
    super(EtaBlotTipoOmissis.create(elemento));
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.classList.add(EtaBlotTipoOmissis.className);
    EtaBlotTipoOmissis._atualizarAtributos(elemento, node);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarElemento(elemento: Elemento): void {
    this.atualizarAtributos(elemento);
  }

  public atualizarAtributos(elemento: Elemento): void {
    EtaBlotTipoOmissis._atualizarAtributos(elemento, this.domNode);
  }

  private static _atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.innerHTML = EtaBlotTipoOmissis.getDescricaoTipoOmissis(elemento);
    if (elemento.tipo === 'Omissis') {
      node.classList.add('tipo-omissis');
    } else {
      node.classList.remove('tipo-omissis');
    }
  }

  private static getDescricaoTipoOmissis(elemento: Elemento): string {
    switch (elemento.tipoOmissis) {
      case 'inciso-caput':
      case 'inciso-paragrafo':
        return ' Incisos omitidos ';
      case 'paragrafo':
        return ' Parágrafos omitidos ';
      case 'alinea':
        return ' Alíneas omitidas ';
      case 'item':
        return ' Itens omitidos ';
      default:
        return '';
    }
  }
}
