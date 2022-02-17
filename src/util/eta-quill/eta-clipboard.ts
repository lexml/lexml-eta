import { CaracteresNaoValidos } from './eta-keyboard';
import { EtaQuill } from './eta-quill';
import { Observable } from '../observable';

const Clipboard = Quill.import('modules/clipboard');

export class EtaClipboard extends Clipboard {
  onChange: Observable<string> = new Observable<string>();

  constructor(quill: EtaQuill, options: any) {
    super(quill, options);

    this.quill.root.addEventListener('cut', () => {
      const text = document.getSelection()?.toString();
      if (text) {
        this.onChange.notify('clipboard');
      }
    });

    this.quill.root.addEventListener('paste', (e: any) => {
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        this.onChange.notify('clipboard');
      }
    });

    this.quill.root.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    this.quill.root.addEventListener('drop', (e) => {
      e.preventDefault();
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
