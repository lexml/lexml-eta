import { EtaBlotAbreAspas } from './eta-blot-abre-aspas';
import { DescricaoSituacao } from '../../model/dispositivo/situacao';
import { Elemento } from '../../model/elemento';
import { podeAdicionarAtributoDeExistencia } from '../../model/elemento/elementoUtil';
import { normalizaSeForOmissis } from '../../model/lexml/conteudo/conteudoUtil';
import { TEXTO_OMISSIS } from '../../model/lexml/conteudo/textoOmissis';
import { EtaBlot } from './eta-blot';
import { EtaBlotConteudo } from './eta-blot-conteudo';
import { EtaBlotEspaco } from './eta-blot-espaco';
import { EtaBlotExistencia } from './eta-blot-existencia';
import { EtaBlotFechaAspas } from './eta-blot-fecha-aspas';
import { EtaBlotMenu } from './eta-blot-menu';
import { EtaBlotNotaAlteracao } from './eta-blot-nota-alteracao';
import { EtaBlotRotulo } from './eta-blot-rotulo';
import { EtaContainerTdDireito } from './eta-container-td-direito';
import { RevisaoElemento } from '../../model/revisao/revisao';
import { EtaContainerRevisao } from './eta-container-revisao';
import { EtaContainer } from './eta-container';

export class EtaContainerTable extends EtaContainer {
  static blotName = 'EtaContainerTable';
  static tagName = 'DIV';
  static className = 'container__elemento';

  get instanceBlotName(): string {
    return EtaContainerTable.blotName;
  }

  static criarId(uuid?: number): string {
    return `lxEtaId${uuid ?? 0}`;
  }

  static create(elemento: Elemento): any {
    const node: HTMLElement = super.create();

    // node.setAttribute('contenteditable', 'false'); //elemento?.editavel ? 'true' : 'false');
    node.setAttribute('class', EtaContainerTable.className + ' ' + EtaContainerTable.getClasseCSS(elemento));
    node.setAttribute('id', EtaContainerTable.criarId(elemento.uuid));

    EtaContainerTable.atualizarAtributoRevisao(elemento, node);
    EtaContainerTable.atualizarAtributoExistenciaNormaAlterada(elemento, node);
    EtaContainerTable.atualizarAtributoOmissis(elemento, node);
    EtaContainerTable.atualizarAtributoBloqueado(elemento, node);

    return node;
  }

  [key: string]: any;

  protected findBlot(blotName: string): EtaBlot | undefined {
    if (!this.blotRotulo) {
      return undefined;
    }
    return this.findBlotRef(this.blotRotulo.next, blotName);
  }

  protected findBlotRef(blotRef: EtaBlot, blotName: string): EtaBlot | undefined {
    if (!blotRef) {
      return;
    }
    return blotRef.instanceBlotName === blotName ? blotRef : this.findBlotRef(blotRef.next, blotName);
  }

  private searchBlotRotuloNode(node: any): EtaBlotRotulo | undefined {
    // Verifica se o nó atual é do tipo BlotRotulo
    if (node instanceof EtaBlotRotulo) {
      return node;
    }

    // Verifica se o nó atual é um objeto
    if (typeof node === 'object' && node) {
      // Percorre as propriedades do objeto
      for (const key in node) {
        if (['children', 'head', 'next'].includes(key)) {
          // Chamada recursiva para cada propriedade do objeto
          const result = this.searchBlotRotuloNode(node[key]);

          // Se um nó EtaBlotRotulo for encontrado, retorna o resultado
          if (result instanceof EtaBlotRotulo) {
            return result;
          }
        }
      }
    }

    // Caso nenhum nó EtaBlotRotulo seja encontrado, retorna undefined
    return undefined;
  }

  get blotRotulo(): EtaBlotRotulo | undefined {
    // const node = this.children.head?.children?.head.children.head || this.children.head.children.head.next.children.head;
    // return node instanceof EtaBlotRotulo ? node : node?.next;
    return this.searchBlotRotuloNode(this.children.head);
  }

  get blotExistencia(): EtaBlotExistencia {
    return this.findBlot(EtaBlotExistencia.blotName) as EtaBlotExistencia;
  }

  get blotConteudo(): EtaBlotConteudo {
    return this.findBlot(EtaBlotConteudo.blotName) as EtaBlotConteudo;
  }

  get blotAbreAspas(): EtaBlotAbreAspas {
    const blot = this.blotRotulo?.prev;
    return blot?.instanceBlotName === EtaBlotAbreAspas.blotName ? blot : undefined;
  }

  get blotFechaAspas(): EtaBlotFechaAspas {
    return this.findBlot(EtaBlotFechaAspas.blotName) as EtaBlotFechaAspas;
  }

  get blotNotaAlteracao(): EtaBlotNotaAlteracao {
    return this.findBlot(EtaBlotNotaAlteracao.blotName) as EtaBlotNotaAlteracao;
  }

  get containerRevisao(): EtaContainerRevisao | undefined {
    return this.findBlotByBlotName(this.children, EtaContainerRevisao.blotName);
  }

  get containerDireito(): EtaContainerTdDireito {
    return this.children.head.children.tail;
  }

  get blotInsideContainerDireito(): EtaBlot {
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
    // this.blotConteudo.domNode.contentEditable = this._editavel;
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

  private _existeNaNormaAlterada: any;
  set existeNaNormaAlterada(existeNaNormaAlterada: any) {
    this._existeNaNormaAlterada = existeNaNormaAlterada;
  }

  get existeNaNormaAlterada(): any {
    return this._existeNaNormaAlterada;
  }

  get uuid(): number {
    return parseInt(this.id.substr(7), 0);
  }

  private _uuid2: string;
  set uuid2(uuid2: string) {
    this._uuid2 = uuid2;
  }

  get uuid2(): string {
    return this._uuid2;
  }

  private _lexmlId: string;
  set lexmlId(lexmlId: string) {
    this._lexmlId = lexmlId;
  }

  get lexmlId(): string {
    return this._lexmlId ?? '';
  }

  get html(): string {
    return this.domNode.innerHTML !== '<br>' ? this.domNode.innerHTML : '';
  }

  set html(html: string) {
    this.domNode.innerHTML = html;
  }

  private resetClasses(): void {
    this.domNode.classList.remove('dispositivo--adicionado');
    this.domNode.classList.remove('dispositivo--modificado');
    this.domNode.classList.remove('dispositivo--suprimido');
  }

  // TODO Rever a forma atual de se atribuir estilos
  setEstilo(elemento: Elemento): void {
    let classeCSS = '';

    this.resetClasses();

    switch (elemento.descricaoSituacao) {
      case DescricaoSituacao.DISPOSITIVO_ADICIONADO:
        classeCSS = 'dispositivo--adicionado';
        break;
      case DescricaoSituacao.DISPOSITIVO_MODIFICADO:
        classeCSS = 'dispositivo--modificado';
        break;
      case DescricaoSituacao.DISPOSITIVO_SUPRIMIDO:
        classeCSS = 'dispositivo--suprimido';
        break;
    }

    if (classeCSS) {
      this.domNode.classList.add(classeCSS);
    }

    this.blotRotulo!.setEstilo(elemento);
  }

  static atualizarAtributoRevisao(elemento: Elemento, node: HTMLElement): void {
    if (elemento.revisao) {
      node.setAttribute('em-revisao', 'true');
      if ((elemento.revisao as RevisaoElemento).stateType === 'ElementoRemovido') {
        node.setAttribute('excluido', 'true');
      } else {
        node.removeAttribute('excluido');
      }
    } else {
      node.removeAttribute('em-revisao');
      node.removeAttribute('excluido');
    }
  }

  static atualizarAtributoExistenciaNormaAlterada(elemento: Elemento, node: HTMLElement): void {
    if (podeAdicionarAtributoDeExistencia(elemento)) {
      node.setAttribute('existenanormaalterada', (!!elemento.existeNaNormaAlterada).toString());
    } else {
      node.removeAttribute('existenanormaalterada');
    }
  }

  static atualizarAtributoOmissis(elemento: Elemento, node: HTMLElement): void {
    const conteudo: string = normalizaSeForOmissis(elemento.conteudo?.texto ?? '').trim();
    if (elemento.tipo === 'Omissis' || conteudo.indexOf(TEXTO_OMISSIS) >= 0) {
      node.classList.add('container_elemento--omissis');
    } else {
      node.classList.remove('container_elemento--omissis');
    }
  }

  static atualizarAtributoBloqueado(elemento: Elemento, node: HTMLElement): void {
    if (elemento.bloqueado) {
      node.setAttribute('bloqueado', 'true');
    } else {
      node.removeAttribute('bloqueado');
    }
  }

  atualizarAtributos(elemento: Elemento): void {
    EtaContainerTable.atualizarAtributoRevisao(elemento, this.domNode);
    EtaContainerTable.atualizarAtributoExistenciaNormaAlterada(elemento, this.domNode);
    EtaContainerTable.atualizarAtributoOmissis(elemento, this.domNode);
    EtaContainerTable.atualizarAtributoBloqueado(elemento, this.domNode);

    this.blotAbreAspas?.atualizarAtributos(elemento);
    this.blotRotulo?.atualizarAtributos(elemento);
    this.blotExistencia?.atualizarAtributos(elemento);
    this.blotConteudo.atualizarAtributos(elemento);
    this.blotFechaAspas?.atualizarAtributos(elemento);
    this.blotNotaAlteracao?.atualizarAtributos(elemento);
  }

  atualizarElemento(elemento: Elemento): void {
    this.elemento = elemento;

    this._lexmlId = elemento.lexmlId ?? '';
    this._uuid2 = elemento.uuid2 ?? '';
    this._editavel = elemento.editavel;
    this._nivel = elemento.nivel;
    this._numero = elemento.numero ?? '';
    this._tipo = elemento.tipo ?? '';
    this._agrupador = elemento.agrupador;
    this._hierarquia = elemento.hierarquia;
    this._descricaoSituacao = elemento.descricaoSituacao ? elemento.descricaoSituacao : undefined;
    this._existeNaNormaAlterada = elemento.existeNaNormaAlterada;

    this.setEstilo(elemento);
    this.atualizarAtributos(elemento);
  }

  elemento: Elemento;
  constructor(elemento: Elemento) {
    super(EtaContainerTable.create(elemento));
    this.elemento = elemento;
    this._lexmlId = elemento.lexmlId ?? '';
    this._uuid2 = elemento.uuid2 ?? '';
    this._editavel = elemento.editavel;
    this._nivel = elemento.nivel;
    this._numero = elemento.numero ?? '';
    this._tipo = elemento.tipo ?? '';
    this._agrupador = elemento.agrupador;
    this._hierarquia = elemento.hierarquia;
    this._descricaoSituacao = elemento.descricaoSituacao ? elemento.descricaoSituacao : undefined;
    this._existeNaNormaAlterada = elemento.existeNaNormaAlterada;
  }

  format(name: string, value: any): void {
    if (name === EtaContainerTable.blotName) {
      this.domNode.setAttribute('style', EtaContainerTable.criarAtributoStyle(value));
    } else {
      super.format(name, value);
    }
  }

  ativarBorda(): void {
    this.domNode.classList.add('container__elemento--ativo');
  }

  desativarBorda(): void {
    this.domNode.classList.remove('container__elemento--ativo');
    this.limparContainerDireito();
  }

  limparContainerDireito(): void {
    if (this.blotInsideContainerDireito instanceof EtaBlotMenu) {
      this.blotInsideContainerDireito.remove();
      new EtaBlotEspaco().insertInto(this.containerDireito);
    }
  }

  private static criarAtributoStyle(elemento: Elemento): string {
    let style =
      elemento.tipo === 'Articulacao'
        ? `width: 100%; min-height: 1px; line-height: 0.42; margin: 1px`
        : `width: 100%; min-height: 26px; border: 1px solid #ffffff; line-height: 1.42; margin: 0px 2px 0px 5px !important;`;

    if (elemento.agrupador) {
      style = `${style} text-align: center;`;
    }

    return style;
  }
  private static getClasseCSS(elemento: Elemento): string {
    let classe = elemento.tipo === 'Articulacao' ? 'container__elemento--articulacao' : 'container__elemento--padrao';
    classe = `${classe} elemento-tipo-${elemento.tipo?.toLowerCase()}`;

    if (elemento.agrupador) {
      classe = `${classe} agrupador`;
    } else if (elemento.tipo === 'Ementa') {
      classe = `${classe} ementa`;
    } else {
      classe = `${classe} h-artigo`;
    }
    if (elemento.dispositivoAlteracao) {
      classe = `${classe} dispositivo-alteracao`;
    }
    return classe;
  }

  public isLinhaComMarcacaoDeExclusao(): boolean {
    return this.domNode.hasAttribute('excluido');
  }
}
