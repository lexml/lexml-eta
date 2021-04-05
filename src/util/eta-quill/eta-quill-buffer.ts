export class EtaQuillBuffer extends Quill {
  constructor(editorHtml: HTMLElement, op: QuillOptionsStatic) {
    super(editorHtml, op);
  }

  getConteudoHtml(html: string, offset: number, tamanho: number): string {
    const blotBuffer: any = this.scroll.children.head;

    this.setConteudo(this.converterHtmlParaDelta(html), Quill.sources.SILENT);
    this.deleteText(offset + tamanho, blotBuffer.length() - tamanho - 1, Quill.sources.SILENT);

    if (offset > 0) {
      this.deleteText(0, offset, Quill.sources.SILENT);
    }
    return blotBuffer.domNode.innerHTML;
  }

  converterHtmlParaDelta(html: string): DeltaStatic {
    return this.clipboard!.convert(html ?? '');
  }

  converterDeltaParaHtml(delta: DeltaStatic): string {
    this.setConteudo(delta, Quill.sources.SILENT);
    return this.scroll.children.head.domNode.innerHTML;
  }

  private setConteudo(delta: DeltaStatic, source?: Sources): void {
    const blotBuffer: any = this.scroll.children.head;
    let index = 0;

    if (blotBuffer.length() > 1) {
      this.deleteText(index, blotBuffer.length() - 1, source ?? Quill.sources.SILENT);
    }
    this.insertText(index, ' ', Quill.sources.SILENT);

    delta.ops?.forEach((op: DeltaOperation): void => {
      if (op.attributes) {
        this.insertText(index, op.insert, op.attributes, source ?? Quill.sources.SILENT);
      } else {
        this.insertText(index, op.insert, source ?? Quill.sources.SILENT);
      }
      index += op.insert.length;
    });
    this.deleteText(index, 1, Quill.sources.SILENT);
  }
}
