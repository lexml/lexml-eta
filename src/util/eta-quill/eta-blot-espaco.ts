import { EtaBlot } from './eta-blot';

export class EtaBlotEspaco extends EtaBlot {
  static blotName = 'espaco';
  static tagName = 'ESPACO';
  static className = 'espaco';

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('style', 'font-size: 1em;');
    node.innerHTML = '&nbsp;';
    return node;
  }

  constructor() {
    super(EtaBlotEspaco.create());
  }
}
