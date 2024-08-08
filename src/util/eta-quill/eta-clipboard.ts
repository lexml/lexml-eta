import { removeTagScript, removeTagStyle, removeTagHead } from './../string-util';
import { connect } from 'pwa-helpers';
import { rootStore } from '../../redux/store';
import { cancelarPropagacaoDoEvento } from '../event-util';
import { Observable } from '../observable';
import { removeAllHtmlTags } from '../string-util';
import { CaracteresNaoValidos } from './eta-keyboard';
import { EtaQuill } from './eta-quill';
import { ajustaHtmlParaColagem } from '../../redux/elemento/util/colarUtil';

const Clipboard = Quill.import('modules/clipboard');

export class EtaClipboard extends connect(rootStore)(Clipboard) {
  onChange: Observable<string> = new Observable<string>();
  onPasteTextoArticulado: Observable<any> = new Observable<any>();

  constructor(quill: EtaQuill, options: any) {
    super(quill, options);

    this.quill.root.addEventListener('cut', (ev: ClipboardEvent) => {
      if (this.quill.cursorDeTextoEstaSobreLink() || this.quill.linhaAtual.elemento.bloqueado) {
        cancelarPropagacaoDoEvento(ev);
        return;
      }
      const text = document.getSelection()?.toString();
      if (text) {
        this.onChange.notify('clipboard');
      }
    });
  }

  convert(html?: any): DeltaStatic {
    if (typeof html === 'string') {
      this.container.innerHTML = html;
      return super.convert();
    }

    this.container.innerHTML = this.container.innerHTML
      .replace(CaracteresNaoValidos, '')
      .replace(/(<p\s*)/gi, ' <p')
      .replace(/(<br\s*\/>)/gi, ' ')
      .replace(/<(?!strong)(?!\/strong)(?!em)(?!\/em)(?!sub)(?!\/sub)(?!sup)(?!\/sup)(.*?)>/gi, '')
      .replace(/<([a-z]+) .*?=".*?( *\/?>)/gi, '<$1$2');

    const delta: DeltaStatic = super.convert();
    this.container.innerHTML = '';
    return delta;
  }

  onPaste(e: ClipboardEvent): void {
    if (this.quill.cursorDeTextoEstaSobreLink() || this.quill.cursorDeTextoEstaSobreOmissis() || this.quill.linhaAtual.elemento.bloqueado) {
      cancelarPropagacaoDoEvento(e);
      return;
    }

    e.preventDefault();

    let html = e?.clipboardData?.getData('text/html');
    const textoClipboard = e?.clipboardData?.getData('text/plain');

    const range = this.quill.getSelection();
    if (html) {
      html = removeTagHead(removeTagScript(removeTagStyle(html)));
    }

    if (html && html.length > 0 && removeAllHtmlTags(html).length > 0) {
      const text = ajustaHtmlParaColagem(html);

      if (text !== undefined && this.hasRotulo(text)) {
        this.adicionaDispositivos(textoClipboard!, text, range);
        return;
      }
      this.quill.deleteText(range.index, range.length);
      this.quill.clipboard.dangerouslyPasteHTML(range.index, text);
      if (text) {
        this.onChange.notify('clipboard');
      }
    } else if (textoClipboard) {
      if (textoClipboard.trim() !== '' && this.hasRotulo(textoClipboard)) {
        this.adicionaDispositivos(textoClipboard, textoClipboard, range);
        return;
      }
      this.quill.clipboard.dangerouslyPasteHTML(range.index, textoClipboard);
      if (textoClipboard) {
        this.onChange.notify('clipboard');
      }
    }
  }

  private hasRotulo(texto: string): boolean {
    const t = removeAllHtmlTags(texto)
      ?.replace(/&nbsp;/g, ' ')
      .replace(/["“']/g, '')
      .trim();

    const regexRotulo = /^(parte|livro|t[ií]tulo|cap[ií]tulo|se[cç][aã]o|subse[cç][aã]o|art\.|art|§|par[aá]grafo [uú]nico|[IVXMDC]{1,3}\s*[-–]{1}|[az]{1,2}\)|\d{1,3}[\t .]+).*/i;

    if (t && t.length > 0 && regexRotulo.test(t)) {
      return true;
    }

    return false;
  }

  private adicionaDispositivos(textoColadoOriginal: string, textoColadoAjustado: string, range: any): void {
    this.onPasteTextoArticulado.notify({ textoColadoOriginal, textoColadoAjustado, range });
  }
}
