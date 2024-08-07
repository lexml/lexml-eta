import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';
import { normalizaSeForOmissis } from '../../model/lexml/conteudo/conteudoUtil';
import { TEXTO_OMISSIS } from '../../model/lexml/conteudo/textoOmissis';
import { EtaQuillUtil } from './eta-quill-util';

export class EtaBlotConteudo extends EtaBlot {
  static blotName = 'EtaBlotConteudo';
  static tagName = 'P';
  static className = 'texto__dispositivo';

  get instanceBlotName(): string {
    return EtaBlotConteudo.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    const conteudo: string = normalizaSeForOmissis(elemento.conteudo?.texto ?? '').trim();

    node.setAttribute('class', EtaBlotConteudo.getClasseCSS(elemento));
    node.setAttribute('contenteditable', elemento?.editavel ? 'true' : 'false');
    node.setAttribute('id', 'texto__dispositivo' + elemento.uuid);
    node.setAttribute('tabindex', '0');

    if (elemento.notaAlteracao) {
      node.setAttribute('nota-alteracao', elemento.notaAlteracao || '');
    }

    if (elemento.fechaAspas) {
      node.setAttribute('fecha-aspas', 'true');
    }

    if (elemento.tipo === 'Omissis' || conteudo.indexOf(TEXTO_OMISSIS) >= 0) {
      node.innerHTML = EtaQuillUtil.montarSpanOmissisAsString();
    } else {
      node.innerHTML = conteudo !== '' ? conteudo : '<br>';
    }

    return node;
  }

  private _htmlAnt: string;
  set htmlAnt(htmlAnt: string) {
    this._htmlAnt = htmlAnt;
  }

  get htmlAnt(): string {
    return this._htmlAnt;
  }

  get alterado(): boolean {
    return this._htmlAnt !== this.html;
  }

  constructor(elemento: Elemento) {
    super(EtaBlotConteudo.create(elemento));
    this._htmlAnt = '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getClasseCSS(elemento: Elemento): string {
    return 'texto__dispositivo';
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.htmlAnt = this.html;
    if (elemento.notaAlteracao) {
      this.domNode.setAttribute('nota-alteracao', elemento.notaAlteracao || '');
    } else {
      this.domNode.removeAttribute('nota-alteracao');
    }

    if (elemento.fechaAspas) {
      this.domNode.setAttribute('fecha-aspas', 'true');
    } else {
      this.domNode.removeAttribute('fecha-aspas');
    }
  }
}
