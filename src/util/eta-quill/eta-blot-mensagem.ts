import { Mensagem, TipoMensagem } from '../../model/lexml/util/mensagem';
import { EtaBlot } from './eta-blot';

export class EtaBlotMensagem extends EtaBlot {
  static blotName = 'mensagem';
  static tagName = 'div';
  static className = 'mensagem';

  static create(mensagem: Mensagem): any {
    const node: HTMLElement = super.create();
    let classe = '';

    if (mensagem.tipo === TipoMensagem.INFO) {
      classe = 'mensagem--info';
    } else if (mensagem.tipo === TipoMensagem.WARNING) {
      classe = 'mensagem--warning';
    } else {
      classe = 'mensagem--danger';
    }

    node.setAttribute('contenteditable', 'false');
    node.classList.add(classe);
    node.innerHTML = mensagem.descricao ? mensagem.descricao : '';
    return node;
  }

  constructor(mensagem: Mensagem) {
    super(EtaBlotMensagem.create(mensagem));
  }
}
