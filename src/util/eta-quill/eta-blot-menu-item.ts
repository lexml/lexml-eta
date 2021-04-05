import { ElementoAction } from '../../redux/elemento-actions';
import { EtaBlot } from './eta-blot';

export class EtaBlotMenuItem extends EtaBlot {
  static blotName = 'blotMenuItem';
  static tagName = 'DIV';
  static className = 'lx-eta-dropdown-content-item';

  static create(acao: ElementoAction, callback: any): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuItem.className);
    node.innerHTML = acao.descricao ?? '';
    node.addEventListener('click', () => {
      callback(acao.descricao);
    });
    return node;
  }

  constructor(acao: ElementoAction, callback: any) {
    super(EtaBlotMenuItem.create(acao, callback));
  }
}
