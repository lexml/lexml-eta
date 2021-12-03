import { Observable } from '../observable';
import { EtaBlot } from './eta-blot';
import { EtaBlotConteudo } from './eta-blot-conteudo';
import { EtaBlotEspaco } from './eta-blot-espaco';
import { EtaBlotMensagem } from './eta-blot-mensagem';
import { EtaBlotMensagens } from './eta-blot-mensagens';
import { EtaBlotMenu } from './eta-blot-menu';
import { EtaBlotMenuBotao } from './eta-blot-menu-botao';
import { EtaBlotMenuConteudo } from './eta-blot-menu-conteudo';
import { EtaBlotMenuItem } from './eta-blot-menu-item';
import { EtaBlotRotulo } from './eta-blot-rotulo';
import { EtaClipboard } from './eta-clipboard';
import { EtaContainerTable } from './eta-container-table';
import { EtaContainerTdDireito } from './eta-container-td-direito';
import { EtaContainerTdEsquerdo } from './eta-container-td-esquerdo';
import { EtaContainerTr } from './eta-container-tr';
import { EtaKeyboard } from './eta-keyboard';
import { EtaQuillBuffer } from './eta-quill-buffer';

export interface TextoSelecionado {
  conteudo: string;
  quantidadeCR: number;
}

export class EtaQuill extends Quill {
  static readonly UNDO: string = 'undo';
  static readonly REDO: string = 'redo';

  private _mudouDeLinha?: boolean;
  get mudouDeLinha(): boolean {
    return this._mudouDeLinha ?? false;
  }

  private _linhaAnterior?: EtaContainerTable;
  get linhaAnterior(): EtaContainerTable {
    return this._linhaAnterior as EtaContainerTable;
  }

  private _linhaAtual?: EtaContainerTable;
  get linhaAtual(): EtaContainerTable {
    return this._linhaAtual as EtaContainerTable;
  }

  get inicioConteudoAtual(): number {
    return this.getIndex(this.linhaAtual.blotConteudo);
  }

  get fimConteudoAtual(): number {
    return this.inicioConteudoAtual + this.linhaAtual.blotConteudo.tamanho;
  }

  get textoSelecionado(): TextoSelecionado {
    const range: RangeStatic = this.getSelection(true) ?? { index: 0, length: 0 };
    const texto: string = this.getText().substr(range.index, range.length);
    return {
      conteudo: texto,
      quantidadeCR: texto.match(/(\n)/gi)?.length ?? 0,
    };
  }

  private _undoEstruturaVazio = true;
  get isUndoEstruturaVazio(): boolean {
    return this._undoEstruturaVazio;
  }

  set undoEstruturaVazio(undoVazio: boolean) {
    this._undoEstruturaVazio = undoVazio;
  }

  private _redoEstruturaVazio = true;
  get isRedoEstruturaVazio(): boolean {
    return this._redoEstruturaVazio;
  }

  set redoEstruturaVazio(redoVazio: boolean) {
    this._redoEstruturaVazio = redoVazio;
  }

  // Utilizado no modulo keyboard para anular eventos subrepostos durante o
  // processamento da mudança de elemento atual. Isso acontece quando o usuário
  // aperta as teclas que provocam a mudança de elemento muito rápido
  // (ArrowDown e ArrowUp).
  private _processandoMudancaLinha = false;
  get isProcessandoMudancaLinha(): boolean {
    return this._processandoMudancaLinha;
  }

  set processandoMudancaLinha(processando: boolean) {
    this._processandoMudancaLinha = processando;
  }

  undoRedoEstrutura: Observable<string> = new Observable<string>();
  elementoSelecionado: Observable<number> = new Observable<number>();

  private buffer: EtaQuillBuffer;
  private aspasAberta = false;

  static configurar(): void {
    const Parchment: any = EtaQuill.import('parchment');
    const id = new Parchment.Attributor.Attribute('id', 'id', { scope: Parchment.Scope.BLOCK });
    const paddingLeft = new Parchment.Attributor.Style('paddingLeft', 'padding-left', { scope: Parchment.Scope.BLOCK });
    const border = new Parchment.Attributor.Style('border', 'border', { scope: Parchment.Scope.BLOCK });
    const borderColor = new Parchment.Attributor.Style('borderColor', 'border-color', { scope: Parchment.Scope.BLOCK });
    const display = new Parchment.Attributor.Style('display', 'display', { scope: Parchment.Scope.BLOCK });
    const ariaLabel = new Parchment.Attributor.Style('aria-label', 'aria-label', { scope: Parchment.Scope.BLOCK });
    const DataRotulo = new Parchment.Attributor.Attribute('dataRotulo', 'data-rotulo', { scope: Parchment.Scope.BLOCK });

    EtaQuill.register('modules/clipboard', EtaClipboard, true);
    EtaQuill.register('modules/keyboard', EtaKeyboard, true);
    EtaQuill.register(EtaBlotConteudo, true);
    EtaQuill.register(EtaBlotEspaco, true);
    EtaQuill.register(EtaBlotMensagem, true);
    EtaQuill.register(EtaBlotMensagens, true);
    EtaQuill.register(EtaBlotMenuBotao, true);
    EtaQuill.register(EtaBlotMenuConteudo, true);
    EtaQuill.register(EtaBlotMenuItem, true);
    EtaQuill.register(EtaBlotMenu, true);
    EtaQuill.register(EtaBlotRotulo, true);
    EtaQuill.register(EtaContainerTable, true);
    EtaQuill.register(EtaContainerTdEsquerdo, true);
    EtaQuill.register(EtaContainerTdDireito, true);
    EtaQuill.register(EtaContainerTr, true);
    EtaQuill.register(id, true);
    EtaQuill.register(paddingLeft, true);
    EtaQuill.register(border, true);
    EtaQuill.register(borderColor, true);
    EtaQuill.register(display, true);
    EtaQuill.register(ariaLabel, true);
    EtaQuill.register(DataRotulo, true);
  }

  constructor(editorHtml: HTMLElement, bufferHtml: HTMLElement, op: QuillOptionsStatic) {
    super(editorHtml, op);
    this.on('text-change', this.onTextChange);
    this.on('selection-change', this.onSelectionChange);
    this.buffer = new EtaQuillBuffer(bufferHtml, {});
  }

  destroi(): void {
    this.off('text-change', this.onTextChange);
    this.off('selection-change', this.onSelectionChange);
    this.keyboard?.operacaoTecladoInvalida.clean();
    this.keyboard?.adicionaElementoTeclaEnter.clean();
  }

  getConteudoHtmlParteLinha(blotConteudo: EtaBlotConteudo, offset: number, tamanho: number): string {
    return this.buffer.getConteudoHtml(blotConteudo.html, offset, tamanho);
  }

  getPrimeiraLinha(): EtaContainerTable {
    return this.scroll.children.head;
  }

  getUltimaLinha(): EtaContainerTable {
    return this.scroll.children.tail;
  }

  getLinha(uuid: number, linha: EtaContainerTable = this.getPrimeiraLinha()): EtaContainerTable | undefined {
    if (linha.uuid === uuid) {
      return linha;
    }
    if (linha.next) {
      return this.getLinha(uuid, linha.next);
    } else {
      return undefined;
    }
  }

  getLinhaPorId(uuid: number): EtaContainerTable {
    return Quill.find(this.getHtmlElement(EtaContainerTable.criarId(uuid)), false);
  }

  setIndex(index: number, source: Sources = Quill.sources.USER): void {
    const range: RangeStatic = this.getSelection(true) ?? { index: 0, length: 0 };
    if (index !== range.index || range.length !== 0) {
      this.setSelection(index, 0, source);
    }
  }

  setConteudoLinha(blotConteudo: EtaBlotConteudo, delta: DeltaStatic, source?: Sources): void {
    let index = this.getIndex(blotConteudo);

    if (blotConteudo.length() > 1) {
      this.deleteText(index, blotConteudo.length() - 1, source ?? Quill.sources.SILENT);
    }
    this.insertText(index, ' ', Quill.sources.SILENT);

    delta.ops?.forEach((op: DeltaOperation): void => {
      if (op.attributes) {
        this.insertText(index, op.insert, op.attributes, source ?? Quill.sources.SILENT);
      } else {
        this.insertText(index, op.insert, source ?? Quill.sources.SILENT);
      }
      index += op.insert.length;
    });
    this.deleteText(index, 1, Quill.sources.SILENT);
  }

  converterHtmlParaDelta(html: string): DeltaStatic {
    return this.buffer.converterHtmlParaDelta(html);
  }

  converterDeltaParaHtml(delta: DeltaStatic): string {
    return this.buffer.converterDeltaParaHtml(delta);
  }

  irProximaLinha(): void {
    const index: number = this.getIndex(this._linhaAtual?.next.blotConteudo);
    this.setSelection(index, 0);
  }

  desmarcarLinhaAtual(linhaCursorAnt: EtaContainerTable): void {
    this._linhaAnterior = linhaCursorAnt;
    linhaCursorAnt.desativarBorda();
  }

  marcarLinhaAtual(linhaCursor: EtaContainerTable): void {
    if (linhaCursor.tipo !== 'Articulacao') {
      this.processandoMudancaLinha = true;
      this._linhaAtual = linhaCursor;
      this._linhaAtual.blotConteudo.htmlAnt = this._linhaAtual.blotConteudo.html;
      linhaCursor.ativarBorda();
      this.elementoSelecionado.notify(linhaCursor.uuid);
    }
  }

  undo(): void {
    if (this.history.stack.undo.length === 0) {
      if (!this.isUndoEstruturaVazio) {
        this.undoRedoEstrutura.notify(EtaQuill.UNDO);
      }
    } else {
      this.history.undo();
      this.focus();
    }
  }

  redo(): void {
    if (this.history.stack.redo.length === 0) {
      if (!this.isRedoEstruturaVazio) {
        this.undoRedoEstrutura.notify(EtaQuill.REDO);
      }
    } else {
      this.history.redo();
      this.focus();
    }
  }

  limparHistory(): void {
    setTimeout(() => {
      this.history.clear();
    }, 0);
  }

  private verificarMudouLinha(range: RangeStatic, oldRange?: RangeStatic): boolean {
    if (range) {
      const blotCursor: EtaBlot = this.getLine(range.index)[0];
      const linhaCursor: EtaContainerTable = blotCursor.linha;

      // correção bug: cursor se perde ao teclar ↑ na primeira linha
      if (oldRange && range.index === 0 && range.length === 0) {
        const cursorAnt: EtaBlot = this.getLine(oldRange.index)[0];
        this.setSelection(this.getIndex(cursorAnt), 0, Quill.sources.SILENT);
        return false;
      }

      if (
        blotCursor.tagName === EtaBlotRotulo.tagName ||
        blotCursor.tagName === EtaBlotEspaco.tagName ||
        blotCursor.tagName === EtaBlotMenu.tagName ||
        blotCursor.tagName === EtaBlotMensagens.tagName
      ) {
        this.setSelection(this.getIndex(blotCursor.linha.blotConteudo), 0, Quill.sources.SILENT);
      }

      if (oldRange) {
        const blotCursorAnt: EtaBlot = this.getLine(oldRange.index)[0];

        if (blotCursorAnt) {
          const linhaCursorAnt: EtaContainerTable = blotCursorAnt.linha;

          if (linhaCursor === linhaCursorAnt) {
            return false;
          }
          this.desmarcarLinhaAtual(linhaCursorAnt);
        }
      }
      this.marcarLinhaAtual(linhaCursor);
      return true;
    }
    return false;
  }

  private onSelectionChange: SelectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic): void => {
    this._mudouDeLinha = this.verificarMudouLinha(range, oldRange);
    if (this._mudouDeLinha) {
      this.aspasAberta = false;
      this.limparHistory();
    }
  };

  private onTextChange: TextChangeHandler = (): void => {
    if (this._linhaAtual) {
      setTimeout(() => {
        this.acertarAspas();
      }, 0);
    }
  };

  private getHtmlElement(id: string): HTMLElement {
    return this.root.querySelector(`#${id}`) as HTMLElement;
  }

  private acertarAspas(): void {
    if (this._linhaAtual) {
      let index: number = this.inicioConteudoAtual;
      const texto: string = this.getText(index, this.linhaAtual?.blotConteudo.tamanho) ?? '';

      if (texto.indexOf('"') > -1) {
        for (let i = 0; i < texto.length; i++) {
          if (texto[i] === '"') {
            index += i;
            this.deleteText(index, 1, Quill.sources.SILENT);
            this.insertText(index, this.aspasAberta ? '”' : '“', Quill.sources.SILENT);
            this.aspasAberta = !this.aspasAberta;
          }
        }
      }
    }
  }
}
