import { Awareness } from 'y-protocols/awareness';
import { RangeBlot } from './textoSincronizador';

// Fase 4a (núcleo testável): presença (quem está aqui) + cursores remotos, via o protocolo Awareness
// do Yjs (estado efêmero, não persiste no Y.Doc). Renderização visual (quill-cursors) e captura da
// seleção real ficam para a fiação browser.

export interface UsuarioPresenca {
  nome: string;
  id: string | number;
  sigla?: string;
  cor: string;
}

export interface CursorPresenca {
  gid: string;
  index: number; // índice LOCAL no Y.Text do dispositivo (não índice absoluto do Quill)
}

export interface EstadoPresenca {
  user: UsuarioPresenca;
  cursor: CursorPresenca | null;
}

const PALETA = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#008080', '#f032e6', '#9a6324'];

// Cor determinística por identidade — todos os clientes atribuem a mesma cor ao mesmo usuário.
export const corDeUsuario = (id: string | number): string => {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return PALETA[h % PALETA.length];
};

// Índice absoluto da seleção do Quill → cursor {gid, index} do blot que o contém (reusa os ranges da Fase 3).
export const indiceAbsolutoParaCursor = (indexAbs: number, ranges: RangeBlot[]): CursorPresenca | null => {
  for (const r of ranges) {
    if (indexAbs >= r.offset && indexAbs <= r.offset + r.tamanho) {
      return { gid: r.gid, index: indexAbs - r.offset };
    }
  }
  return null;
};

// Cursor {gid, index} → índice absoluto no Quill (null se o dispositivo não está renderizado).
export const cursorParaIndiceAbsoluto = (cursor: CursorPresenca, ranges: RangeBlot[]): number | null => {
  const r = ranges.find(x => x.gid === cursor.gid);
  return r ? r.offset + cursor.index : null;
};

// Gerencia o Awareness: publica a presença/cursor local e lê as presenças remotas.
// A identidade DEVE vir da validação server-side (token), nunca de params.usuario (anti-impersonação, §3.5).
export class PresencaSincronizador {
  constructor(private awareness: Awareness, private user: UsuarioPresenca) {}

  publicarCursor(cursor: CursorPresenca | null): void {
    this.awareness.setLocalState({ user: this.user, cursor });
  }

  // Presenças remotas (exclui o próprio cliente).
  presencas(): EstadoPresenca[] {
    const estados: EstadoPresenca[] = [];
    this.awareness.getStates().forEach((estado, clientId) => {
      if (clientId !== this.awareness.clientID && (estado as EstadoPresenca)?.user) {
        estados.push(estado as EstadoPresenca);
      }
    });
    return estados;
  }

  // "Quem está em qual dispositivo" — presença estrutural agregada por gid.
  presencasPorDispositivo(): Map<string, UsuarioPresenca[]> {
    const mapa = new Map<string, UsuarioPresenca[]>();
    this.presencas().forEach(p => {
      if (p.cursor) {
        (mapa.get(p.cursor.gid) ?? mapa.set(p.cursor.gid, []).get(p.cursor.gid)!).push(p.user);
      }
    });
    return mapa;
  }

  observar(cb: () => void): () => void {
    const fn = (): void => cb();
    this.awareness.on('change', fn);
    return () => this.awareness.off('change', fn);
  }

  destruir(): void {
    this.awareness.setLocalState(null);
  }
}
