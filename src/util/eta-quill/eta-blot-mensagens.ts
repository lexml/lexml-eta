import { EtaBlot } from './eta-blot';

export class EtaBlotMensagens extends EtaBlot {
  static blotName = 'mensagens';
  static tagName = 'MENSAGENS';

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('style', 'font-size: 0.8em;');
    return node;
  }

  constructor() {
    super(EtaBlotMensagens.create());
  }
}
