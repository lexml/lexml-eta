import { ElementoAction } from '../../model/lexml/acao';
import { EtaBlot } from './eta-blot';
import { informarNormaAction } from '../../model/lexml/acao/informarNormaAction';
import { SlMenuItem } from '@shoelace-style/shoelace';

export class EtaBlotMenuItem extends EtaBlot {
  static blotName = 'blotMenuItem';
  static tagName = 'sl-menu-item';
  static className = 'lx-eta-dropdown-content-item';

  static create(acao: ElementoAction, callback: any): any {
    const node: SlMenuItem = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuItem.className);
    node.innerHTML = acao.descricao ?? '';

    node.addEventListener('mousedown', () => {
      if (acao.descricao === informarNormaAction.descricao) {
        const index = document.getSelection()?.focusOffset;
        localStorage.setItem('indexCursor', JSON.stringify(index));
      }

      callback(acao.descricao);
    });
    return node;
  }

  constructor(acao: ElementoAction, callback: any) {
    super(EtaBlotMenuItem.create(acao, callback));
  }
}
