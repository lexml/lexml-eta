import { connect } from 'pwa-helpers';
import { Elemento } from '../../model/elemento';
import { adicionarElementoFromClipboardAction } from '../../model/lexml/acao/AdicionarElementosFromClipboardAction';
import { rootStore } from '../../redux/store';
import { cancelarPropagacaoDoEvento } from '../event-util';
import { Observable } from '../observable';
import { removeAllHtmlTags } from '../string-util';
// import { CaracteresNaoValidos } from './eta-keyboard';
import { EtaQuill } from './eta-quill';

const Clipboard = Quill.import('modules/clipboard');

export class EtaClipboard extends connect(rootStore)(Clipboard) {
  onChange: Observable<string> = new Observable<string>();

  constructor(quill: EtaQuill, options: any) {
    super(quill, options);

    this.quill.root.addEventListener('cut', (ev: ClipboardEvent) => {
      if (this.quill.cursorDeTextoEstaSobreLink()) {
        cancelarPropagacaoDoEvento(ev);
        return;
      }
      const text = document.getSelection()?.toString();
      if (text) {
        this.onChange.notify('clipboard');
      }
    });

    this.quill.root.addEventListener('paste', (ev: ClipboardEvent) => {
      if (this.quill.cursorDeTextoEstaSobreLink()) {
        cancelarPropagacaoDoEvento(ev);
        return;
      }
      const text = ev.clipboardData?.getData('text/plain');
      if (text) {
        /*         const range = this.quill.getSelection();
        this.quill.clipboard.dangerouslyPasteHTML(range.index, text); */
        this.onChange.notify('clipboard');
      }
    });
  }

  convert(html?: any): DeltaStatic {
    if (typeof html === 'string') {
      this.container.innerHTML = html;
      return super.convert();
    }

    this.container.innerHTML = this.normalizaTexto(this.container.innerHTML);

    const delta: DeltaStatic = super.convert();
    this.container.innerHTML = '';
    return delta;
  }

  onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const range = this.quill.getSelection();
    const html = e?.clipboardData?.getData('text/html');

    if (html && html.length > 0 && removeAllHtmlTags(html).length > 0) {
      const parser = new DOMParser().parseFromString(html!, 'text/html');

      let text = '';
      const allowedTags = ['A', 'B', 'STRONG', 'I', 'EM', 'SUP', 'SUB', 'P'];
      const walkDOM = (node, func) => {
        func(node);
        node = node.firstChild;
        while (node) {
          walkDOM(node, func);
          node = node.nextSibling;
        }
      };
      walkDOM(parser, function (node) {
        if (allowedTags.includes(node.tagName)) {
          text += node.outerHTML;
        } else if (node.nodeType === 3 && !allowedTags.includes(node.parentElement.tagName)) {
          text += node.nodeValue;
        }
      });
      if (text !== undefined && this.hasRotulo(text)) {
        text = text.replace(/<p/g, '\n<p').replace(/&nbsp;/g, ' ');
        this.adicionaDispositivos(
          this.normalizaTexto(text)
            .replace(/;[/s]?[e][/s]?$/, '; ')
            .replace('-', ' - ')
            .replace('—', ' — ')
            .replace(';', '; ')
            .replace(/^["“']/g, '')
        );
        return;
      }
      this.quill.clipboard.dangerouslyPasteHTML(range.index, text);
    } else if (e.clipboardData?.getData('text/plain')) {
      const texto = e.clipboardData!.getData('text/plain');
      if (texto.trim() !== '' && this.hasRotulo(texto)) {
        this.adicionaDispositivos(texto);
        return;
      }
      this.quill.clipboard.dangerouslyPasteHTML(range.index, e.clipboardData?.getData('text/plain'));
    }
  }

  private normalizaTexto(texto: string): string {
    // return texto
    //   .replace(CaracteresNaoValidos, '')
    //   .replace(/(<p\s*)/gi, ' <p')
    //   .replace(/(<br\s*\/>)/gi, ' ')
    //   .replace(/<(?!strong)(?!\/strong)(?!em)(?!\/em)(?!sub)(?!\/sub)(?!sup)(?!\/sup)(.*?)>/gi, '')
    //   .replace(/<([a-z]+) .*?=".*?( *\/?>)/gi, '<$1$2');
    return texto
      .replace(/(<p\s*)/gi, ' <p')
      .replace(/(<br\s*\/>)/gi, ' ')
      .replace(/<(?!strong)(?!\/strong)(?!em)(?!\/em)(?!sub)(?!\/sub)(?!sup)(?!\/sup)(.*?)>/gi, '')
      .replace(/<([a-z]+) .*?=".*?( *\/?>)/gi, '<$1$2');
  }

  private hasRotulo(texto: string): boolean {
    const t = removeAllHtmlTags(texto)?.replace(/["“']/g, '').trim();

    if (t && t.length > 0 && /^(art\.|§|par[aá]grafo [uú]nico|[IVXMDC]{1,3}\s[-–]{1}|[az]{1,2}\)).*/i.test(t)) {
      return true;
    }

    return false;
  }

  private adicionaDispositivos(texto: string): Promise<any> {
    const linha = this.quill.linhaAtual;
    const elemento: Elemento = new Elemento();
    elemento.uuid = linha.uuid;
    elemento.tipo = linha.tipo;

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: texto,
    };

    return fetch('https://www6ghml.senado.leg.br/editor-emendas/api/parser/jsonix', options)
      .then(response => response.json())
      .then(response => rootStore.dispatch(adicionarElementoFromClipboardAction.execute(elemento, response)))
      .catch(err => console.error(err));
  }
}
