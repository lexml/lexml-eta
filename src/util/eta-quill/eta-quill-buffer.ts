import PrivateQuill from '../../internal/quill/private-quill';
import { QuillDelta, QuillDeltaOperation, QuillOptions, QuillSource } from '../../internal/quill/quill-types';

export class EtaQuillBuffer extends PrivateQuill {
  constructor(editorHtml: HTMLElement, op: QuillOptions) {
    super(editorHtml, op);
  }

  getConteudoHtml(html: string, offset: number, tamanho: number): string {
    const blotBuffer: any = this.scroll.children.head;

    this.setConteudo(this.converterHtmlParaDelta(html), PrivateQuill.sources.SILENT);
    this.deleteText(offset + tamanho, blotBuffer.length() - tamanho - 1, PrivateQuill.sources.SILENT);

    if (offset > 0) {
      this.deleteText(0, offset, PrivateQuill.sources.SILENT);
    }
    return blotBuffer.domNode.innerHTML;
  }

  converterHtmlParaDelta(html: string): QuillDelta {
    return this.clipboard!.convert(html ?? '');
  }

  converterDeltaParaHtml(delta: QuillDelta): string {
    this.setConteudo(delta, PrivateQuill.sources.SILENT);
    return this.scroll.children.head.domNode.innerHTML;
  }

  private setConteudo(delta: QuillDelta, source?: QuillSource): void {
    const blotBuffer: any = this.scroll.children.head;
    let index = 0;

    if (blotBuffer.length() > 1) {
      this.deleteText(index, blotBuffer.length() - 1, source ?? PrivateQuill.sources.SILENT);
    }
    this.insertText(index, ' ', PrivateQuill.sources.SILENT);

    delta.ops?.forEach((op: QuillDeltaOperation): void => {
      if (op.attributes) {
        this.insertText(index, op.insert, op.attributes, source ?? PrivateQuill.sources.SILENT);
      } else {
        this.insertText(index, op.insert, source ?? PrivateQuill.sources.SILENT);
      }
      index += op.insert.length;
    });
    this.deleteText(index, 1, PrivateQuill.sources.SILENT);
  }
}
