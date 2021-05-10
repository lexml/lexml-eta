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
      cor = '#337DFF';
    } else if (mensagem.tipo === TipoMensagem.WARNING) {
      cor = '#FF7433';
    } else {
      cor = 'red';
    }

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('style', `color:${cor};`);
    node.innerHTML = mensagem.descricao ?? '';
    return node;
  }

  constructor(mensagem: Mensagem) {
    super(EtaBlotMensagem.create(mensagem));
  }
}
