import { negrito } from '../../../assets/icons/icons';
import { TEXTO_OMISSIS } from '../../model/lexml/conteudo/textoOmissis';
import { Observable } from '../observable';
import { EtaBlot } from './eta-blot';
import { EtaBlotAbreAspas } from './eta-blot-abre-aspas';
import { EtaBlotConteudo } from './eta-blot-conteudo';
import { EtaBlotConteudoOmissis } from './eta-blot-conteudo-omissis';
import { EtaBlotEspaco } from './eta-blot-espaco';
import { EtaBlotExistencia } from './eta-blot-existencia';
import { EtaBlotFechaAspas } from './eta-blot-fecha-aspas';
import { EtaBlotMensagem } from './eta-blot-mensagem';
import { EtaBlotMensagens } from './eta-blot-mensagens';
import { EtaBlotMenu } from './eta-blot-menu';
import { EtaBlotMenuBotao } from './eta-blot-menu-botao';
import { EtaBlotMenuConteudo } from './eta-blot-menu-conteudo';
import { EtaBlotMenuItem } from './eta-blot-menu-item';
import { EtaBlotNotaAlteracao } from './eta-blot-nota-alteracao';
import { EtaBlotRotulo } from './eta-blot-rotulo';
import { EtaBlotTipoOmissis } from './eta-blot-tipo-omissis';
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
    return this.linhaAtual.blotConteudo ? this.getIndex(this.linhaAtual.blotConteudo) : 0;
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

    const icons = Quill.import('ui/icons');
    icons['bold'] = negrito;

    EtaQuill.register('modules/clipboard', EtaClipboard, true);
    EtaQuill.register('modules/keyboard', EtaKeyboard, true);
    EtaQuill.register(EtaBlotConteudoOmissis, true);
    EtaQuill.register(EtaBlotAbreAspas, true);
    EtaQuill.register(EtaBlotFechaAspas, true);
    EtaQuill.register(EtaBlotNotaAlteracao, true);
    EtaQuill.register(EtaBlotExistencia, true);
    EtaQuill.register(EtaBlotTipoOmissis, true);
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
    this.root.addEventListener('dragstart', (e: Event) => {
      e.preventDefault();
    });
    this.root.addEventListener('drop', (e: Event) => {
      e.preventDefault();
    });
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
      try {
        this.setSelection(index, 0, source);
      } catch (error) {
        this.setSelection(index - 1, 0, source);
      }
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
    linhaCursorAnt?.desativarBorda();
  }

  marcarLinhaAtual(linhaCursor: EtaContainerTable): void {
    if (linhaCursor && linhaCursor.tipo !== 'Articulacao') {
      this.atualizarLinhaCorrente(linhaCursor);
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

  private desmarcarLinhas(): void {
    document.querySelectorAll('.container__elemento--ativo').forEach(elemento => {
      const linha = this.getLinhaPorId(parseInt(elemento.id.substr(7), 0));
      linha.desativarBorda();
    });
  }

  private verificarMudouLinha(range: RangeStatic, oldRange?: RangeStatic): boolean {
    // correção bug: cursor se perde ao teclar ↑ na primeira linha
    if (oldRange && range?.index === 0 && range?.length === 0) {
      this.setSelection(oldRange.index, 0);
      return false;
    }

    if (range) {
      const blotCursor: EtaBlot = this.getLine(range.index)[0];
      const linhaCursor: EtaContainerTable = blotCursor.linha;

      if (
        blotCursor.tagName === EtaBlotRotulo.tagName ||
        blotCursor.tagName === EtaBlotEspaco.tagName ||
        blotCursor.tagName === EtaBlotMenu.tagName ||
        blotCursor.tagName === EtaBlotMensagens.tagName ||
        blotCursor.tagName === EtaBlotAbreAspas.tagName ||
        blotCursor.tagName === EtaBlotTipoOmissis.tagName ||
        blotCursor.tagName === EtaBlotExistencia.tagName
      ) {
        this.setSelection(this.getIndex(blotCursor.linha.blotConteudo), 0, Quill.sources.SILENT);
      } else if (blotCursor.tagName === EtaBlotFechaAspas.tagName || blotCursor.tagName === EtaBlotNotaAlteracao.tagName) {
        this.setSelection(this.getIndex(blotCursor.linha.blotFechaAspas) - 1, 0, Quill.sources.SILENT);
      }

      if (oldRange) {
        const blotCursorAnt: EtaBlot = this.getLine(oldRange.index)[0];

        if (blotCursorAnt) {
          const linhaCursorAnt: EtaContainerTable = blotCursorAnt.linha;

          if (linhaCursor === linhaCursorAnt) {
            return false;
          }
        }
      }

      this.desmarcarLinhas();
      this.marcarLinhaAtual(linhaCursor);
      return true;
    }
    return false;
  }

  observableSelectionChange = new Observable<EtaContainerTable>();
  private onSelectionChange: SelectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic): void => {
    // Guarda a linhaAtual corrente
    // OBS: o valor de "this.linhaAtual" será alterado dentro de "this.verificarMudouLinha" de acordo com alguns critérios.
    const linhaAtualAux = this.linhaAtual;

    this._mudouDeLinha = this.verificarMudouLinha(range, oldRange);

    if (this._mudouDeLinha) {
      this.observableSelectionChange.notify(linhaAtualAux);
      this.aspasAberta = false;
      this.limparHistory();
    }
  };

  private onTextChange: TextChangeHandler = (): void => {
    if (this._linhaAtual) {
      setTimeout(() => {
        this.linhaAtual.blotConteudo && this.acertarAspas();
      }, 0);
    }
  };

  private getHtmlElement(id: string): HTMLElement {
    return this.root.querySelector(`#${id}`) as HTMLElement;
  }

  private acertarAspas(): void {
    if (this._linhaAtual) {
      const index: number = this.inicioConteudoAtual;
      const texto: string = this.getText(index, this.linhaAtual?.blotConteudo.tamanho) ?? '';
      let posicaoTexto = index;

      if (texto.indexOf('"') > -1) {
        for (let i = 0; i < texto.length; i++) {
          if (texto[i] === '"') {
            posicaoTexto += i;
            this.deleteText(posicaoTexto, 1, Quill.sources.SILENT);
            this.insertText(posicaoTexto, this.aspasAberta ? '”' : '“', Quill.sources.SILENT);
            this.aspasAberta = !this.aspasAberta;
            posicaoTexto = index;
          }
        }
      }
    }
  }

  atualizarLinhaCorrente(linha: EtaContainerTable): void {
    this.processandoMudancaLinha = true;

    this._linhaAtual = linha;
    this._linhaAtual.blotConteudo.htmlAnt = this._linhaAtual.blotConteudo.html;
    linha.ativarBorda();
    this.scrollToElemento(linha.uuid);
  }

  private scrollToElemento(uuid: number): void {
    const el = this.getHtmlElement(EtaContainerTable.criarId(uuid));
    setTimeout(() => {
      if (!this.isInEtaBoxViewport(el)) {
        this.scrollIntoEtaBox(el);
        // el.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }, 0);
  }

  private scrollIntoEtaBox(el: HTMLElement): void {
    const offsetTopElement = el.offsetTop;
    el.closest('.ql-editor')?.scrollTo(0, offsetTopElement);
  }

  private isInEtaBoxViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();

    const lxEtaBox = el.closest('#lx-eta-box');
    const etaBoxHeight = lxEtaBox!.getBoundingClientRect().bottom;

    return rect.top >= 0 && rect.bottom <= etaBoxHeight;
  }

  cursorDeTextoEstaSobreLink(deslocamento = 0): boolean {
    const range: RangeStatic = this.getSelection(true);
    if (range) {
      const ops = this.getContents(range.index + deslocamento, 1).ops;
      return !ops || !ops[0] ? false : ops[0].attributes?.link;
    }
    return false;
  }

  cursorDeTextoEstaSobreOmissis(): boolean {
    const range: RangeStatic = this.getSelection(true);
    if (range) {
      const textBlot = this.getLeaf(range.index);
      return textBlot[0].text === TEXTO_OMISSIS;
    }
    return false;
  }
}
