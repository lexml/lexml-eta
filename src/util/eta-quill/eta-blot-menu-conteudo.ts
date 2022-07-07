import { AlinhamentoMenu } from './eta-blot-menu';
import { EtaBlot } from './eta-blot';
import { SlMenu } from '@shoelace-style/shoelace';

export class EtaBlotMenuConteudo extends EtaBlot {
  static blotName = 'blotMenuConteudo';
  static tagName = 'sl-menu';
  static className = 'lx-eta-dropdown-content';

  static create(alinhamentoMenu: AlinhamentoMenu): any {
    const node: SlMenu = super.create();

    const classeAdicional = alinhamentoMenu === AlinhamentoMenu.Esquerda ? '' : ' lx-eta-dropdown-content-right';

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuConteudo.className + classeAdicional);
    return node;
  }

  constructor(alinhamentoMenu: AlinhamentoMenu) {
    super(EtaBlotMenuConteudo.create(alinhamentoMenu));
  }
}
