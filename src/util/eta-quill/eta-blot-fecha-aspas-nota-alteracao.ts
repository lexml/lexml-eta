import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotFechaAspasENotaAlteracao extends EtaBlot {
  static blotName = 'nota';
  static tagName = 'span';
  static className = 'nota-alteracao';

  constructor(elemento: Elemento) {
    super(EtaBlotFechaAspasENotaAlteracao.create(elemento));
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotFechaAspasENotaAlteracao.className);
    EtaBlotFechaAspasENotaAlteracao._atualizarAtributos(elemento, node);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    EtaBlotFechaAspasENotaAlteracao._atualizarAtributos(elemento, this.domNode);
  }

  private static _atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.innerHTML = EtaBlotFechaAspasENotaAlteracao.montarHTML(elemento);

    if (elemento.notaAlteracao) {
      node.setAttribute('nota-alteracao', elemento.notaAlteracao || '');
    } else {
      node.removeAttribute('nota-alteracao');
    }
  }

  private static montarHTML(elemento: Elemento): string {
    if (!elemento.notaAlteracao) {
      return '';
    } else {
      return '” (' + elemento.notaAlteracao + ')';
    }
  }
}
