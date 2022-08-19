import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotNotaAlteracao extends EtaBlot {
  static blotName = 'EtaBlotNotaAlteracao';
  static tagName = 'span';
  static className = 'nota-alteracao';

  constructor(elemento: Elemento) {
    super(EtaBlotNotaAlteracao.create(elemento));
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotNotaAlteracao.className);
    EtaBlotNotaAlteracao._atualizarAtributos(elemento, node);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    EtaBlotNotaAlteracao._atualizarAtributos(elemento, this.domNode);
  }

  private static _atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.innerHTML = EtaBlotNotaAlteracao.montarHTML(elemento);
    node.onclick = onclick(node, elemento);

    if (elemento.notaAlteracao) {
      node.setAttribute('nota-alteracao', elemento.notaAlteracao || '');
    } else {
      node.removeAttribute('nota-alteracao');
    }

    if (elemento.podeEditarNotaAlteracao) {
      node.classList.add('nota-alteracao-editavel');
    } else {
      node.classList.remove('nota-alteracao-editavel');
    }
  }

  private static montarHTML(elemento: Elemento): string {
    return elemento.notaAlteracao ? '(' + elemento.notaAlteracao + ')' : ' ';
    // if (!elemento.notaAlteracao) {
    //   return '';
    // } else {
    //   if (elemento.podeEditarNotaAlteracao) {
    //     return '” <span class="nota-alteracao-editavel">(' + elemento.notaAlteracao + ')</span>';
    //   } else {
    //     return '” (' + elemento.notaAlteracao + ')';
    //   }
    // }
  }
}

const onclick = (node: HTMLElement, elemento: Elemento): (() => boolean) => {
  if (elemento.podeEditarNotaAlteracao) {
    return (): boolean => node.dispatchEvent(new CustomEvent('nota-alteracao', { bubbles: true, cancelable: true, detail: { elemento } }));
  } else {
    return (): boolean => false;
  }
};
