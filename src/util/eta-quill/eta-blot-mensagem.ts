import { Mensagem, TipoMensagem } from '../../model/lexml/util/mensagem';
import { EtaBlot } from './eta-blot';

export class EtaBlotMensagem extends EtaBlot {
  static blotName = 'EtaBlotMensagem';
  static tagName = 'div';
  static className = 'mensagem';

  get instanceBlotName(): string {
    return EtaBlotMensagem.blotName;
  }

  static create(mensagem: Mensagem): any {
    const node: HTMLElement = super.create();
    let classe = '';

    if (mensagem.nomeEvento !== '') {
      node.setAttribute('id', mensagem.nomeEvento!);
    }

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
    if (mensagem.fix) {
      node.innerHTML += `. <span class="mensagem__fix">Corrigir agora.</span>`;
      node.onclick = (): boolean => node.dispatchEvent(new CustomEvent('mensagem', { bubbles: true, cancelable: true, detail: { mensagem } }));
    }

    if (mensagem.nomeEvento && mensagem.nomeEvento !== '') {
      node.innerHTML += `. <span class="mensagem__fix">Saiba mais</span>`;
      node.onclick = (): boolean => node.dispatchEvent(new CustomEvent(mensagem.nomeEvento!, { bubbles: true, cancelable: true, detail: { mensagem } }));
    }
    return node;
  }

  constructor(mensagem: Mensagem) {
    super(EtaBlotMensagem.create(mensagem));
  }
}
