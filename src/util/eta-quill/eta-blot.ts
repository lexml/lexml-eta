import { EtaContainerTable } from './eta-container-table';

const Block = Quill.import('blots/block');

export class EtaBlot extends Block {
  [key: string]: any;

  get linha(): EtaContainerTable {
    return this.parent.parent.parent;
  }

  get tamanho(): number {
    return this.length() - 1;
  }

  get tagName(): string {
    return this.domNode.tagName;
  }

  get html(): string {
    return this.domNode.innerHTML !== '<br>' ? this.domNode.innerHTML.replace('&nbsp;', '') : '';
  }

  set html(html: string) {
    this.domNode.innerHTML = html;
  }

  constructor(domNode: HTMLElement) {
    super(domNode);
  }
}
