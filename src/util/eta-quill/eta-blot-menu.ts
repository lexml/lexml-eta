import { EtaBlot } from './eta-blot';
import { SlDropdown } from '@shoelace-style/shoelace';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotMenu extends EtaBlot {
  // Site https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_dropdown_right
  static blotName = 'blotMenu';
  static tagName = 'sl-dropdown';
  static className = 'lx-eta-dropdown';

  static create(): any {
    const node: SlDropdown = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenu.className);
    return node;
  }

  constructor() {
    super(EtaBlotMenu.create());
  }
}
