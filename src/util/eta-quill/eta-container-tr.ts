import { AlinhamentoMenu } from './eta-blot-menu';
import { EtaContainer } from './eta-container';

export class EtaContainerTr extends EtaContainer {
  static blotName = 'EtaContainerTr';
  static tagName = 'DIV';
  static className = 'container__linha';

  get instanceBlotName(): string {
    return EtaContainerTr.blotName;
  }

  static create(editavel: boolean, alinhamentoMenu: AlinhamentoMenu): any {
    const node: HTMLElement = super.create();

    const classeAdicional = alinhamentoMenu === AlinhamentoMenu.Esquerda ? ' container__linha--reverse' : '';

    // node.setAttribute('contenteditable', editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTr.className + classeAdicional);
    return node;
  }

  [key: string]: any;

  constructor(editavel: boolean, alinhamentoMenu: AlinhamentoMenu) {
    super(EtaContainerTr.create(editavel, alinhamentoMenu));
  }
}
