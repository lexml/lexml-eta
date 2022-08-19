import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';
import { normalizaSeForOmissis } from '../../model/lexml/conteudo/conteudoUtil';
import { TEXTO_OMISSIS } from '../../model/lexml/conteudo/textoOmissis';

export class EtaBlotConteudo extends EtaBlot {
  static blotName = 'EtaBlotConteudo';
  static tagName = 'P';
  static className = 'texto__dispositivo';

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();
    const conteudo: string = normalizaSeForOmissis(elemento.conteudo?.texto ?? '').trim();

    node.setAttribute('class', EtaBlotConteudo.getClasseCSS(elemento));
    node.setAttribute('contenteditable', elemento?.editavel ? 'true' : 'false');

    if (elemento.notaAlteracao) {
      node.setAttribute('nota-alteracao', elemento.notaAlteracao || '');
    }

    if (elemento.fechaAspas) {
      node.setAttribute('fecha-aspas', 'true');
    }

    if (elemento.tipo === 'Omissis' || conteudo.indexOf(TEXTO_OMISSIS) >= 0) {
      node.innerHTML = '<span class="texto__omissis">' + TEXTO_OMISSIS + '</span>';
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
