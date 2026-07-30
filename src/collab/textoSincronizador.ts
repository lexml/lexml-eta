import * as Y from 'yjs';
import { OpDelta, paraDeltaQuill, recortarParaYText } from './textoBinding';

// Fase 3a: roteia edições de texto entre o Quill e os Y.Text por dispositivo. O manager é puro (só yjs
// + tradutores); o Quill entra por injeção (EditorTextoColab), para ser testável headless com um fake.

export const TEXTO_LOCAL = 'texto-local';

export interface RangeBlot {
  gid: string;
  offset: number; // índice absoluto onde o blotConteudo começa no Quill
  tamanho: number;
}

export interface EditorTextoColab {
  // ranges das linhas atualmente renderizadas (blots de conteúdo)
  rangesRenderizados(): RangeBlot[];
  // aplica ops ao Quill em coordenadas absolutas, de forma 'silent' (não redispara onTextChange como 'user')
  aplicarDeltaSilent(ops: OpDelta[]): void;
}

type YArrayDisp = Y.Array<Y.Map<unknown>>;

export class TextoSincronizador {
  private arr: YArrayDisp;
  private observers = new Map<string, { yText: Y.Text; fn: (e: Y.YTextEvent, tx: Y.Transaction) => void }>();
  private aplicandoRemoto = false;

  constructor(private doc: Y.Doc, private editor: EditorTextoColab) {
    this.arr = doc.getArray<Y.Map<unknown>>('articulacao');
  }

  // Chamado pelo onTextChange do Quill (apenas source='user'): empurra o delta para os Y.Text.
  onDeltaLocal(delta: OpDelta[]): void {
    if (this.aplicandoRemoto) {
      return; // anti-eco: delta que eu mesmo apliquei a partir do remoto
    }
    const ranges = this.editor.rangesRenderizados();
    this.doc.transact(() => {
      ranges.forEach(({ gid, offset, tamanho }) => {
        const ops = recortarParaYText(delta, offset, tamanho);
        if (ops.length) {
          this.yTextDe(gid)?.applyDelta(ops);
        }
      });
    }, TEXTO_LOCAL);
  }

  // (Re)liga os observers dos Y.Text das linhas renderizadas — chamar ao renderizar/trocar de página.
  observarRenderizados(): void {
    this.desobservar();
    this.editor.rangesRenderizados().forEach(({ gid }) => {
      const yText = this.yTextDe(gid);
      if (!yText) {
        return;
      }
      const fn = (evento: Y.YTextEvent, tx: Y.Transaction): void => this.onYTextChange(gid, evento, tx);
      yText.observe(fn);
      this.observers.set(gid, { yText, fn });
    });
  }

  private onYTextChange(gid: string, evento: Y.YTextEvent, tx: Y.Transaction): void {
    if (tx.origin === TEXTO_LOCAL) {
      return; // é o eco da minha própria edição local
    }
    const range = this.editor.rangesRenderizados().find(r => r.gid === gid);
    if (!range) {
      return; // dispositivo não está renderizado; Y.Text segue vivo, só não pinta
    }
    const ops = paraDeltaQuill(evento.delta as OpDelta[], range.offset);
    this.aplicandoRemoto = true;
    try {
      this.editor.aplicarDeltaSilent(ops);
    } finally {
      this.aplicandoRemoto = false;
    }
  }

  private yTextDe(gid: string): Y.Text | undefined {
    const m = this.arr.toArray().find(x => x.get('gid') === gid);
    return m?.get('conteudo') as Y.Text | undefined;
  }

  desobservar(): void {
    this.observers.forEach(({ yText, fn }) => yText.unobserve(fn));
    this.observers.clear();
  }
}
