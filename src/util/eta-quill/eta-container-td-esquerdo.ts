import { Elemento } from '../../model/elemento';

const Container = Quill.import('blots/container');

export class EtaContainerTdEsquerdo extends Container {
  static blotName = 'containerTdEsquerdo';
  static tagName = 'DIV';
  static className = 'container__texto';
  static classLevel = 'level';

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', elemento.editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTdEsquerdo.className + ' container__texto--nivel' + elemento.nivel);

    const fator = Number(getComputedStyle(document.documentElement).getPropertyValue('--elemento-padding-factor'));
    if (fator) {
      const padding: number = (elemento.agrupador ? 0 : elemento.nivel) * fator + 5;
      node.setAttribute('style', `padding-left: ${padding}px;`);
    }
    if (elemento.tipoOmissis) {
      node.setAttribute('tipo-omissis', elemento.tipoOmissis);
    }
    if (elemento.existeNaNormaAlterada) {
      node.setAttribute('existenanormaalterada', elemento.existeNaNormaAlterada ? 'true' : 'false');
    }

    return node;
  }

  [key: string]: any;

  constructor(elemento: Elemento) {
    super(EtaContainerTdEsquerdo.create(elemento));
  }
}
