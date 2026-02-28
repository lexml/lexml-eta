import { RemissaoInternaValue } from '../../model/remissao';

const Delta = Quill.import('delta');
const Module = Quill.import('core/module');
const Inline = Quill.import('blots/inline');
const Parchment = Quill.import('parchment');

const cfgInline = {
  scope: Parchment.Scope.INLINE_ATTRIBUTE,
};

const DataLexmlRefAttribute = new Parchment.Attributor.Attribute('data-lexml-ref', 'data-lexml-ref', cfgInline);
const DataRefIdAttribute = new Parchment.Attributor.Attribute('data-ref-id', 'data-ref-id', cfgInline);

export const REMISSAO_INTERNA_CHANGE_EVENT = 'remissao-interna-change';
export const REMISSAO_INTERNA_REMOVE_EVENT = 'remissao-interna-remove';
export const REMISSAO_INTERNA_CLICK_EVENT = 'remissao-interna-click';

const PREFIXO_ID = 'ref_';

class RemissaoInternaBlot extends Inline {
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
      return {
        refId: dataRefId,
        targetLexmlId: dataLexmlRef,
        targetUuid: this.extractUuidFromHref(href || ''),
        targetRotulo: domNode.textContent || undefined,
      };
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
  }

  static extractUuidFromHref(href: string): number {
    const match = href.match(/#lxEtaId(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

RemissaoInternaBlot.blotName = 'remissao-interna';
RemissaoInternaBlot.tagName = 'A';

class ModuloRemissao extends Module {
  quill: any;
  options: any;

  _isAbrindoTexto = false;

  get isAbrindoTexto(): boolean {
    return this._isAbrindoTexto;
  }

  set isAbrindoTexto(value: boolean) {
    this._isAbrindoTexto = value;
  }

  static register(): void {
    Quill.register(RemissaoInternaBlot, true);
    Quill.register(DataLexmlRefAttribute, true);
    Quill.register(DataRefIdAttribute, true);
  }

  constructor(quill: any, options: any) {
    super(quill, options);
    this.quill = quill;
    this.options = options;

    this.quill.remissaoInterna = this;

    const toolbar = this.quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('remissao-interna', this.abrirDialogoRemissao.bind(this));
      toolbar.addHandler('remover-remissao', this.removerRemissao.bind(this));
    }

    this.addClipboardMatcher();

    this.quill.root.addEventListener('click', this.onClick.bind(this));
    this.quill.on('text-change', this.onTextChange.bind(this));
  }

  addClipboardMatcher(): void {
    this.quill.clipboard.addMatcher('A.lexml-remissao-interna', (node: HTMLElement, delta: any) => {
      const dataLexmlRef = node.getAttribute('data-lexml-ref');
      const dataRefId = node.getAttribute('data-ref-id');
      const href = node.getAttribute('href');

      const refId = this.isAbrindoTexto ? dataRefId : this.gerarId();
      const targetLexmlId = dataLexmlRef;
      const targetUuid = RemissaoInternaBlot.extractUuidFromHref(href || '');

      if (targetLexmlId && refId) {
        const value: RemissaoInternaValue = {
          refId,
          targetLexmlId,
          targetUuid,
          targetRotulo: node.textContent || undefined,
        };

        const ops = delta.ops.map((op: any) => {
          if (op.insert && typeof op.insert === 'string') {
            return {
              ...op,
              attributes: {
                ...op.attributes,
                'remissao-interna': value,
              },
            };
          }
          return op;
        });

        return new Delta(ops);
      }

      return delta;
    });

    this.quill.clipboard.addMatcher('A', (node: HTMLElement, delta: any) => {
      const dataLexmlRef = node.getAttribute('data-lexml-ref');

      if (!dataLexmlRef) {
        return delta;
      }

      if (node.classList.contains('lexml-remissao-interna')) {
        return delta;
      }

      return delta;
    });
  }

  onClick(e: MouseEvent): void {
    const el = e.target as HTMLElement;
    const linkRemissao = el.closest('a.lexml-remissao-interna') as HTMLElement;

    if (linkRemissao) {
      e.preventDefault();
      e.stopPropagation();

      const href = linkRemissao.getAttribute('href');
      const dataLexmlRef = linkRemissao.getAttribute('data-lexml-ref');
      const dataRefId = linkRemissao.getAttribute('data-ref-id');

      if (href) {
        const event = new CustomEvent(REMISSAO_INTERNA_CLICK_EVENT, {
          bubbles: true,
          composed: true,
          detail: {
            href,
            lexmlRef: dataLexmlRef,
            refId: dataRefId,
            elemento: linkRemissao,
          },
        });
        this.quill.root.dispatchEvent(event);

        this.navegarParaDispositivo(href);
      }
    }
  }

  navegarParaDispositivo(href: string): void {
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      targetElement.classList.add('lexml-remissao-destaque');
      setTimeout(() => {
        targetElement.classList.remove('lexml-remissao-destaque');
      }, 2000);
    }
  }

  onTextChange(delta: any, oldContent: any, source: string): void {
    if (source === 'silent') return;

    if (this.hasRemissao(delta)) {
      this.emitirEventoRemissaoChange();
    }
  }

  hasRemissao(delta: any): boolean {
    return delta?.ops?.some((op: any) => {
      if (op.insert?.['remissao-interna']) return true;
      return !!op.attributes?.['remissao-interna'];
    });
  }

  /**
   * Emite evento de mudança de remissão
   */
  emitirEventoRemissaoChange(): void {
    const event = new CustomEvent(REMISSAO_INTERNA_CHANGE_EVENT, {
      bubbles: true,
      composed: true,
      detail: {
        remissoes: this.getRemissoes(),
      },
    });
    this.quill.root.dispatchEvent(event);
  }

  emitirEventoRemissaoRemove(): void {
    const event = new CustomEvent(REMISSAO_INTERNA_REMOVE_EVENT, {
      bubbles: true,
      composed: true,
      detail: {
        remissoes: this.getRemissoes(),
      },
    });
    this.quill.root.dispatchEvent(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  abrirDialogoRemissao(value?: any): void {
    const range = this.quill.getSelection();
    if (!range) {
      this.quill.focus();
      return;
    }

    // Por enquanto, emite um evento para que o componente pai abra o diálogo
    // A implementação completa será na Etapa 4
    const event = new CustomEvent('abrir-dialogo-remissao', {
      bubbles: true,
      composed: true,
      detail: {
        range,
        textoSelecionado: this.quill.getText(range.index, range.length),
      },
    });
    this.quill.root.dispatchEvent(event);
  }

  criarRemissao(value: RemissaoInternaValue): void {
    const range = this.quill.getSelection();
    if (!range) return;

    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert(this.quill.getText(range.index, range.length) || value.targetRotulo || '', {
        'remissao-interna': value,
      });

    this.quill.updateContents(delta, 'user');
    this.quill.setSelection(range.index + (value.targetRotulo?.length || range.length), 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removerRemissao(value?: any): void {
    const range = this.quill.getSelection();
    if (!range) {
      this.quill.focus();
      return;
    }

    const format = this.quill.getFormat(range);

    if (!format['remissao-interna']) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [leaf, offset] = this.quill.getLeaf(range.index);
      if (leaf?.parent?.statics?.blotName === 'remissao-interna') {
        const blotIndex = this.quill.getIndex(leaf.parent);
        const blotLength = leaf.parent.length();
        this.quill.formatText(blotIndex, blotLength, 'remissao-interna', false, 'user');
        this.emitirEventoRemissaoRemove();
        return;
      }

      this.mostrarMensagem('Selecione um link de remissão interna para remover.');
      return;
    }

    this.quill.format('remissao-interna', false, 'user');
    this.emitirEventoRemissaoRemove();
  }

  private mostrarMensagem(mensagem: string): void {
    const event = new CustomEvent('mensagem-remissao', {
      bubbles: true,
      composed: true,
      detail: { mensagem },
    });
    this.quill.root.dispatchEvent(event);
  }

  gerarId(): string {
    return PREFIXO_ID + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getRemissoes(): RemissaoInternaValue[] {
    const remissoes: RemissaoInternaValue[] = [];
    const links = this.quill.root.querySelectorAll('a.lexml-remissao-interna');

    links.forEach((link: Element) => {
      const el = link as HTMLElement;
      const dataLexmlRef = el.getAttribute('data-lexml-ref');
      const dataRefId = el.getAttribute('data-ref-id');
      const href = el.getAttribute('href');

      if (dataLexmlRef && dataRefId) {
        remissoes.push({
          refId: dataRefId,
          targetLexmlId: dataLexmlRef,
          targetUuid: RemissaoInternaBlot.extractUuidFromHref(href || ''),
          targetRotulo: el.textContent || undefined,
        });
      }
    });

    return remissoes;
  }

  findBlotByRefId(refId: string): { blot: any; index: number } | null {
    const links = this.quill.root.querySelectorAll(`a.lexml-remissao-interna[data-ref-id="${refId}"]`);

    if (links.length === 0) return null;

    const link = links[0] as HTMLElement;
    const blot = Quill.find(link);

    if (!blot) return null;

    const index = blot.offset(this.quill.scroll);
    return { blot, index };
  }

  atualizarRemissao(refId: string, newValue: RemissaoInternaValue): boolean {
    const result = this.findBlotByRefId(refId);
    if (!result) return false;

    const { blot } = result;
    blot.format('remissao-interna', newValue);
    return true;
  }

  removerRemissaoPorId(refId: string): boolean {
    const result = this.findBlotByRefId(refId);
    if (!result) return false;

    const { blot, index } = result;
    const length = blot.length();

    this.quill.formatText(index, length, 'remissao-interna', false, 'user');
    this.emitirEventoRemissaoRemove();
    return true;
  }

  marcarComoInvalida(refId: string): boolean {
    const result = this.findBlotByRefId(refId);
    if (!result) return false;

    const { blot } = result;
    blot.domNode.classList.add('lexml-remissao-invalida');
    return true;
  }

  restaurarRemissao(refId: string): boolean {
    const result = this.findBlotByRefId(refId);
    if (!result) return false;

    const { blot } = result;
    blot.domNode.classList.remove('lexml-remissao-invalida');
    return true;
  }

  atualizarReferencias(lexmlIdAntigo: string, lexmlIdNovo: string, novoUuid: number): number {
    const links = this.quill.root.querySelectorAll(`a.lexml-remissao-interna[data-lexml-ref="${lexmlIdAntigo}"]`);
    let count = 0;

    links.forEach((link: Element) => {
      const el = link as HTMLElement;
      const dataRefId = el.getAttribute('data-ref-id');

      if (dataRefId) {
        const newValue: RemissaoInternaValue = {
          refId: dataRefId,
          targetLexmlId: lexmlIdNovo,
          targetUuid: novoUuid,
          targetRotulo: el.textContent || undefined,
        };

        this.atualizarRemissao(dataRefId, newValue);
        count++;
      }
    });

    return count;
  }
}

Quill.register('modules/remissaoInterna', ModuloRemissao, true);

export { ModuloRemissao, RemissaoInternaBlot };
