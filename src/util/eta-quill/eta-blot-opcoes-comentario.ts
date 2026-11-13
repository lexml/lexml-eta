import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotOpcoesComentario extends EtaBlot {
  static blotName = 'EtaBlotOpcoesComentario';
  static className = 'blot__opcoes_comentario';
  static tagName = 'button';

  get instanceBlotName(): string {
    return EtaBlotOpcoesComentario.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    node.innerHTML = ' ';
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotOpcoesComentario.className);
    node.setAttribute('type', 'button');
    node.setAttribute('title', 'Exibir comentário');
    node.setAttribute('aria-label', 'Exibir comentário');
    EtaBlotOpcoesComentario.atualizarAtributos(elemento, node);
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotOpcoesComentario.create(elemento));
  }

  atualizarElemento(elemento: Elemento): void {
    EtaBlotOpcoesComentario.atualizarAtributos(elemento, this.domNode);
  }

  static atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.setAttribute('id', 'buttonExibirComentario' + elemento.uuid);
    node.setAttribute('data-id-dispositivo', elemento.lexmlId || '');
    node.setAttribute('data-uuid2-dispositivo', elemento.uuid2 || '');
    node.onclick = (): boolean => node.dispatchEvent(new CustomEvent('exibir-comentario-dispositivo', { bubbles: true, cancelable: true, detail: { elemento } }));
  }
}
