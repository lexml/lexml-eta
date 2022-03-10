import { ElementoAction } from '../../model/lexml/acao';
import { EtaBlot } from './eta-blot';
import { informarNormaAction } from '../../model/lexml/acao/informarNormaAction';

export class EtaBlotMenuItem extends EtaBlot {
  static blotName = 'blotMenuItem';
  static tagName = 'DIV';
  static className = 'lx-eta-dropdown-content-item';

  static create(acao: ElementoAction, callback: any): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuItem.className);
    node.innerHTML = acao.descricao ?? '';
    
    node.addEventListener('mousedown', () => {
      if (acao.descricao == informarNormaAction.descricao) {
        const index = document.getSelection()?.focusOffset
        localStorage.setItem("indexCursor", JSON.stringify(index));
      }

      callback(acao.descricao);
    });
    return node;
  }

  constructor(acao: ElementoAction, callback: any) {
    super(EtaBlotMenuItem.create(acao, callback));
  }
}
