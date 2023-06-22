import { EtaBlot } from './eta-blot';
import { Elemento } from '../../model/elemento';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotRevisaoRecusar extends EtaBlot {
  static blotName = 'EtaBlotRevisaoRecusar';
  static className = 'blot__revisao_recusar';

  //static tagName = 'sl-icon-button';
  static tagName = 'button';
  //static className = 'ql-bold';

  get instanceBlotName(): string {
    return EtaBlotRevisaoRecusar.blotName;
  }

  static create(elemento: Elemento): any {
    //const node: SlIconButton = super.create();
    const node: HTMLElement = super.create();
    node.innerHTML = ' ';
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRevisaoRecusar.className);
    node.setAttribute('id', 'buttonRevisaoRecusar' + elemento.uuid);
    node.setAttribute('hidden', elemento.revisao ? 'true' : 'false');
    node.setAttribute('title', 'Recusar revisão');
    // node.setAttribute('name', 'gear')
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRevisaoRecusar.create(elemento));
  }
}
