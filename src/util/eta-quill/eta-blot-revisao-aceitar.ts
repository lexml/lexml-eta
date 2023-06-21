import { EtaBlot } from './eta-blot';
import { Elemento } from '../../model/elemento';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotRevisaoAceitar extends EtaBlot {
  static blotName = 'EtaBlotRevisaoAceitar';
  static className = 'blot__revisao_aceitar';
  static tagName = 'button';

  get instanceBlotName(): string {
    return EtaBlotRevisaoAceitar.blotName;
  }

  static create(elemento: Elemento): any {
    //const node: SlIconButton = super.create();
    const node: HTMLElement = super.create();
    node.innerHTML = ' ';
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRevisaoAceitar.className);
    node.setAttribute('id', 'buttonRevisaoAceitar' + elemento.uuid);
    node.setAttribute('hidden', elemento.revisao ? 'true' : 'false');
    node.setAttribute('title', 'Aceitar revisão');
    // node.setAttribute('name', 'gear')
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRevisaoAceitar.create(elemento));
  }
}
