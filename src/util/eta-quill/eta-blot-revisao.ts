import { EtaBlot } from './eta-blot';
import { Elemento } from '../../model/elemento';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotRevisao extends EtaBlot {
  static blotName = 'EtaBlotRevisao';
  static className = 'blot__revisao';

  //static tagName = 'sl-icon-button';
  static tagName = 'button';
  //static className = 'ql-bold';

  get instanceBlotName(): string {
    return EtaBlotRevisao.blotName;
  }

  static create(elemento: Elemento): any {
    //const node: SlIconButton = super.create();
    const node: HTMLElement = super.create();
    node.innerHTML = 'R';
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRevisao.className);
    node.setAttribute('id', 'buttonRevisao' + elemento.uuid);
    node.setAttribute('hidden', elemento.revisao ? 'true' : 'false');
    node.setAttribute('title', 'Teste');
    // node.setAttribute('name', 'gear')
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRevisao.create(elemento));
  }
}
