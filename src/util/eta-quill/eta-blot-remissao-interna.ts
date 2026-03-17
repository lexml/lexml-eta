import { RemissaoInternaValue } from '../../model/remissao';

const Inline = Quill.import('blots/inline');

export class RemissaoInternaBlot extends Inline {
  static blotName = 'remissao-interna';
  static tagName = 'A';

  static create(value: RemissaoInternaValue | string): HTMLElement {
    const node = super.create(value) as HTMLElement;

    if (typeof value === 'string') {
      node.setAttribute('href', value);
    } else {
      RemissaoInternaBlot.valueToAttributes(value, node);
    }

    node.setAttribute('class', 'lexml-remissao-interna');
    node.setAttribute('target', '_self');
    return node;
  }

  static formats(domNode: HTMLElement): RemissaoInternaValue | string | undefined {
    const dataLexmlRef = domNode.getAttribute('data-lexml-ref');
    const dataRefId = domNode.getAttribute('data-ref-id');
    const href = domNode.getAttribute('href');

    if (dataLexmlRef && dataRefId) {
      const value: RemissaoInternaValue = {
        refId: dataRefId,
        targetLexmlId: dataLexmlRef,
        targetUuid: this.extractUuidFromHref(href || ''),
        targetRotulo: domNode.textContent || undefined,
      };
      if (domNode.getAttribute('data-texto-fixo') === 'true') {
        value.textoFixo = true;
      }
      return value;
    }

    return href || undefined;
  }

  format(name: string, value: RemissaoInternaValue | string | boolean): void {
    if (name !== this.statics.blotName || !value) {
      return super.format(name, value);
    }

    if (typeof value === 'string') {
      this.domNode.setAttribute('href', value);
    } else if (typeof value === 'object') {
      RemissaoInternaBlot.valueToAttributes(value, this.domNode as HTMLElement);
    }
  }

  static valueToAttributes(value: RemissaoInternaValue, domNode: HTMLElement): void {
    if (!value) return;

    const href = `#lxEtaId${value.targetUuid}`;
    domNode.setAttribute('href', href);

    if (value.targetLexmlId) {
      domNode.setAttribute('data-lexml-ref', value.targetLexmlId);
    }

    if (value.refId) {
      domNode.setAttribute('data-ref-id', value.refId);
    }

    if (value.textoFixo) {
      domNode.setAttribute('data-texto-fixo', 'true');
    } else {
      domNode.removeAttribute('data-texto-fixo');
    }
  }

  static extractUuidFromHref(href: string): number {
    const match = href.match(/#lxEtaId(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
