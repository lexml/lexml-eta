import { CaracteresNaoValidos } from './eta-keyboard';
import { EtaQuill } from './eta-quill';
import { Observable } from '../observable';
import { cancelarPropagacaoDoEvento } from '../event-util';

const Clipboard = Quill.import('modules/clipboard');

export class EtaClipboard extends Clipboard {
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
        this.onChange.notify('clipboard');
      }
    });
  }

  convert(html?: any): DeltaStatic {
    if (typeof html === 'string') {
      this.container.innerHTML = html;
      return super.convert();
    }

    this.container.innerHTML = this.container.innerHTML.replace(CaracteresNaoValidos, '');
    this.container.innerHTML = this.container.innerHTML.replace(/(<p\s*)/gi, ' <p');
    this.container.innerHTML = this.container.innerHTML.replace(/(<br\s*\/>)/gi, ' ');
    this.container.innerHTML = this.container.innerHTML.replace(/<(?!strong)(?!\/strong)(?!em)(?!\/em)(?!sub)(?!\/sub)(?!sup)(?!\/sup)(.*?)>/gi, '');
    this.container.innerHTML = this.container.innerHTML.replace(/<([a-z]+) .*?=".*?( *\/?>)/gi, '<$1$2');

    const delta: DeltaStatic = super.convert();
    this.container.innerHTML = '';
    return delta;
  }
}
