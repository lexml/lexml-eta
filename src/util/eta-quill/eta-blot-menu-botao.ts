import { EtaBlot } from './eta-blot';
import { SlButton } from '@shoelace-style/shoelace';

export class EtaBlotMenuBotao extends EtaBlot {
  static blotName = 'EtaBlotMenuBotao';
  static tagName = 'sl-button';
  static className = 'lx-eta-dropbtn';

  get instanceBlotName(): string {
    return EtaBlotMenuBotao.blotName;
  }

  static create(): any {
    const node: SlButton = super.create();

    node.setAttribute('variant', 'text');
    node.setAttribute('size', 'small');
    node.setAttribute('slot', 'trigger');
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuBotao.className);
    node.innerHTML = '&vellip;';
    return node;
  }

  constructor() {
    super(EtaBlotMenuBotao.create());
  }
}
