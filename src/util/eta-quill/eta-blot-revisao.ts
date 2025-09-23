import { EtaBlot } from './eta-blot';
import { Elemento } from '../../model/elemento';
import { getIniciais } from '../string-util';

export enum AlinhamentoMenu {
  Esquerda,
  Direita,
}

export class EtaBlotRevisao extends EtaBlot {
  static blotName = 'EtaBlotRevisao';
  static className = 'blot__revisao';
  static tagName = 'button';

  get instanceBlotName(): string {
    return EtaBlotRevisao.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRevisao.className);
    node.setAttribute('type', 'button');
    EtaBlotRevisao.atualizarAtributos(elemento, node);
    return node;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRevisao.create(elemento));
  }

  atualizarElemento(elemento: Elemento): void {
    EtaBlotRevisao.atualizarAtributos(elemento, this.domNode);
  }

  static atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.setAttribute('id', 'buttonInfoRevisao' + elemento.uuid);
    node.setAttribute('title', EtaBlotRevisao.montarMensagem(elemento));

    node.innerHTML = elemento.revisao!.usuario.sigla || getIniciais(elemento.revisao!.usuario.nome).charAt(0) || 'R';
    // node.onclick =
    //   isRevisaoDeModificacao(elemento.revisao!) || isRevisaoDeRestauracao(elemento.revisao!)
    //     ? (): boolean => node.dispatchEvent(new CustomEvent('exibir-diferencas', { bubbles: true, cancelable: true, detail: { elemento } }))
    //     : (): boolean => false;
  }

  static montarMensagem(elemento: Elemento): string {
    const revisao = elemento.revisao!;
    const pipe = ' | ';
    return 'Ação: ' + revisao.descricao + pipe + 'Usuário: ' + revisao.usuario.nome + pipe + 'Data/Hora: ' + revisao.dataHora;
  }
}
