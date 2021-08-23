import { Mensagem, TipoMensagem } from '../../model/lexml/util/mensagem';
import { EtaBlot } from './eta-blot';

export class EtaBlotMensagem extends EtaBlot {
  static blotName = 'mensagem';
  static tagName = 'div';
  static className = 'mensagem';

  static create(mensagem: Mensagem): any {
    const node: HTMLElement = super.create();
    let cor = '';

    if (mensagem.tipo === TipoMensagem.INFO) {
      cor = 'green';
    } else if (mensagem.tipo === TipoMensagem.WARNING) {
      cor = '#afaf08';
    } else {
      cor = 'red';
    }

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('style', `font-size: 0.8em;color:${cor};`);
    node.innerHTML = mensagem.descricao ?? '';
    return node;
  }

  constructor(mensagem: Mensagem) {
    super(EtaBlotMensagem.create(mensagem));
  }
}
