const Container = Quill.import('blots/container');

export class EtaContainerTdDireito extends Container {
  static blotName = 'containerTdDireito';
  static tagName = 'TD';
  static className = 'container-td-direito';

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaContainerTdDireito.className);
    node.setAttribute('style', 'width: 30px; vertical-align: top; text-align: center');
    return node;
  }

  [key: string]: any;

  constructor() {
    super(EtaContainerTdDireito.create());
  }
}
