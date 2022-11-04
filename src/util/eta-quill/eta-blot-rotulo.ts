import { DescricaoSituacao } from '../../model/dispositivo/situacao';
import { Elemento } from '../../model/elemento';
import { EtaBlot } from './eta-blot';

export class EtaBlotRotulo extends EtaBlot {
  static blotName = 'EtaBlotRotulo';
  static tagName = 'LABEL';

  static formatoStyle = 'STYLE';

  get instanceBlotName(): string {
    return EtaBlotRotulo.blotName;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', 'false');
    node.setAttribute('class', EtaBlotRotulo.getClasseCSS(elemento));
    node.setAttribute('data-rotulo', elemento.rotulo);

    if (elemento.abreAspas) {
      node.setAttribute('abre-aspas', 'true');
    }

    if (podeInformarNumeracao(elemento)) {
      node.setAttribute('pode-informar-numeracao', 'true');
    }

    if (elemento.tipo) {
      node.setAttribute('tipo-dispositivo', elemento.tipo);
    }

    node.innerHTML = elemento.rotulo;
    if (elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO && elemento.dispositivoAlteracao) {
      node.title = elemento.existeNaNormaAlterada ? 'Dispositivo existente na norma alterada' : 'Dispositivo a ser adicionado à norma';
    }
    // node.onclick = (): boolean => node.dispatchEvent(new CustomEvent('rotulo', { bubbles: true, cancelable: true, detail: { elemento } }));
    node.onclick = onclick(node, elemento);
    return node;
  }

  get rotulo(): string {
    return this.domNode.getAttribute('data-rotulo');
  }

  constructor(elemento: Elemento) {
    super(EtaBlotRotulo.create(elemento));
  }

  format(name: string, value: any, abreAspas?: boolean): void {
    if (name === EtaBlotRotulo.blotName) {
      this.domNode.setAttribute('data-rotulo', (abreAspas ? '\u201C' : '') + value);
      if (abreAspas) {
        this.domNode.setAttribute('abre-aspas', 'true');
      }
      this.domNode.innerHTML = value;
    } else if (name === EtaBlotRotulo.formatoStyle) {
      this.domNode.setAttribute('style', EtaBlotRotulo.criarAtributoStyle(value));
    } else {
      super.format(name, value);
    }
  }

  private static criarAtributoStyle(elemento: Elemento): string {
    let style = elemento.tipo === 'Articulacao' ? 'color: #373634; font-weight: 600; line-height: 0.42;' : 'color: #373634; font-weight: 600; line-height: 1.42;';

    if (elemento.agrupador) {
      style = `${style} display: block; font-size: 1rem; text-align: center;`;
    } else {
      style = `${style} float: left; margin-right: 10px;`;
    }
    return style;
  }

  public static getClasseCSS(elemento: Elemento): string {
    const classeSituacao = {
      [DescricaoSituacao.DISPOSITIVO_ADICIONADO]: 'dispositivo--adicionado',
      [DescricaoSituacao.DISPOSITIVO_MODIFICADO]: 'dispositivo--modificado',
      [DescricaoSituacao.DISPOSITIVO_SUPRIMIDO]: 'dispositivo--suprimido',
    };

    const isAdicionado = elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO;
    return (
      'texto__rotulo' +
      (elemento.agrupador ? ' texto__rotulo--agrupador' : ' texto__rotulo--padrao') +
      (isAdicionado && elemento.dispositivoAlteracao ? ' rotulo' : '') +
      (' texto__rotulo--' + elemento.tipo?.toLowerCase()) +
      (' ' + (classeSituacao[elemento.descricaoSituacao ?? ''] ?? ''))
    );
  }

  public setEstilo(elemento: Elemento): void {
    this.domNode.setAttribute('class', `${EtaBlotRotulo.getClasseCSS(elemento)}`);
  }

  public atualizarAtributos(elemento: Elemento): void {
    this.setEstilo(elemento);

    this.domNode.setAttribute('data-rotulo', elemento.rotulo);

    if (elemento.abreAspas) {
      this.domNode.setAttribute('abre-aspas', 'true');
    } else {
      this.domNode.removeAttribute('abre-aspas');
    }

    if (podeInformarNumeracao(elemento)) {
      this.domNode.setAttribute('pode-informar-numeracao', 'true');
    } else {
      this.domNode.removeAttribute('pode-informar-numeracao');
    }

    this.domNode.onclick = onclick(this.domNode, elemento);
  }
}

const podeInformarNumeracao = (elemento: Elemento): boolean => {
  return !!(
    elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
    elemento.dispositivoAlteracao &&
    (elemento.abreAspas || (elemento.hierarquia?.pai?.existeNaNormaAlterada ?? true))
  );
};

const onclick = (node: HTMLElement, elemento: Elemento): (() => boolean) => {
  if (podeInformarNumeracao(elemento)) {
    return (): boolean => node.dispatchEvent(new CustomEvent('rotulo', { bubbles: true, cancelable: true, detail: { elemento } }));
  } else {
    return (): boolean => false;
  }
};
