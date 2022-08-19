import { Elemento } from '../../model/elemento';
import { podeAdicionarAtributoDeExistencia } from '../../model/elemento/elementoUtil';
import { EtaBlot } from './eta-blot';

export class EtaBlotExistencia extends EtaBlot {
  static blotName = 'EtaBlotExistencia';
  static tagName = 'span';
  static className = 'blot-existencia';

  get instanceBlotName(): string {
    return EtaBlotExistencia.blotName;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotExistencia.create(elemento));
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.classList.add(EtaBlotExistencia.className);
    EtaBlotExistencia._atualizarAtributos(elemento, node);

    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarElemento(elemento: Elemento): void {
    this.atualizarAtributos(elemento);
  }

  public atualizarAtributos(elemento: Elemento): void {
    EtaBlotExistencia._atualizarAtributos(elemento, this.domNode);
  }

  private static _atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.innerHTML = EtaBlotExistencia.montarHTML(elemento);
    node.onclick = onclick(node, elemento);

    if (podeAdicionarAtributoDeExistencia(elemento)) {
      node.classList.add('existencia');
      node.title = elemento.existeNaNormaAlterada ? 'Dispositivo existente na norma alterada' : 'Dispositivo a ser adicionado à norma';
    } else {
      node.classList.remove('existencia');
    }
  }

  private static montarHTML(elemento: Elemento): string {
    if (podeAdicionarAtributoDeExistencia(elemento)) {
      return elemento.existeNaNormaAlterada ? 'Existente' : 'Novo';
    } else {
      return '';
    }
  }
}

const onclick = (node: HTMLElement, elemento: Elemento): (() => boolean) => {
  if (podeAdicionarAtributoDeExistencia(elemento)) {
    return (): boolean => node.dispatchEvent(new CustomEvent('toggle-existencia', { bubbles: true, cancelable: true, detail: { elemento } }));
  } else {
    return (): boolean => false;
  }
};
