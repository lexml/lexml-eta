import { EtaBlot } from './eta-blot';
import { SlDropdown } from '@shoelace-style/shoelace';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

// Evitar erro no SlDropdown.removeOpenListeners quando tenta remover event listeners null
const originalRemoveOpenListeners = SlDropdown.prototype.removeOpenListeners;
if (originalRemoveOpenListeners) {
  SlDropdown.prototype.removeOpenListeners = function (this: any) {
    try {
      if (this.__documentListener !== null || document !== null) {
        return originalRemoveOpenListeners.call(this);
      }
    } catch {
      // Ignora erros
    }
  };
}

export class EtaBlotMenu extends EtaBlot {
  // Site https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_dropdown_right
  static blotName = 'EtaBlotMenu';
  static tagName = 'sl-dropdown';
  static className = 'lx-eta-dropdown';

  get instanceBlotName(): string {
    return EtaBlotMenu.blotName;
  }

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
