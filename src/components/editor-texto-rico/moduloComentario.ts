import Quill from '../../internal/quill/private-quill';
import { COMENTARIO_ID_ATTRIBUTE, COMENTARIO_TAG, possuiMarcacaoComentario, removeMarcacaoComentario, removeMarcacaoComentarioDoContainer } from './texto-rico-util';

const Module = Quill.import('core/module');
const Inline = Quill.import('blots/inline');
const Delta = Quill.import('delta');

export const COMENTARIO_FORMAT = 'comentario';

export interface IntervaloTexto {
  index: number;
  length: number;
}

export class ComentarioBlot extends Inline {
  static create(value: string): HTMLElement {
    const node = super.create(value) as HTMLElement;
    if (value) {
      node.setAttribute(COMENTARIO_ID_ATTRIBUTE, value);
    }
    return node;
  }

  static formats(domNode: HTMLElement): string | null {
    return domNode.getAttribute(COMENTARIO_ID_ATTRIBUTE);
  }

  format(name: string, value: string): void {
    if (name === COMENTARIO_FORMAT) {
      value ? this.domNode.setAttribute(COMENTARIO_ID_ATTRIBUTE, value) : this.domNode.removeAttribute(COMENTARIO_ID_ATTRIBUTE);
      return;
    }
    super.format(name, value);
  }
}

ComentarioBlot.blotName = COMENTARIO_FORMAT;
ComentarioBlot.tagName = COMENTARIO_TAG;

// Um mesmo id pode ocupar vários elementos (trecho dividido por parágrafo ou revisão): as consultas tratam o conjunto.
export class ModuloComentario extends Module {
  quill: any;

  static register(): void {
    Quill.register(ComentarioBlot, true);
  }

  constructor(quill: any, options: any) {
    super(quill, options);
    this.quill = quill;
    this.quill.comentarios = this;
    this.quill.root.addEventListener('copy', this.onCopy, true);
    this.quill.root.addEventListener('paste', this.onPaste, true);
  }

  private onCopy = (event: ClipboardEvent): void => {
    if (event.defaultPrevented || !event.clipboardData || !this.quill.isEnabled()) {
      return;
    }

    const range = this.quill.getSelection();
    if (!range?.length || !this.rangePossuiComentario(range)) {
      return;
    }

    const nativeRange = this.quill.selection?.getNativeRange()?.native as Range | undefined;
    if (!nativeRange || nativeRange.collapsed) {
      return;
    }

    const container = document.createElement('div');
    container.appendChild(nativeRange.cloneContents());

    event.preventDefault();
    event.clipboardData.setData('text/plain', this.quill.getText(range.index, range.length));
    event.clipboardData.setData('text/html', removeMarcacaoComentarioDoContainer(container));
  };

  private onPaste = (event: ClipboardEvent): void => {
    if (event.defaultPrevented || !this.quill.isEnabled()) {
      return;
    }

    const html = event.clipboardData?.getData('text/html') || '';
    if (!possuiMarcacaoComentario(html)) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const range = this.quill.getSelection(true);
    if (!range) {
      return;
    }

    const htmlSemComentarios = removeMarcacaoComentario(html);
    const texto = event.clipboardData?.getData('text/plain') || '';
    const conteudoColado = htmlSemComentarios ? this.quill.clipboard.convert(htmlSemComentarios) : new Delta().insert(texto);
    const delta = new Delta().retain(range.index).delete(range.length).concat(conteudoColado);

    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(range.index + conteudoColado.length(), 0, Quill.sources.SILENT);
  };

  adicionar(idSequenciaComentario: string, range: IntervaloTexto | null = this.quill.getSelection()): boolean {
    if (!idSequenciaComentario || !range?.length || this.rangePossuiComentario(range)) {
      return false;
    }

    this.quill.formatText(range.index, range.length, COMENTARIO_FORMAT, idSequenciaComentario, Quill.sources.USER);
    this.quill.setSelection(range.index, 0, Quill.sources.SILENT);
    return true;
  }

  remover(idSequenciaComentario: string): boolean {
    if (!idSequenciaComentario) {
      return false;
    }

    const ranges = this.getRangesComentario(new Set([idSequenciaComentario]));
    ranges.forEach(range => this.quill.formatText(range.index, range.length, COMENTARIO_FORMAT, false, Quill.sources.USER));
    return ranges.length > 0;
  }

  // Silencioso: não entra no histórico nem dispara a verificação das sequências.
  removerPorIds(idsSequenciasComentario: string[] = []): boolean {
    const ids = new Set(idsSequenciasComentario.filter(Boolean));
    if (!ids.size) {
      return false;
    }

    const ranges = this.getRangesComentario(ids);
    ranges.forEach(range => this.quill.formatText(range.index, range.length, COMENTARIO_FORMAT, false, Quill.sources.SILENT));
    return ranges.length > 0;
  }

  existe(idSequenciaComentario: string): boolean {
    if (!idSequenciaComentario) {
      return false;
    }

    return this.quill.getContents().ops.some((op: any) => op.attributes?.[COMENTARIO_FORMAT] === idSequenciaComentario);
  }

  getIds(): string[] {
    const ids = this.quill
      .getContents()
      .ops.map((op: any) => op.attributes?.[COMENTARIO_FORMAT])
      .filter(Boolean);
    return [...new Set<string>(ids)];
  }

  getIndice(idSequenciaComentario: string): number | undefined {
    if (!idSequenciaComentario) {
      return undefined;
    }

    return this.getRangesComentario(new Set([idSequenciaComentario]))[0]?.index;
  }

  getRanges(idSequenciaComentario: string): IntervaloTexto[] {
    return idSequenciaComentario ? this.getRangesComentario(new Set([idSequenciaComentario])) : [];
  }

  rangePossuiComentario(range: IntervaloTexto | null): boolean {
    if (!range?.length) {
      return false;
    }

    return this.quill.getContents(range.index, range.length).ops.some((op: any) => op.attributes?.[COMENTARIO_FORMAT]);
  }

  findNodesById(idSequenciaComentario: string): HTMLElement[] {
    return [...this.quill.root.querySelectorAll(`${COMENTARIO_TAG}[${COMENTARIO_ID_ATTRIBUTE}="${idSequenciaComentario}"]`)] as HTMLElement[];
  }

  getTextoComentario(idSequenciaComentario: string): string {
    return this.quill.getContents().ops.reduce((texto: string, op: any) => {
      if (typeof op.insert !== 'string' || op.attributes?.[COMENTARIO_FORMAT] !== idSequenciaComentario) {
        return texto;
      }
      return texto + op.insert;
    }, '');
  }

  // Intervalos contíguos do mesmo conjunto de ids são unidos.
  private getRangesComentario(ids: Set<string>): IntervaloTexto[] {
    const ranges: IntervaloTexto[] = [];
    let index = 0;

    this.quill.getContents().ops.forEach((op: any) => {
      const length = typeof op.insert === 'string' ? op.insert.length : 1;
      const id = op.attributes?.[COMENTARIO_FORMAT];
      if (id && ids.has(id)) {
        const anterior = ranges[ranges.length - 1];
        if (anterior && anterior.index + anterior.length === index) {
          anterior.length += length;
        } else {
          ranges.push({ index, length });
        }
      }
      index += length;
    });

    return ranges;
  }
}
