import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';
import { getTextoSemHtml } from '../../util/string-util';
import { AtualizarTituloDispositivo } from '../../model/lexml/acao/atualizarTituloDispositivoAction';

export class EtaBlotTituloDispositivo extends EtaBlot {
  static blotName = 'EtaBlotTituloDispositivo';
  static tagName = 'titulo-dispositivo';
  static className = 'titulo-dispositivo';

  private elemento: Elemento;
  constructor(elemento: Elemento) {
    super(EtaBlotTituloDispositivo.create(elemento));
    this.elemento = elemento;
  }

  get instanceBlotName(): string {
    return EtaBlotTituloDispositivo.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    node.setAttribute('contenteditable', 'false');
    EtaBlotTituloDispositivo.__atualizarAtributos(elemento, node);
    return node;
  }

  static formats(): boolean {
    return true;
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.elemento = elemento;
    EtaBlotTituloDispositivo.__atualizarAtributos(elemento, this.domNode);
  }

  private static __atualizarAtributos(elemento: Elemento, node: HTMLElement): void {
    node.innerHTML = EtaBlotTituloDispositivo.montarHTML(elemento);
    // :empty não cobre título só com espaço/&nbsp;/<br>; a classe garante o marcador de título vazio.
    node.classList.toggle('titulo-dispositivo-vazio', getTextoSemHtml(node.innerHTML.replace(/&nbsp;/g, ' ')) === '');
    node.onclick = onclick(node, elemento);
  }

  private static montarHTML(elemento: Elemento): string {
    return elemento.tituloDispositivo ?? '';
  }
}

const onclick = (node: HTMLElement, elemento: Elemento): (() => boolean) => {
  const editavel = !!elemento.acoesPossiveis?.some(acao => acao instanceof AtualizarTituloDispositivo);
  node.classList.toggle('titulo-dispositivo-editavel', editavel);
  return editavel ? (): boolean => node.dispatchEvent(new CustomEvent('titulo-dispositivo', { bubbles: true, cancelable: true, detail: { elemento } })) : (): boolean => false;
};
