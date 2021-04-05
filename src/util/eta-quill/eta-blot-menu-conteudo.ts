import { EtaBlot } from './eta-blot';

export class EtaBlotMenuConteudo extends EtaBlot {
  static blotName = 'blotMenuConteudo';
  static tagName = 'DIV';
  static className = 'lx-eta-dropdown-content';

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuConteudo.className);
    return node;
  }

  constructor() {
    super(EtaBlotMenuConteudo.create());
  }
}
