import { CaracteresNaoValidos } from './eta-keyboard';

const Clipboard = Quill.import('modules/clipboard');

export class EtaClipboard extends Clipboard {
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
