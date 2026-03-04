import { RemissaoInternaValue } from '../../model/remissao';
import { rootStore } from '../../redux/store';
import { redirecionarRemissaoAction } from '../../model/lexml/acao/redirecionarRemissaoAction';
import { RemissaoInternaBlot } from '../../util/eta-quill/eta-blot-remissao-interna';

const Delta = Quill.import('delta');
const Module = Quill.import('core/module');
const Parchment = Quill.import('parchment');

const cfgInline = {
  scope: Parchment.Scope.INLINE_ATTRIBUTE,
};

const DataLexmlRefAttribute = new Parchment.Attributor.Attribute('data-lexml-ref', 'data-lexml-ref', cfgInline);
const DataRefIdAttribute = new Parchment.Attributor.Attribute('data-ref-id', 'data-ref-id', cfgInline);

export const REMISSAO_INTERNA_CHANGE_EVENT = 'remissao-interna-change';
export const REMISSAO_INTERNA_REMOVE_EVENT = 'remissao-interna-remove';

const PREFIXO_ID = 'ref_';

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
      e.stopImmediatePropagation();

      const href = linkRemissao.getAttribute('href');

      if (href) {
        const uuid = RemissaoInternaBlot.extractUuidFromHref(href);
        if (uuid) {
          const elemento = { uuid };
          rootStore.dispatch(redirecionarRemissaoAction.execute(elemento));
        }
      }
    }
  }

  private estaNoRotulo(index: number): boolean {
    try {
      const [leaf] = this.quill.getLeaf(index);
      if (!leaf) return false;

      const domNode = leaf.domNode;
      if (domNode && domNode.parentElement) {
        const parent = domNode.parentElement;
        if (parent.tagName === 'LABEL' || parent.closest('label.texto__rotulo')) {
          return true;
        }
      }

      if (leaf.parent && leaf.parent.statics && leaf.parent.statics.blotName === 'EtaBlotRotulo') {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

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

  criarRemissao(value: RemissaoInternaValue, range?: { index: number; length: number }): void {
    // Usa o range fornecido ou obtém do quill
    const selectionRange = range || this.quill.getSelection();
    if (!selectionRange) return;

    // Obtém o texto selecionado antes de qualquer modificação
    const textoSelecionado = this.quill.getText(selectionRange.index, selectionRange.length);
    const textoParaInserir = textoSelecionado || value.targetRotulo || '';

    const delta = new Delta().retain(selectionRange.index).delete(selectionRange.length).insert(textoParaInserir, {
      'remissao-interna': value,
    });

    this.quill.updateContents(delta, 'user');
    this.quill.setSelection(selectionRange.index + textoParaInserir.length, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removerRemissao(value?: any): void {
    const range = this.quill.getSelection();
    if (!range) {
      this.quill.focus();
      return;
    }

    // Se há uma seleção com comprimento > 0, busca todas as remissões dentro da seleção
    if (range.length > 0) {
      const remissoesRemovidas = this.removerRemissoesNoRange(range.index, range.length);
      if (remissoesRemovidas > 0) {
        this.emitirEventoRemissaoRemove();
      } else {
        this.mostrarMensagem('Não há remissões internas na seleção.');
      }
      return;
    }

    // Cursor sem seleção - verifica se está sobre uma remissão
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

      this.mostrarMensagem('Posicione o cursor sobre uma remissão interna ou selecione um trecho com remissões.');
      return;
    }

    this.quill.format('remissao-interna', false, 'user');
    this.emitirEventoRemissaoRemove();
  }

  private removerRemissoesNoRange(index: number, length: number): number {
    const endIndex = index + length;
    const links = this.quill.root.querySelectorAll('a.lexml-remissao-interna');
    let removidas = 0;

    // Coleta todas as remissões dentro do range (de trás para frente para não afetar índices)
    const remissoesParaRemover: { index: number; length: number }[] = [];

    links.forEach((link: Element) => {
      const blot = Quill.find(link);
      if (blot) {
        const blotIndex = blot.offset(this.quill.scroll);
        const blotLength = blot.length();

        // Verifica se a remissão está dentro do range
        if (blotIndex >= index && blotIndex + blotLength <= endIndex) {
          remissoesParaRemover.push({ index: blotIndex, length: blotLength });
        }
      }
    });

    remissoesParaRemover.sort((a, b) => b.index - a.index);

    for (const remissao of remissoesParaRemover) {
      this.quill.formatText(remissao.index, remissao.length, 'remissao-interna', false, 'user');
      removidas++;
    }

    return removidas;
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

  renderizarRemissoesDoState(remissoesDoState: Record<number, RemissaoInternaValue[]>, uuidDispositivoAtual: number): void {
    const remissoesDoDispositivo = remissoesDoState[uuidDispositivoAtual] || [];

    if (remissoesDoDispositivo.length === 0) {
      return;
    }

    for (const remissao of remissoesDoDispositivo) {
      const linkExistente = this.quill.root.querySelector(`a.lexml-remissao-interna[data-ref-id="${remissao.refId}"]`);
      if (linkExistente) {
        continue;
      }

      const texto = this.quill.getText();
      const textoRef = remissao.textoRef;

      if (!textoRef) {
        continue;
      }

      let index = texto.indexOf(textoRef);
      while (index !== -1) {
        try {
          const format = this.quill.getFormat(index, textoRef.length);
          if (format['remissao-interna']) {
            index = texto.indexOf(textoRef, index + textoRef.length);
            continue;
          }
        } catch {
          //empty
        }

        if (this.estaNoRotulo(index)) {
          index = texto.indexOf(textoRef, index + textoRef.length);
          continue;
        }

        this.quill.formatText(index, textoRef.length, 'remissao-interna', remissao, 'silent');
        index = texto.indexOf(textoRef, index + textoRef.length);
      }
    }

    this.emitirEventoRemissaoChange();
  }
}

Quill.register('modules/remissaoInterna', ModuloRemissao, true);

export { ModuloRemissao };
