import { EtaBlotRevisaoRecusar } from './eta-blot-revisao-recusar';
import { EtaBlotRevisaoAceitar } from './eta-blot-revisao-aceitar';
import { Elemento } from '../../model/elemento';
import { EtaContainer } from './eta-container';
import { EtaBlotRevisao } from './eta-blot-revisao';
import { EtaBlotOpcoesComentario } from './eta-blot-opcoes-comentario';

export class EtaContainerRevisao extends EtaContainer {
  static blotName = 'EtaContainerRevisao';
  static tagName = 'DIV';
  static className = 'container__revisao';

  get instanceBlotName(): string {
    return EtaContainerRevisao.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaContainerRevisao.className);
    EtaContainerRevisao.atualizarAtributos(elemento, node);
    return node;
  }

  [key: string]: any;

  constructor(elemento: Elemento) {
    super(EtaContainerRevisao.create(elemento));
  }

  atualizarElemento(elemento: Elemento): void {
    EtaContainerRevisao.atualizarAtributos(elemento, this.domNode);
    this.atualizarBlots(elemento);
  }

  atualizarBlots(elemento: Elemento): void {
    this.blotBotaoAceitarRevisao?.atualizarElemento(elemento);
    this.blotBotaoRejeitarRevisao?.atualizarElemento(elemento);
    this.blotInfoRevisao?.atualizarElemento(elemento);
    this.blotBotaoComentario?.atualizarElemento(elemento);
  }

  static atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.setAttribute('id', EtaContainerRevisao.className + elemento.uuid);
  }

  get blotBotaoAceitarRevisao(): EtaBlotRevisaoAceitar | undefined {
    return this.findBlot(EtaBlotRevisaoAceitar.blotName) as EtaBlotRevisaoAceitar;
  }

  get blotBotaoRejeitarRevisao(): EtaBlotRevisaoRecusar | undefined {
    return this.findBlot(EtaBlotRevisaoRecusar.blotName) as EtaBlotRevisaoRecusar;
  }

  get blotInfoRevisao(): EtaBlotRevisao | undefined {
    return this.findBlot(EtaBlotRevisao.blotName) as EtaBlotRevisao;
  }

  get blotBotaoComentario(): EtaBlotOpcoesComentario | undefined {
    return this.findBlot(EtaBlotOpcoesComentario.blotName) as EtaBlotOpcoesComentario;
  }
}
