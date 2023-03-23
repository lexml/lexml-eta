import { EtaBlot } from './eta-blot';

export class EtaBlotQuebraLinha extends EtaBlot {
  static blotName = 'EtaBlotQuebraLinha';
  static tagName = 'BR';
  // static className = 'espaco';

  get instanceBlotName(): string {
    return EtaBlotQuebraLinha.blotName;
  }

  static create(): any {
    const node: HTMLElement = super.create();

    //node.setAttribute('contenteditable', 'false');
    //node.innerHTML = '&nbsp;';
    return node;
  }

  constructor() {
    super(EtaBlotQuebraLinha.create());
  }
}
