import { EtaBlot } from './eta-blot';
import { Elemento } from '../../model/elemento';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotOpcoesDiff extends EtaBlot {
  static blotName = 'EtaBlotOpcoesDiff';
  static className = 'blot__opcoes_diff';
  static tagName = 'button';

  get instanceBlotName(): string {
    return EtaBlotOpcoesDiff.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    node.innerHTML = ' ';
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotOpcoesDiff.className);
    node.setAttribute('title', 'Exibir Diferenças');
    EtaBlotOpcoesDiff.atualizarAtributos(elemento, node);
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotOpcoesDiff.create(elemento));
  }

  atualizarElemento(elemento: Elemento): void {
    EtaBlotOpcoesDiff.atualizarAtributos(elemento, this.domNode);
  }

  static atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.setAttribute('id', 'buttonExibirDiferencas' + elemento.uuid);
    node.onclick = (): boolean => node.dispatchEvent(new CustomEvent('exibir-diferencas', { bubbles: true, cancelable: true, detail: { elemento } }));
  }
}
