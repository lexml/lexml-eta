import * as Y from 'yjs';
import { ORIGEM_LOCAL } from './sincronizadorEstrutural';
import { TEXTO_LOCAL } from './textoSincronizador';

// Fase 5a: undo por modo. Um único Y.UndoManager sobre o Y.Array "articulacao" — que contém, aninhados,
// os Y.Text por dispositivo e os meta. Só as ops LOCAIS (origins das Fases 2 e 3) são rastreadas, então
// o Ctrl+Z desfaz apenas as próprias mudanças (texto e estrutura). A inversa aplicada tem origin do
// próprio manager (≠ ORIGEM_LOCAL) ⇒ os observers dos sincronizadores a tratam como remota e re-projetam
// no Redux/Quill — undo re-entra pela porta das ops remotas, sem segundo caminho de aplicação (§3.6.2.e).

export class UndoColaboracao {
  private undoManager: Y.UndoManager;

  constructor(doc: Y.Doc) {
    this.undoManager = new Y.UndoManager(doc.getArray('articulacao'), {
      trackedOrigins: new Set<unknown>([ORIGEM_LOCAL, TEXTO_LOCAL]),
      captureTimeout: 0, // cada transação = 1 passo (ver também novaAcao); evita merges por tempo
    });
  }

  undo(): void {
    this.undoManager.undo();
  }

  redo(): void {
    this.undoManager.redo();
  }

  podeDesfazer(): boolean {
    return this.undoManager.canUndo();
  }

  podeRefazer(): boolean {
    return this.undoManager.canRedo();
  }

  // Separa a ação anterior da próxima — "1 ação do usuário = 1 passo de undo".
  novaAcao(): void {
    this.undoManager.stopCapturing();
  }

  destruir(): void {
    this.undoManager.destroy();
  }
}
