import { cancelarPropagacaoDoEvento } from '../event';
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
  renumeraElemento: Observable<KeyboardEvent> = new Observable<KeyboardEvent>();
  transformaElemento: Observable<KeyboardEvent> = new Observable<KeyboardEvent>();

  constructor(quill: EtaQuill, options: any) {
    super(quill, options);
  }

  listen(): void {
    this.quill.root.addEventListener('keyup', (ev: KeyboardEvent): void => {
      if (ev.ctrlKey && ev.altKey) {
        if (['a', 'i', 'l', 'o', 'p', 't'].includes(ev.key)) {
          this.onHotKeyTransformacaoTipo(ev);
        } else if (ev.key === 'r') {
          this.onHotKeyRenumeraDispositivo(ev);
        }
      }
    });
    this.quill.root.addEventListener('keydown', (ev: KeyboardEvent): void => {
      if (ev.key === 'ArrowRight') {
        this.onTeclaArrowRight(ev);
      } else if (ev.key === 'ArrowLeft') {
        this.onTeclaArrowLeft(ev);
      } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        this.onTeclaArrowDownOuUp(ev);
      } else if (ev.keyCode === Keyboard.keys.ENTER) {
        this.onTeclaEnter(ev);
      } else if (ev.keyCode === Keyboard.keys.ESCAPE) {
        this.onTeclaEscape(ev);
      } else if (ev.keyCode === Keyboard.keys.DELETE) {
        this.onTeclaDelete(ev);
      } else if (ev.keyCode === Keyboard.keys.BACKSPACE) {
        this.onTeclaBackspace(ev);
      } else if (ev.keyCode === Keyboard.keys.TAB) {
        this.onTeclaTab(ev);
      }
      if (ev.ctrlKey && !ev.altKey) {
        if (ev.key === 'Home') {
          this.onTeclaHome(ev);
        } else if (ev.key === 'End') {
          this.onTeclaEnd(ev);
        } else if (ev.key === 'a') {
          this.onTeclaCtrlA(ev);
        } else if (ev.key === 'd') {
          this.onTeclaCtrlD(ev);
        } else if (ev.key === 'z') {
          this.onTeclaCtrlZ(ev);
        } else if (ev.key === 'y') {
          this.onTeclaCtrlY(ev);
        } else if (ev.ctrlKey && ev.key === 'A') {
          this.onTeclaCtrlShiftA(ev);
        } else if (ev.key === 'b' || ev.key === 'i' || ev.key === 'x' || ev.key === 'v') {
          this.onValidarTecla(ev);
        }
      } else {
        if (ev.key.length === 1 && CaracteresValidos.test(ev.key)) {
          this.onValidarTecla(ev);
        }
      }
    });
    super.listen();
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

  private onTeclaArrowDownOuUp(ev: KeyboardEvent): void {
    if (this.quill.isProcessandoMudancaLinha) {
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaEnter(ev: KeyboardEvent): void {
    if (this.verificarOperacaoTecladoPermitida()) {
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
    if (!this.verificarOperacaoTecladoPermitida() || range.index === this.quill.fimConteudoAtual) {
      cancelarPropagacaoDoEvento(ev);
    }
  }

  private onTeclaBackspace(ev: KeyboardEvent): void {
    const range: RangeStatic = this.quill.getSelection(true);
    if (!this.verificarOperacaoTecladoPermitida() || (range.index === this.quill.inicioConteudoAtual && range.length === 0)) {
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
    const index: number = this.quill.getIndex(this.quill.getUltimaLinha().blotConteudo);
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

  private onHotKeyTransformacaoTipo(ev: KeyboardEvent): void {
    this.transformaElemento.notify(ev);
    cancelarPropagacaoDoEvento(ev);
  }
}
