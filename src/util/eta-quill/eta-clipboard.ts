import { CaracteresNaoValidos } from './eta-keyboard';
import { EtaQuill } from './eta-quill';
import eventos from '../../components/editor/editor-custom-events';

const Clipboard = Quill.import('modules/clipboard');

export class EtaClipboard extends Clipboard {
  constructor(quill: EtaQuill, options: any) {
    super(quill, options);

    this.quill.root.addEventListener('cut', e => {
      const texto = document.getSelection()?.toString();
      if (texto) {
        eventos.textChange(e.target, 'clipboard', true);
      }
    });

    this.quill.root.addEventListener('paste', (e: any) => {
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        eventos.textChange(e.target, 'clipboard', true);
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
