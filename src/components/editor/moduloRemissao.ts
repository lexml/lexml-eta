import { RemissaoExternaValue, RemissaoInternaValue } from '../../model/remissao';
import { atualizarTextoRemissao as atualizarTextoRemissaoUtil } from '../../model/remissao/lexmlIdUtil';
import { gerarRefId } from '../../model/remissao/refId';
import { RemissaoInternaBlot } from '../../util/eta-quill/eta-blot-remissao-interna';

const Delta = Quill.import('delta');
const Module = Quill.import('core/module');
const Parchment = Quill.import('parchment');

const cfgInline = {
  scope: Parchment.Scope.INLINE_ATTRIBUTE,
};

const DataLexmlRefAttribute = new Parchment.Attributor.Attribute('data-lexml-ref', 'data-lexml-ref', cfgInline);
const DataRefIdAttribute = new Parchment.Attributor.Attribute('data-ref-id', 'data-ref-id', cfgInline);

export const REMISSAO_INTERNA_REMOVE_EVENT = 'remover-remissao-interna';

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
    }

    this.addClipboardMatcher();
  }

  addClipboardMatcher(): void {
    this.quill.clipboard.addMatcher('A.lexml-remissao-externa', (node: HTMLElement, delta: any) => {
      const dataRefId = node.getAttribute('data-ref-id');
      const dataUrn = node.getAttribute('data-urn');

      if (!dataRefId || !dataUrn) return delta;

      const refId = this.isAbrindoTexto ? dataRefId : gerarRefId();
      const value: RemissaoExternaValue = {
        refId,
        targetUrn: dataUrn,
        targetNomeNorma: node.getAttribute('data-nome-norma') ?? '',
        targetTextoDispositivo: node.getAttribute('data-texto-dispositivo') ?? undefined,
        targetFragmento: node.getAttribute('data-fragmento') ?? undefined,
        textoRef: node.textContent ?? undefined,
      };

      const ops = delta.ops.map((op: any) => {
        if (op.insert && typeof op.insert === 'string') {
          return { ...op, attributes: { ...op.attributes, 'remissao-externa': value } };
        }
        return op;
      });

      return new Delta(ops);
    });

    // Detecta links simples com URN LexML no href (formato legado de documentos existentes).
    // Esses links não têm class nem data-* — são convertidos para o formato de remissão externa.
    this.quill.clipboard.addMatcher('A[href^="urn:lex:"]', (node: HTMLElement, delta: any) => {
      if (node.classList.contains('lexml-remissao-externa')) return delta;

      const href = node.getAttribute('href') ?? '';
      const sepIdx = href.indexOf('!');
      const urn = sepIdx >= 0 ? href.substring(0, sepIdx) : href;
      const fragmento = sepIdx >= 0 ? href.substring(sepIdx + 1) : undefined;

      if (!urn) return delta;

      const value: RemissaoExternaValue = {
        refId: gerarRefId(),
        targetUrn: urn,
        targetNomeNorma: '',
        targetFragmento: fragmento || undefined,
        textoRef: node.textContent ?? undefined,
      };

      const ops = delta.ops.map((op: any) => {
        if (op.insert && typeof op.insert === 'string') {
          return { ...op, attributes: { ...op.attributes, 'remissao-externa': value } };
        }
        return op;
      });

      return new Delta(ops);
    });

    this.quill.clipboard.addMatcher('A.lexml-remissao-interna', (node: HTMLElement, delta: any) => {
      const dataLexmlRef = node.getAttribute('data-lexml-ref');
      const dataRefId = node.getAttribute('data-ref-id');
      const href = node.getAttribute('href');

      const refId = this.isAbrindoTexto ? dataRefId : gerarRefId();
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
  }

  getRemissaoNoCursor(): { value: RemissaoInternaValue; linkEl: HTMLElement } | null {
    const range = this.quill.getSelection();
    if (!range) return null;

    const format = this.quill.getFormat(range);
    const value = format['remissao-interna'] as RemissaoInternaValue;

    if (value?.refId) {
      const linkEl = this.quill.root.querySelector(`a.lexml-remissao-interna[data-ref-id="${CSS.escape(value.refId)}"]`) as HTMLElement;
      return linkEl ? { value, linkEl } : null;
    }

    // Fallback: cursor na borda do blot — getFormat pode não retornar o formato
    const [leaf] = this.quill.getLeaf(range.index);
    if (leaf?.parent?.statics?.blotName === 'remissao-interna') {
      const blotValue = leaf.parent.formats()?.['remissao-interna'] as RemissaoInternaValue;
      if (blotValue?.refId) {
        const linkEl = leaf.parent.domNode as HTMLElement;
        return { value: blotValue, linkEl };
      }
    }

    return null;
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
    const links = this.quill.root.querySelectorAll(`a.lexml-remissao-interna[data-ref-id="${CSS.escape(refId)}"]`);

    if (links.length === 0) return null;

    const link = links[0] as HTMLElement;
    const blot = Quill.find(link);

    if (!blot) return null;

    const index = blot.offset(this.quill.scroll);
    return { blot, index };
  }

  adicionarRemissao(refId: string, newValue: RemissaoInternaValue): boolean {
    const result = this.findBlotByRefId(refId);
    if (!result) return false;

    const { blot } = result;
    blot.format('remissao-interna', newValue);
    return true;
  }

  criarRemissaoExterna(value: RemissaoExternaValue, range?: { index: number; length: number }): void {
    const selectionRange = range || this.quill.getSelection();
    if (!selectionRange || selectionRange.length === 0) return;

    const textoSelecionado = this.quill.getText(selectionRange.index, selectionRange.length);
    const delta = new Delta().retain(selectionRange.index).delete(selectionRange.length).insert(textoSelecionado, {
      'remissao-externa': value,
    });

    this.quill.updateContents(delta, 'user');
    this.quill.setSelection(selectionRange.index + textoSelecionado.length, 0);
  }

  getRemissaoExternaEmCursor(): { value: RemissaoExternaValue; linkEl: HTMLElement } | null {
    const range = this.quill.getSelection();
    if (!range) return null;

    const format = this.quill.getFormat(range);
    const value = format['remissao-externa'] as RemissaoExternaValue;

    if (value?.refId) {
      const linkEl = this.quill.root.querySelector(`a.lexml-remissao-externa[data-ref-id="${CSS.escape(value.refId)}"]`) as HTMLElement;
      return linkEl ? { value, linkEl } : null;
    }

    const [leaf] = this.quill.getLeaf(range.index);
    if (leaf?.parent?.statics?.blotName === 'remissao-externa') {
      const blotValue = leaf.parent.formats()?.['remissao-externa'] as RemissaoExternaValue;
      if (blotValue?.refId) {
        return { value: blotValue, linkEl: leaf.parent.domNode as HTMLElement };
      }
    }

    return null;
  }

  findBlotExternoByRefId(refId: string): { blot: any; index: number } | null {
    const links = this.quill.root.querySelectorAll(`a.lexml-remissao-externa[data-ref-id="${CSS.escape(refId)}"]`);
    if (links.length === 0) return null;

    const link = links[0] as HTMLElement;
    const blot = Quill.find(link);
    if (!blot) return null;

    return { blot, index: blot.offset(this.quill.scroll) };
  }

  adicionarRemissaoExterna(refId: string, newValue: RemissaoExternaValue): boolean {
    const result = this.findBlotExternoByRefId(refId);
    if (!result) return false;

    result.blot.format('remissao-externa', newValue);
    return true;
  }

  removerRemissaoExternaPorId(refId: string): boolean {
    const result = this.findBlotExternoByRefId(refId);
    if (!result) return false;

    const { blot, index } = result;
    this.quill.formatText(index, blot.length(), 'remissao-externa', false, 'user');
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
    const links = this.quill.root.querySelectorAll(`a.lexml-remissao-interna[data-lexml-ref="${CSS.escape(lexmlIdAntigo)}"]`);

    // Coleta refIds e textos antes de qualquer modificação DOM para evitar referências obsoletas
    const candidatos: { refId: string; textoAtual: string }[] = [];
    links.forEach((link: Element) => {
      const el = link as HTMLElement;
      const dataRefId = el.getAttribute('data-ref-id');
      const href = el.getAttribute('href') || '';
      const currentUuid = RemissaoInternaBlot.extractUuidFromHref(href);

      // Match de UUID evita que eventos antigos ou defasados sobrescrevam a remissão.
      if (dataRefId && currentUuid === novoUuid) {
        candidatos.push({
          refId: dataRefId,
          textoAtual: el.textContent || '',
        });
      }
    });

    let count = 0;
    for (const { refId, textoAtual } of candidatos) {
      const novoTexto = this.atualizarTextoRemissao(textoAtual, lexmlIdAntigo, lexmlIdNovo);
      const newValue: RemissaoInternaValue = {
        refId,
        targetLexmlId: lexmlIdNovo,
        targetUuid: novoUuid,
        targetRotulo: novoTexto || undefined,
      };

      // Usa sempre setTimeout + updateContents para garantir que o delta interno do Quill
      // seja atualizado — blot.format() direto não atualiza o delta e o MutationObserver
      // pode reverter a mudança de atributo antes que o Cypress verifique o DOM.
      const refIdCaptura = refId;
      const textoCaptura = novoTexto;
      const newValueCaptura = newValue;
      setTimeout(() => {
        const result = this.findBlotByRefId(refIdCaptura);
        if (result) {
          const length = result.blot.length();
          const delta = new Delta().retain(result.index).delete(length).insert(textoCaptura, { 'remissao-interna': newValueCaptura });
          this.quill.updateContents(delta, 'silent');
        }
      }, 0);

      count++;
    }

    return count;
  }

  marcarRemissoesComoInvalidas(lexmlId: string): number {
    const links = this.quill.root.querySelectorAll(`a.lexml-remissao-interna[data-lexml-ref="${CSS.escape(lexmlId)}"]`);
    let count = 0;

    links.forEach((link: Element) => {
      const el = link as HTMLElement;
      const dataRefId = el.getAttribute('data-ref-id');

      if (dataRefId) {
        this.marcarComoInvalida(dataRefId);
        count++;
      }
    });

    return count;
  }

  restaurarRemissoesPorLexmlId(lexmlId: string): number {
    const links = this.quill.root.querySelectorAll(`a.lexml-remissao-interna[data-lexml-ref="${CSS.escape(lexmlId)}"]`);
    let count = 0;

    links.forEach((link: Element) => {
      const el = link as HTMLElement;
      const dataRefId = el.getAttribute('data-ref-id');

      if (dataRefId) {
        this.restaurarRemissao(dataRefId);
        count++;
      }
    });

    return count;
  }

  private atualizarTextoRemissao(textoAtual: string, lexmlIdAntigo: string, lexmlIdNovo: string): string {
    return atualizarTextoRemissaoUtil(textoAtual, lexmlIdAntigo, lexmlIdNovo);
  }

  //chamado em remissaoModule.renderizarRemissoesDoState
  renderizarRemissoesExternasDoState(remissoesExternas: Record<string, RemissaoExternaValue>): void {
    if (!remissoesExternas || Object.keys(remissoesExternas).length === 0) return;

    const savedSelection = this.quill.getSelection();

    for (const value of Object.values(remissoesExternas)) {
      const { sourceUuid, textoRef, refId } = value;
      if (!sourceUuid || !textoRef || !refId) continue;

      // Verifica se o link já está registrado como blot Quill correto
      const linkExistente = this.quill.root.querySelector(`a.lexml-remissao-externa[data-ref-id="${CSS.escape(refId)}"]`);
      if (linkExistente) {
        const blot = Quill.find(linkExistente);
        if (blot?.statics?.blotName === 'remissao-externa') continue;
      }

      const domEl = this.quill.root.querySelector(`#texto__dispositivo${sourceUuid}`);
      if (!domEl) continue;

      const blot = Quill.find(domEl);
      if (!blot) continue;

      const blotStart = blot.offset(this.quill.scroll);
      const blotLength = blot.length();

      const texto = this.quill.getText(blotStart, blotLength);
      const textOffset = texto.indexOf(textoRef);
      if (textOffset === -1) continue;

      const absoluteIndex = blotStart + textOffset;
      this.quill.formatText(absoluteIndex, textoRef.length, 'remissao-externa', value, 'silent');
    }

    if (savedSelection) {
      const sel = savedSelection;
      setTimeout(() => {
        this.quill.setSelection(sel.index, sel.length, 'silent');
      }, 0);
    }
  }

  renderizarRemissoesDoState(remissoesDoState: Record<number, RemissaoInternaValue[]>, uuidDispositivoAtual: number): void {
    const remissoesDoDispositivo = remissoesDoState[uuidDispositivoAtual] || [];

    if (remissoesDoDispositivo.length === 0) {
      return;
    }

    // Preserva a posição do cursor: formatText provoca mutação no DOM (envolve o texto
    // em um blot <a>), e o browser reposiciona o caret para o início do trecho modificado.
    const savedSelection = this.quill.getSelection();

    // Localiza o blot de conteúdo do dispositivo pelo id do DOM para escopar a busca.
    // Isso evita que textoRef seja encontrado em outros dispositivos do editor.
    let blotStart = -1;
    let blotLength = -1;
    const domEl = this.quill.root.querySelector(`#texto__dispositivo${uuidDispositivoAtual}`);
    if (domEl) {
      const blot = Quill.find(domEl);
      if (blot) {
        blotStart = blot.offset(this.quill.scroll);
        blotLength = blot.length();
      }
    }

    for (const remissao of remissoesDoDispositivo) {
      const linkExistente = this.quill.root.querySelector(`a.lexml-remissao-interna[data-ref-id="${CSS.escape(remissao.refId!)}"]`);
      if (linkExistente) {
        const blot = Quill.find(linkExistente);
        if (blot?.statics?.blotName === 'remissao-interna') {
          continue;
        }
      }

      const textoRef = remissao.textoRef;

      if (!textoRef) {
        continue;
      }

      // Usa blot para evitar regex no texto global, para evitar erro de remissao aleatória
      const texto = blotStart >= 0 ? this.quill.getText(blotStart, blotLength) : this.quill.getText();
      const indexOffset = blotStart >= 0 ? blotStart : 0;

      // Se a posição de início está disponível, aplica apenas naquela ocorrência específica.
      // Caso contrário, percorre todas as ocorrências (compatibilidade com remissões manuais).
      const indicesParaFormatar: number[] =
        remissao.inicio !== undefined
          ? [remissao.inicio]
          : (() => {
              const indices: number[] = [];
              let i = texto.indexOf(textoRef);
              while (i !== -1) {
                indices.push(i);
                i = texto.indexOf(textoRef, i + textoRef.length);
              }
              return indices;
            })();

      for (const index of indicesParaFormatar) {
        const absoluteIndex = indexOffset + index;
        try {
          const format = this.quill.getFormat(absoluteIndex, textoRef.length);
          if (format['remissao-interna']) {
            continue;
          }
        } catch {
          //empty
        }

        if (this.estaNoRotulo(absoluteIndex)) {
          continue;
        }

        this.quill.formatText(absoluteIndex, textoRef.length, 'remissao-interna', remissao, 'silent');
      }
    }

    // Restaura o cursor após as microtasks do MutationObserver do Quill processarem as
    // mutações DOM causadas pelo formatText — sem o setTimeout o MutationObserver sobrescreve
    // o setSelection síncrono e reposiciona o caret para o início do blot criado.
    if (savedSelection) {
      const sel = savedSelection;
      setTimeout(() => {
        this.quill.setSelection(sel.index, sel.length, 'silent');
      }, 0);
    }
  }
}

export { ModuloRemissao };
