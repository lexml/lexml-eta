const Container = Quill.import('blots/container');

export class EtaContainerRevisao extends Container {
  static blotName = 'EtaContainerRevisao';
  static tagName = 'DIV';
  static className = 'container__revisao';

  get instanceBlotName(): string {
    return EtaContainerRevisao.blotName;
  }

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaContainerRevisao.className);
    return node;
  }

  [key: string]: any;

  constructor() {
    super(EtaContainerRevisao.create());
  }
}
