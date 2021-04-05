const Container = Quill.import('blots/container');

export class EtaContainerTr extends Container {
  static blotName = 'containerTr';
  static tagName = 'TR';
  static className = 'container-tr';

  static create(editavel: boolean): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTr.className);
    return node;
  }

  [key: string]: any;

  constructor(editavel: boolean) {
    super(EtaContainerTr.create(editavel));
  }
}
