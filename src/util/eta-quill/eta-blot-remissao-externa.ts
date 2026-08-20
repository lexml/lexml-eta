import { RemissaoExternaValue } from '../../model/remissao';
import { limparAtributosRemissaoAntesDoUnwrap } from './eta-blot-remissao-util';

const Inline = Quill.import('blots/inline');

export class RemissaoExternaBlot extends Inline {
  static blotName = 'remissao-externa';
  static tagName = 'A';
  static className = 'lexml-remissao-externa';

  static create(value: RemissaoExternaValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('class', 'lexml-remissao-externa');
    node.setAttribute('href', '#');
    node.setAttribute('target', '_self');
    RemissaoExternaBlot.valueToAttributes(value, node);
    return node;
  }

  static formats(domNode: HTMLElement): RemissaoExternaValue | undefined {
    const dataRefId = domNode.getAttribute('data-ref-id');
    const dataUrn = domNode.getAttribute('data-urn');

    if (!dataRefId || !dataUrn) return undefined;

    return {
      refId: dataRefId,
      targetUrn: dataUrn,
      targetNomeNorma: domNode.getAttribute('data-nome-norma') ?? '',
      targetTextoDispositivo: domNode.getAttribute('data-texto-dispositivo') ?? undefined,
      targetFragmento: domNode.getAttribute('data-fragmento') ?? undefined,
      textoRef: domNode.textContent ?? undefined,
    };
  }

  format(name: string, value: RemissaoExternaValue | boolean): void {
    if (name !== this.statics.blotName || !value) {
      if (name === this.statics.blotName && !value) {
        limparAtributosRemissaoAntesDoUnwrap(this.domNode as HTMLElement, ['data-ref-id', 'data-urn', 'data-nome-norma', 'data-texto-dispositivo', 'data-fragmento']);
      }
      return super.format(name, value);
    }
    if (typeof value === 'object') {
      RemissaoExternaBlot.valueToAttributes(value, this.domNode as HTMLElement);
    }
  }

  static valueToAttributes(value: RemissaoExternaValue, domNode: HTMLElement): void {
    if (!value) return;
    domNode.setAttribute('data-ref-id', value.refId);
    domNode.setAttribute('data-urn', value.targetUrn);
    if (value.targetNomeNorma) domNode.setAttribute('data-nome-norma', value.targetNomeNorma);
    if (value.targetTextoDispositivo) domNode.setAttribute('data-texto-dispositivo', value.targetTextoDispositivo);
    if (value.targetFragmento) domNode.setAttribute('data-fragmento', value.targetFragmento);
  }
}
