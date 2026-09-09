import { RemissaoInternaValue } from '../../model/remissao';
import { EtaContainerTable } from './eta-container-table';
import { limparAtributosRemissaoAntesDoUnwrap } from './eta-blot-remissao-util';
import PrivateQuill from '../../internal/quill/private-quill';

const Inline = PrivateQuill.import('blots/inline');

export class RemissaoInternaBlot extends Inline {
  static blotName = 'remissao-interna';
  static tagName = 'A';
  static className = 'lexml-remissao-interna';

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
      return value;
    }

    return href || undefined;
  }

  format(name: string, value: RemissaoInternaValue | string | boolean): void {
    if (name !== this.statics.blotName || !value) {
      if (name === this.statics.blotName && !value) {
        limparAtributosRemissaoAntesDoUnwrap(this.domNode as HTMLElement, ['data-lexml-ref', 'data-ref-id']);
      }
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

    const href = `#${EtaContainerTable.criarId(value.targetUuid)}`;
    domNode.setAttribute('href', href);

    if (value.targetLexmlId) {
      domNode.setAttribute('data-lexml-ref', value.targetLexmlId);
    }

    if (value.refId) {
      domNode.setAttribute('data-ref-id', value.refId);
    }
  }

  // Regex correspondente ao formato gerado por EtaContainerTable.criarId()
  private static readonly REGEX_UUID_FROM_HREF = /#lxEtaId(\d+)/;

  static extractUuidFromHref(href: string): number {
    const match = href.match(RemissaoInternaBlot.REGEX_UUID_FROM_HREF);
    return match ? parseInt(match[1], 10) : 0;
  }
}
