import { generateUUID } from '../util/uuid';

// Identidade global (gid) da camada de colaboração + a tabela de tradução gid↔uuid local.
// O gid é a identidade estável do dispositivo no CRDT; o uuid numérico continua sendo o índice
// local que o editor/Quill usam. A GidRegistry é o tradutor na fronteira da colaboração.

// gid de dispositivo criado ao vivo: aleatório e globalmente único (imune a colisão entre clientes).
// Fallback para generateUUID quando crypto.randomUUID não existe (contexto http não-seguro) —
// a fábrica roda sempre, inclusive com colaboração OFF, então não pode depender de secure context.
export const gidAleatorio = (): string => {
  const c = globalThis.crypto;
  return c && typeof c.randomUUID === 'function' ? c.randomUUID() : generateUUID();
};

// gid determinístico usado no seed: função pura do índice na ordem canônica.
// Dois seeds independentes do mesmo documento-base geram os mesmos gids → Y.Doc byte-idêntico.
export const gidDeterministico = (indice: number): string => `s:${String(indice).padStart(6, '0')}`;

export class GidRegistry {
  private porGid = new Map<string, number>();
  private porUuid = new Map<number, string>();

  registrar(gid: string, uuid: number): void {
    this.porGid.set(gid, uuid);
    this.porUuid.set(uuid, gid);
  }

  uuidDe(gid: string): number | undefined {
    return this.porGid.get(gid);
  }

  gidDe(uuid: number): string | undefined {
    return this.porUuid.get(uuid);
  }

  limpar(): void {
    this.porGid.clear();
    this.porUuid.clear();
  }

  get tamanho(): number {
    return this.porGid.size;
  }
}
