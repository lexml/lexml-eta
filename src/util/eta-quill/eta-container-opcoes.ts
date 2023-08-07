import { Elemento } from '../../model/elemento';
import { EtaContainer } from './eta-container';
import { EtaBlotOpcoesDiff } from './eta-blot-opcoes-diff';

export class EtaContainerOpcoes extends EtaContainer {
  static blotName = 'EtaContainerOpcoes';
  static tagName = 'DIV';
  static className = 'container__opcoes';

  get instanceBlotName(): string {
    return EtaContainerOpcoes.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaContainerOpcoes.className);
    EtaContainerOpcoes.atualizarAtributos(elemento, node);
    return node;
  }

  [key: string]: any;

  constructor(elemento: Elemento) {
    super(EtaContainerOpcoes.create(elemento));
  }

  atualizarElemento(elemento: Elemento): void {
    EtaContainerOpcoes.atualizarAtributos(elemento, this.domNode);
    this.atualizarBlots(elemento);
  }

  atualizarBlots(elemento: Elemento): void {
    this.blotBotaoExibirDiferencas?.atualizarElemento(elemento);
  }

  static atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.setAttribute('id', EtaContainerOpcoes.className + elemento.uuid);
  }

  get blotBotaoExibirDiferencas(): EtaBlotOpcoesDiff | undefined {
    return this.findBlot(EtaBlotOpcoesDiff.blotName) as EtaBlotOpcoesDiff;
  }
}
