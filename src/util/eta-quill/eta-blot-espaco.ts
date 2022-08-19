import { EtaBlot } from './eta-blot';

export class EtaBlotEspaco extends EtaBlot {
  static blotName = 'EtaBlotEspaco';
  static tagName = 'ESPACO';
  static className = 'espaco';

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.innerHTML = '&nbsp;';
    return node;
  }

  constructor() {
    super(EtaBlotEspaco.create());
  }
}
