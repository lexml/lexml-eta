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
    const node: HTMLElement = super.create();
    node.innerHTML = ' ';
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRevisaoAceitar.className);
    node.setAttribute('title', 'Aceitar revisão');
    EtaBlotRevisaoAceitar.atualizarAtributos(elemento, node);
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRevisaoAceitar.create(elemento));
  }

  atualizarElemento(elemento: Elemento): void {
    EtaBlotRevisaoAceitar.atualizarAtributos(elemento, this.domNode);
  }

  static atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.setAttribute('id', 'buttonRevisaoAceitar' + elemento.uuid);
    node.onclick = (): boolean => node.dispatchEvent(new CustomEvent('aceitar-revisao', { bubbles: true, cancelable: true, detail: { elemento } }));
  }
}
