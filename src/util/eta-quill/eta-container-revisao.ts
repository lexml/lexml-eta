import { Elemento } from '../../model/elemento';

const Container = Quill.import('blots/container');

export class EtaContainerRevisao extends Container {
  static blotName = 'EtaContainerRevisao';
  static tagName = 'DIV';
  static className = 'container__revisao';

  get instanceBlotName(): string {
    return EtaContainerRevisao.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaContainerRevisao.className);
    node.setAttribute('id', EtaContainerRevisao.className + elemento.uuid);
    return node;
  }

  [key: string]: any;

  constructor(elemento: Elemento) {
    super(EtaContainerRevisao.create(elemento));
  }
}
