const Container = Quill.import('blots/container');

export class EtaContainerTdEsquerdo extends Container {
  static blotName = 'containerTdEsquerdo';
  static tagName = 'TD';
  static className = 'container-td-esquerdo';

  static create(editavel: boolean): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTdEsquerdo.className);
    node.setAttribute('sytle', 'text-align: left !important;');
    return node;
  }

  [key: string]: any;

  constructor(editavel: boolean) {
    super(EtaContainerTdEsquerdo.create(editavel));
  }
}
