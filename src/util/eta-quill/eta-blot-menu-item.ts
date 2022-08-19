import { SlMenuItem } from '@shoelace-style/shoelace';
import { ElementoAction } from '../../model/lexml/acao';
import { InformarDadosAssistenteAction } from '../../model/lexml/acao/informarDadosAssistenteAction';
import { informarNormaAction } from '../../model/lexml/acao/informarNormaAction';
import { EtaBlot } from './eta-blot';

export class EtaBlotMenuItem extends EtaBlot {
  static blotName = 'EtaBlotMenuItem';
  static tagName = 'sl-menu-item';
  static className = 'lx-eta-dropdown-content-item';

  get instanceBlotName(): string {
    return EtaBlotMenuItem.blotName;
  }

  static create(acao: ElementoAction, callback: any): any {
    const node: SlMenuItem = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotMenuItem.className);
    node.innerHTML = (acao.descricao ?? '') + (acao.hotkey ? `<span slot="suffix"> ${acao.hotkey} </span>` : '');

    node.addEventListener('mousedown', () => {
      if (acao.descricao === informarNormaAction.descricao || acao.descricao === InformarDadosAssistenteAction.descricao) {
        const index = document.getSelection()?.focusOffset;
        localStorage.setItem('indexCursor', JSON.stringify(index));
      }

      callback(acao);
    });
    return node;
  }

  constructor(acao: ElementoAction, callback: any) {
    super(EtaBlotMenuItem.create(acao, callback));
  }
}
