import { AlinhamentoMenu } from './eta-blot-menu';

const Container = Quill.import('blots/container');

export class EtaContainerTdDireito extends Container {
  static blotName = 'containerTdDireito';
  static tagName = 'DIV';
  static className = 'container-td-direito';

  alinhamentoMenu: AlinhamentoMenu;

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaContainerTdDireito.className);
    node.setAttribute('style', 'width: 30px; vertical-align: top; text-align: center');
    return node;
  }

  [key: string]: any;

  constructor(alinhamentoMenu: AlinhamentoMenu) {
    super(EtaContainerTdDireito.create());
    this.alinhamentoMenu = alinhamentoMenu;
  }
}
