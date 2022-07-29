import { TEXTO_OMISSIS } from '../../model/lexml/conteudo/textoOmissis';
import { EtaBlot } from './eta-blot';

// const Inline = Quill.import('blots/inline');

export class EtaBlotConteudoOmissis extends EtaBlot {
  static blotName = 'omissis';
  static tagName = 'span';
  static className = 'texto__omissis';

  static create(): any {
    const node: HTMLElement = super.create();
    node.innerHTML = TEXTO_OMISSIS;
    return node;
  }

  constructor() {
    super(EtaBlotConteudoOmissis.create());
  }
}
