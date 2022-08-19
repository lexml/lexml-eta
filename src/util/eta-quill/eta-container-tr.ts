import { AlinhamentoMenu } from './eta-blot-menu';
const Container = Quill.import('blots/container');

export class EtaContainerTr extends Container {
  static blotName = 'EtaContainerTr';
  static tagName = 'DIV';
  static className = 'container__linha';

  static create(editavel: boolean, alinhamentoMenu: AlinhamentoMenu): any {
    const node: HTMLElement = super.create();

    const classeAdicional = alinhamentoMenu === AlinhamentoMenu.Esquerda ? ' container__linha--reverse' : '';

    node.setAttribute('contenteditable', editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTr.className + classeAdicional);
    return node;
  }

  [key: string]: any;

  constructor(editavel: boolean, alinhamentoMenu: AlinhamentoMenu) {
    super(EtaContainerTr.create(editavel, alinhamentoMenu));
  }
}
