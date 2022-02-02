import { EtaBlot } from './eta-blot';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotMenu extends EtaBlot {
  // Site https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_dropdown_right
  static blotName = 'blotMenu';
  static tagName = 'DIV';
  static className = 'lx-eta-dropdown';

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenu.className);
    return node;
  }

  constructor() {
    super(EtaBlotMenu.create());
  }
}
