import { cancelarPropagacaoDoEvento } from '../event-util';
import { Observable } from '../observable';
import { EtaContainerTable } from './eta-container-table';
import { EtaQuill, TextoSelecionado } from './eta-quill';

export const CaracteresValidos = /([a-zA-Z0-9áéíóúÁÉÍÓÚãẽĩõũÃẼĨÕŨàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇýÝỹỸỳỲÿŸŶŷñÑ '!@#$%&*()_\-+=`'{[^~}\]<,>.:;?/|\\ªº¹²³£¢¬§¿¡“”])/i;
export const CaracteresNaoValidos = /([^a-zA-Z0-9áéíóúÁÉÍÓÚãẽĩõũÃẼĨÕŨàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇýÝỹỸỳỲÿŸŶŷñÑ '!@#$%&*()_\-+=`'{[^~}\]<,>.:;?/|\\ªº¹²³£¢¬§¿¡“”])/gi;

export const Keyboard = Quill.import('modules/keyboard');

export class EtaKeyboard extends Keyboard {
  operacaoTecladoInvalida: Observable<void> = new Observable<void>();
  adicionaElementoTeclaEnter: Observable<RangeStatic> = new Observable<RangeStatic>();
  removeElemento: Observable<void> = new Observable<void>();
  removeElementoSemTexto: Observable<string> = new Observable<string>();
  renumeraElemento: Observable<KeyboardEvent> = new Observable<KeyboardEvent>();
  transformaElemento: Observable<KeyboardEvent> = new Observable<KeyboardEvent>();
  moveElemento: Observable<KeyboardEvent> = new Observable<KeyboardEvent>();
  onChange: Observable<string> = new Observable<string>();
  toggleExistencia: Observable<KeyboardEvent> = new Observable<KeyboardEvent>();

  private altGraphPressionado = false;

  constructor(quill: EtaQuill, options: any) {
    super(quill, options);
  }

  listen(): void {
    this.quill.root.addEventListener('keyup', (ev: KeyboardEvent): void => {
      if (ev.key === 'AltGraph') {
        this.altGraphPressionado = false;
      }

      // Trata atalhos de formatação (negrito, itálico, ...)
      if (ev.ctrlKey && !ev.altKey && !ev.shiftKey && 'biBI'.includes(ev.key)) {
        this.onHotKeyToolbar();
        return;
      }

      if (!(this.quill.cursorDeTextoEstaSobreLink() || (ev.key === 'Backspace' && this.quill.cursorDeTextoEstaSobreLink(-1))) && this.isTeclaQueAlteraTexto(ev)) {
        this.onChange.notify('keyboard');
      }
    });

    this.quill.root.addEventListener('keydown', (ev: KeyboardEvent): void => {
      if (ev.key === 'AltGraph') {
        this.altGraphPressionado = true;
      }

      if (this.quill.cursorDeTextoEstaSobreLink() && this.quill.cursorDeTextoEstaSobreLink(-1) && !['Delete', 'Backspace'].includes(ev.key)) {
        if ((!ev.ctrlKey && ev.key.length === 1) || (ev.ctrlKey && 'xvXV'.includes(ev.key)) || (ev.altKey && '0123456789'.includes(ev.key)) || ev.key === 'Enter') {
          cancelarPropagacaoDoEvento(ev);
          return;
        }
      } else if (this.verificaSelecaoComLink()) {
        cancelarPropagacaoDoEvento(ev);
        return;
      } else if (
        this.quill.cursorDeTextoEstaSobreOmissis() &&
        !['Delete', 'Backspace'].includes(ev.key) &&
        (this.isTeclaQueAlteraTexto(ev) || ev.key === 'Enter' || ev.altKey) &&
        !ev.ctrlKey
      ) {
        if (ev.key === 'Enter') {
          this.enterEmOmissis();
        }
        cancelarPropagacaoDoEvento(ev);
        return;
      } else if (ev.ctrlKey) {
        if (!ev.altKey && !ev.metaKey) {
          if (['Delete', 'Backspace'].includes(ev.key)) {
            cancelarPropagacaoDoEvento(ev);
          } else if (ev.key === 'Home') {
            this.onTeclaHome(ev);
          } else if (ev.key === 'End') {
            this.onTeclaEnd(ev);
          } else if (ev.key.toLowerCase() === 'a' && !ev.shiftKey) {
            this.onTeclaCtrlA(ev);
          } else if (ev.key.toLowerCase() === 'd') {
            this.onTeclaCtrlD(ev);
          } else if (ev.key.toLowerCase() === 'z') {
            this.onTeclaCtrlZ(ev);
          } else if (ev.key.toLowerCase() === 'y') {
            this.onTeclaCtrlY(ev);
          } else if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === 'a') {
            this.onTeclaCtrlShiftA(ev);
          } else if (ev.key === 'b' || ev.key === 'i' || ev.key === 'x' || ev.key === 'v') {
            this.onValidarTecla(ev);
          }
        }
        if (ev.altKey || ev.metaKey) {
          if (['a', 'l', 'n', 'o', 'p', 't'].includes(ev.key.toLowerCase())) {
            this.onHotKeyTransformacaoTipo(ev);
          } else if (['r', '®'].includes(ev.key.toLowerCase())) {
            this.onHotKeyRenumeraDispositivo(ev);
          } else if (['x', '≈'].includes(ev.key.toLowerCase())) {
            this.onHotKeyToggleExistencia(ev);
          }
          // Trata caracteres especiais da tecla Alt mo MacOS/Chrome
          // para os atalhos a, l, n, o, p, t
          if (['229', '172', '68', '248', '960', '8224'].includes(ev.key.charCodeAt(0).toString())) {
            let keyFake = '';
            switch (ev.key.charCodeAt(0).toString()) {
              case '229':
                keyFake = 'a';
                break;
              case '172':
                keyFake = 'l';
                break;
              case '68':
                keyFake = 'n';
                break;
              case '248':
                keyFake = 'o';
                break;
              case '960':
                keyFake = 'p';
                break;
              case '8224':
                keyFake = 't';
                break;
            }
            if (keyFake) {
              // Cria um evento para manipular a tecla pressionada
              const keyDownFake = new KeyboardEvent('keydown', {
                key: keyFake,
              });
              this.onHotKeyTransformacaoTipo(keyDownFake);
            }
          }
        }
      } else if (ev.altKey) {
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
          this.onHotKeyMover(ev);
        }
      } else if (ev.key === 'ArrowRight') {
        this.onTeclaArrowRight(ev);
      } else if (ev.key === 'ArrowLeft') {
        this.onTeclaArrowLeft(ev);
      } else if (ev.key === 'ArrowDown') {
        this.onTeclaArrowDown(ev);
      } else if (ev.key === 'ArrowUp') {
        this.onTeclaArrowUp(ev);
      } else if (ev.key === 'Enter') {
        this.onTeclaEnter(ev);
      } else if (ev.key === 'Escape') {
        this.onTeclaEscape(ev);
      } else if (ev.key === 'Delete') {
        this.onTeclaDelete(ev);
      } else if (ev.key === 'Backspace') {
        this.onTeclaBackspace(ev);
      } else if (ev.key === 'Tab') {
        this.onTeclaTab(ev);
      } else if (ev.key.length === 1 && CaracteresValidos.test(ev.key)) {
        this.onValidarTecla(ev);
      }
    });
    super.listen();
  }

  private isTeclaComCaracterGrafico(ev: KeyboardEvent): boolean {
    const teclasComCaracterGrafico = '123456=[]/';
    const DOM_KEY_LOCATION_NUMPAD = 3; //
    return ev.location !== DOM_KEY_LOCATION_NUMPAD && teclasComCaracterGrafico.includes(ev.key);
  }

  private isTeclaQueAlteraTexto(ev: KeyboardEvent): boolean {
    // Se teclas Ctrl, Alt ou Meta(?) estiverem pressionadas não faz nada
    // Atalhos para recortar e colar serão tratados em outro lugar
    if (ev.ctrlKey || ev.altKey || ev.metaKey) {
      return false;
    }

    if (this.altGraphPressionado && !this.isTeclaComCaracterGrafico(ev)) {
      return false;
    }

    // Verifica se é um caracter que altera texto
    // OBS: 'Enter' não será tratado porque essa tecla cria um novo elemento e esta ação irá disparar
    //      um evento onchange por conta própria.
    if (['Delete', 'Backspace'].includes(ev.key) || ev.key.length === 1) {
      return true;
    }

    return false;
  }

  verificarOperacaoTecladoPermitida(): boolean {
    const textoSelec: TextoSelecionado = this.quill.textoSelecionado;
    if (textoSelec.conteudo) {
      if (textoSelec.quantidadeCR > 0) {
        if (textoSelec.quantidadeCR === 1 && /\n$/gi.test(textoSelec.conteudo)) {
          const range: RangeStatic = this.quill.getSelection(true);
          this.quill.setSelection(range.index, range.length - 1, Quill.sources.API);
          return true;
        } else {
          this.operacaoTecladoInvalida.notify();
          return false;
        }
      }
    }
    return true;
  }

  private onTeclaArrowRight(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    const [blotCursor, offset] = this.quill.getLine(range.index);

    if (offset === blotCursor.tamanho) {
      if (blotCursor.linha.next) {
        this.quill.setIndex(this.quill.getIndex(blotCursor.linha.next.blotConteudo), Quill.sources.USER);
      }
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaArrowLeft(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    const [blotCursor, offset] = this.quill.getLine(range.index);

    if (offset === 0) {
      if (blotCursor.linha.prev) {
        const linhaAnt: EtaContainerTable = blotCursor.linha.prev;
        const index: number = this.quill.getIndex(linhaAnt.blotConteudo) + linhaAnt.blotConteudo.tamanho;
        this.quill.setIndex(index, Quill.sources.USER);
      }
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaArrowUp(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    const [blotCursor, offset] = this.quill.getLine(range.index);

    if (offset === 0 || this.quill.cursorDeTextoEstaSobreOmissis()) {
      if (blotCursor.linha.prev) {
        const linhaAnt: EtaContainerTable = blotCursor.linha.prev;
        const index: number = this.quill.getIndex(linhaAnt.blotConteudo) + linhaAnt.blotConteudo.tamanho;
        this.quill.setIndex(index, Quill.sources.USER);
      }
      cancelarPropagacaoDoEvento(ev);
    }

    if (this.quill.isProcessandoMudancaLinha) {
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaArrowDown(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    const [blotCursor, offset] = this.quill.getLine(range.index);

    if (offset === blotCursor.tamanho || this.quill.cursorDeTextoEstaSobreOmissis()) {
      if (blotCursor.linha.next) {
        this.quill.setIndex(this.quill.getIndex(blotCursor.linha.next.blotConteudo), Quill.sources.USER);
      }
      cancelarPropagacaoDoEvento(ev);
    }

    if (this.quill.isProcessandoMudancaLinha) {
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaEnter(ev: KeyboardEvent): void {
    if (this.verificarOperacaoTecladoPermitida() && !this.quill.cursorDeTextoEstaSobreLink(-1)) {
      const range: RangeStatic = this.quill.getSelection(true);
      this.quill.setSelection(range.index, 0, Quill.sources.SILENT);
      this.adicionaElementoTeclaEnter.notify(range);
    }
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaEscape(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    this.quill.setIndex(range.index, Quill.sources.SILENT);
    this.quill.setSelection(this.quill.inicioConteudoAtual, 0, Quill.sources.SILENT);
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaDelete(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    if (!this.quill.linhaAtual.blotConteudo.html) {
      cancelarPropagacaoDoEvento(ev);
      this.removeElementoSemTexto.notify(ev.key);
    } else if (!this.verificarOperacaoTecladoPermitida() || range.index === this.quill.fimConteudoAtual) {
      cancelarPropagacaoDoEvento(ev);
    } else if (this.quill.cursorDeTextoEstaSobreLink()) {
      let posicao = this.quill.getSelection().index;
      if (!this.quill.cursorDeTextoEstaSobreLink(-1)) {
        posicao += 1;
      }
      this.apagaTextoNaPosicao(posicao);
      cancelarPropagacaoDoEvento(ev);
    } else if (this.quill.cursorDeTextoEstaSobreOmissis()) {
      this.quill.linhaAtual.domNode.classList.remove('container_elemento--omissis');
      const posicao = this.quill.getSelection().index;
      this.apagaTextoNaPosicao(posicao);
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaBackspace(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    if (!this.quill.linhaAtual.blotConteudo.html) {
      cancelarPropagacaoDoEvento(ev);
      this.removeElementoSemTexto.notify(ev.key);
    } else if (!this.verificarOperacaoTecladoPermitida() || (range.index === this.quill.inicioConteudoAtual && range.length === 0)) {
      cancelarPropagacaoDoEvento(ev);
    } else if (this.quill.cursorDeTextoEstaSobreLink(-1)) {
      const posicao = this.quill.getSelection().index;
      this.apagaTextoNaPosicao(posicao);
      cancelarPropagacaoDoEvento(ev);
    } else if (this.quill.cursorDeTextoEstaSobreOmissis()) {
      this.quill.linhaAtual.domNode.classList.remove('container_elemento--omissis');
      const posicao = this.quill.getSelection().index;
      this.apagaTextoNaPosicao(posicao);
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onValidarTecla(ev: KeyboardEvent): void {
    if (!this.verificarOperacaoTecladoPermitida()) {
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaHome(ev: KeyboardEvent): void {
    const index: number = this.quill.getIndex(this.quill.getPrimeiraLinha().blotConteudo);
    this.quill.setIndex(index, Quill.sources.USER);
    this.quill.scroll.domNode.scrollTo(0, 0);
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaEnd(ev: KeyboardEvent): void {
    const index: number = this.quill.getIndex(this.quill.getUltimaLinha().blotConteudo) + this.quill.getUltimaLinha().blotConteudo?.tamanho ?? 0;
    this.quill.setIndex(index, Quill.sources.USER);
    this.quill.scroll.domNode.scrollTo(0, this.quill.scroll.domNode.scrollHeight);
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaCtrlD(ev: KeyboardEvent): void {
    this.removeElemento.notify();
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaTab(ev: KeyboardEvent): void {
    this.transformaElemento.notify(ev);
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaCtrlZ(ev: KeyboardEvent): void {
    this.quill.undo();
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaCtrlY(ev: KeyboardEvent): void {
    this.quill.redo();
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaCtrlA(ev: KeyboardEvent): void {
    const index: number = this.quill.getIndex(this.quill.scroll.children.head.blotConteudo);
    this.quill.setSelection(index, this.quill.getLength(), Quill.sources.SILENT);
    cancelarPropagacaoDoEvento(ev);
  }

  private onTeclaCtrlShiftA(ev: KeyboardEvent): void {
    this.quill.setSelection(this.quill.inicioConteudoAtual, this.quill.linhaAtual.blotConteudo.tamanho, Quill.sources.SILENT);
    cancelarPropagacaoDoEvento(ev);
  }

  private onHotKeyRenumeraDispositivo(ev: KeyboardEvent): void {
    this.renumeraElemento.notify(ev);
    cancelarPropagacaoDoEvento(ev);
  }

  private onHotKeyMover(ev: KeyboardEvent): void {
    this.moveElemento.notify(ev);
    cancelarPropagacaoDoEvento(ev);
  }

  private onHotKeyTransformacaoTipo(ev: KeyboardEvent): void {
    this.transformaElemento.notify(ev);
    cancelarPropagacaoDoEvento(ev);
  }

  private onHotKeyToolbar(): void {
    const texto = document.getSelection()?.toString();
    if (texto) {
      this.onChange.notify('toolbar(hotkey)');
    }
  }

  private onHotKeyToggleExistencia(ev: KeyboardEvent): void {
    this.toggleExistencia.notify(ev);
    cancelarPropagacaoDoEvento(ev);
  }

  private verificaSelecaoComLink(): boolean {
    const range: RangeStatic = this.quill.getSelection(true);
    let iniciaOuTerminaComLink = false;
    const ops = this.quill.getContents(range).ops;
    if (ops[0]?.attributes?.link || ops[ops.length - 1]?.attributes?.link) {
      iniciaOuTerminaComLink = true;
    }
    return iniciaOuTerminaComLink;
  }

  private apagaTextoNaPosicao(posicao: number): void {
    const [leaf, offset] = this.quill.getLeaf(posicao);
    this.quill.deleteText(posicao - offset, leaf.text.length);
  }

  private enterEmOmissis(): void {
    if (this.verificarOperacaoTecladoPermitida()) {
      const range: RangeStatic = this.quill.getSelection(true);
      const inicioLinha = this.quill.getIndex(this.quill.linhaAtual.blotConteudo);
      const tamanho = this.quill.linhaAtual.blotConteudo.length();

      if (range.index !== inicioLinha) {
        range.index = inicioLinha + tamanho - 1;
      }
      this.adicionaElementoTeclaEnter.notify(range);
    }
  }
}
