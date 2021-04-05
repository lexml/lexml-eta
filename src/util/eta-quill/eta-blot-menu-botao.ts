import { EtaBlot } from './eta-blot';

export class EtaBlotMenuBotao extends EtaBlot {
  static blotName = 'blotMenuBotao';
  static tagName = 'DIV';
  static className = 'lx-eta-dropbtn';

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuBotao.className);
    node.innerHTML = '&vellip;';
    return node;
  }

  constructor() {
    super(EtaBlotMenuBotao.create());
  }
}
