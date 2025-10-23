import { EtaBlot } from './eta-blot';
import { Elemento } from '../../model/elemento';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotRevisaoRecusar extends EtaBlot {
  static blotName = 'EtaBlotRevisaoRecusar';
  static className = 'blot__revisao_recusar';
  static tagName = 'button';

  get instanceBlotName(): string {
    return EtaBlotRevisaoRecusar.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    node.innerHTML = ' ';
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRevisaoRecusar.className);
    node.setAttribute('title', 'Recusar revisão');
    node.setAttribute('type', 'button');
    EtaBlotRevisaoRecusar.atualizarAtributos(elemento, node);
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRevisaoRecusar.create(elemento));
  }

  atualizarElemento(elemento: Elemento): void {
    EtaBlotRevisaoRecusar.atualizarAtributos(elemento, this.domNode);
  }

  static atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.setAttribute('id', 'buttonRevisaoRecusar' + elemento.uuid);
    node.onclick = (): boolean => node.dispatchEvent(new CustomEvent('rejeitar-revisao', { bubbles: true, cancelable: true, detail: { elemento } }));
  }
}
