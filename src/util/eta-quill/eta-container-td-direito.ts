import { AlinhamentoMenu } from './eta-blot-menu';
import { EtaContainer } from './eta-container';

export class EtaContainerTdDireito extends EtaContainer {
  static blotName = 'EtaContainerTdDireito';
  static tagName = 'DIV';
  static className = 'container__menu';

  alinhamentoMenu: AlinhamentoMenu;

  get instanceBlotName(): string {
    return EtaContainerTdDireito.blotName;
  }

  static create(): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaContainerTdDireito.className);
    return node;
  }

  [key: string]: any;

  constructor(alinhamentoMenu: AlinhamentoMenu) {
    super(EtaContainerTdDireito.create());
    this.alinhamentoMenu = alinhamentoMenu;
  }
}
