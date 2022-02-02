import { Elemento } from '../../model/elemento';

const Container = Quill.import('blots/container');

export class EtaContainerTdEsquerdo extends Container {
  static blotName = 'containerTdEsquerdo';
  static tagName = 'DIV';
  static className = 'container-td-esquerdo';

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    const padding: number = (elemento.agrupador ? 0 : elemento.nivel) * 20 + 5;
    const textAlign = elemento.agrupador ? 'center' : 'left';

    node.setAttribute('contenteditable', elemento.editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTdEsquerdo.className);
    node.setAttribute('style', `text-align: ${textAlign} !important; padding-left: ${padding}px;`);

    return node;
  }

  [key: string]: any;

  constructor(elemento: Elemento) {
    super(EtaContainerTdEsquerdo.create(elemento));
  }
}
