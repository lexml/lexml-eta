import { DescricaoSituacao } from '../../model/dispositivo/situacao';
import { Elemento } from '../../model/elemento';
import { EtaBlotConteudo } from './eta-blot-conteudo';
import { EtaBlotEspaco } from './eta-blot-espaco';
import { EtaBlotRotulo } from './eta-blot-rotulo';
import { EtaContainerTdDireito } from './eta-container-td-direito';

const Container = Quill.import('blots/container');

export class EtaContainerTable extends Container {
  static blotName = 'containerTable';
  static tagName = 'TABLE';
  static className = 'container-table';

  static criarId(uuid?: number): string {
    return `lxEtaId${uuid ?? 0}`;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    node.setAttribute('contenteditable', elemento?.editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTable.className);
    node.setAttribute('id', EtaContainerTable.criarId(elemento.uuid));
    node.setAttribute('style', EtaContainerTable.criarAtributoStyle(elemento));
    node.setAttribute('cellpadding', '0');
    node.setAttribute('cellspacing', '0');
    node.setAttribute('border', '0');
    return node;
  }

  [key: string]: any;

  get blotRotulo(): EtaBlotRotulo {
    return this.children.head?.children?.head.children.head;
  }

  get blotConteudo(): EtaBlotConteudo {
    return this.blotRotulo?.next;
  }

  get containerDireito(): EtaContainerTdDireito {
    return this.children.head.children.tail;
  }

  get blotContainerDireito(): EtaContainerTdDireito {
    return this.containerDireito.children.head;
  }

  get tamanho(): number {
    return this.length() - 1;
  }

  get id(): string {
    return this.domNode.getAttribute('id') ?? '';
  }

  private _agrupador: boolean;
  set agrupador(agrupador: boolean) {
    this._agrupador = agrupador;
  }

  get agrupador(): boolean {
    return this._agrupador;
  }

  private _editavel: boolean;
  set editavel(editavel: boolean) {
    this._editavel = editavel;
    this.domNode.contentEditable = this._editavel;
  }

  get editavel(): boolean {
    return this._editavel;
  }

  private _hierarquia: any;
  set hierarquia(hierarquia: any) {
    this._hierarquia = hierarquia;
  }

  get hierarquia(): any {
    return this._hierarquia;
  }

  private _nivel: number;
  set nivel(nivel: number) {
    this._nivel = nivel;
  }

  get nivel(): number {
    return this._nivel;
  }

  private _numero: string;
  set numero(numero: string) {
    this._numero = numero;
  }

  get numero(): string {
    return this._numero;
  }

  private _tipo: string;
  set tipo(tipo: string) {
    this._tipo = tipo;
  }

  get tipo(): string {
    return this._tipo;
  }

  private _descricaoSituacao: any;
  set descricaoSituacao(situacao: any) {
    this._descricaoSituacao = situacao;
  }

  get descricaoSituacao(): any {
    return this._descricaoSituacao;
  }

  get uuid(): number {
    return parseInt(this.id.substr(7), 0);
  }

  get html(): string {
    return this.domNode.innerHTML !== '<br>' ? this.domNode.innerHTML : '';
  }

  set html(html: string) {
    this.domNode.innerHTML = html;
  }

  setEstilo(valor: string): void {
    let rotuloStyle = '';
    let conteudoStyle = '';

    switch (valor) {
      case DescricaoSituacao.DISPOSITIVO_ADICIONADO:
        rotuloStyle = 'color: green;';
        conteudoStyle = 'color: green;';
        break;
      case DescricaoSituacao.DISPOSITIVO_MODIFICADO:
        rotuloStyle = 'color: blue;';
        conteudoStyle = 'color: blue;';
        break;
      case DescricaoSituacao.DISPOSITIVO_SUPRIMIDO:
        rotuloStyle = 'color: red;';
        conteudoStyle = 'text-decoration: line-through; color: red;';
        break;
      default:
        rotuloStyle = '';
        conteudoStyle = '';
        break;
    }
    this.blotRotulo.domNode.setAttribute('style', this.blotRotulo.domNode.getAttribute('style') + rotuloStyle);
    this.blotConteudo.domNode.setAttribute('style', this.blotRotulo.domNode.getAttribute('style') + conteudoStyle);
  }

  constructor(elemento: Elemento) {
    super(EtaContainerTable.create(elemento));
    this._editavel = elemento.editavel;
    this._nivel = elemento.nivel;
    this._numero = elemento.numero ?? '';
    this._tipo = elemento.tipo ?? '';
    this._agrupador = elemento.agrupador;
    this._hierarquia = elemento.hierarquia?.pai?.uuidAlteracao ? elemento.hierarquia : undefined;
    this._descricaoSituacao = elemento.descricaoSituacao ? elemento.descricaoSituacao : undefined;
  }

  format(name: string, value: any): void {
    if (name === EtaContainerTable.blotName) {
      this.domNode.setAttribute('style', EtaContainerTable.criarAtributoStyle(value));
    } else {
      super.format(name, value);
    }
  }

  ativarBorda(): void {
    this.domNode.style.borderColor = '#24d421';
  }

  desativarBorda(): void {
    this.domNode.style.borderColor = '#ffffff';
    this.limparContainerDireito();
  }

  limparContainerDireito(): void {
    if (this.blotContainerDireito.tagName !== EtaBlotEspaco.tagName) {
      this.blotContainerDireito.remove();
      new EtaBlotEspaco().insertInto(this.containerDireito);
    }
  }

  private static criarAtributoStyle(elemento: Elemento): string {
    let style =
      elemento.tipo === 'Articulacao'
        ? `width: 100%; min-height: 1px; line-height: 0.42; margin: 1px`
        : `width: 100%; min-height: 26px; border: 1px solid #ffffff; line-height: 1.42; margin: 0px 2px 0px 5px !important;`;
    const padding: number = (elemento.agrupador ? 0 : elemento.nivel) * 20 + 5;

    style = `${style} padding-left: ${padding}px;`;
    if (elemento.agrupador) {
      style = `${style} text-align: center;`;
    }

    return style;
  }
}
