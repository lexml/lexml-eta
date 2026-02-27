import { RemissaoInterna, AtualizacaoRemissao } from './remissao';

export class RemissaoRegistry {
  private referenciasPorOrigem: Map<number, RemissaoInterna[]> = new Map();
  private referenciasPorDestino: Map<string, RemissaoInterna[]> = new Map();
  private todasReferencias: RemissaoInterna[] = [];

  adicionar(remissao: RemissaoInterna): void {
    this.todasReferencias.push(remissao);

    const porOrigem = this.referenciasPorOrigem.get(remissao.elementoOrigemUuid) || [];
    porOrigem.push(remissao);
    this.referenciasPorOrigem.set(remissao.elementoOrigemUuid, porOrigem);

    const porDestino = this.referenciasPorDestino.get(remissao.dispositivoDestinoId) || [];
    porDestino.push(remissao);
    this.referenciasPorDestino.set(remissao.dispositivoDestinoId, porDestino);
  }

  remover(refId: string): boolean {
    const index = this.todasReferencias.findIndex(r => r.id === refId);
    if (index === -1) {
      return false;
    }

    const remissao = this.todasReferencias[index];

    this.todasReferencias.splice(index, 1);

    const porOrigem = this.referenciasPorOrigem.get(remissao.elementoOrigemUuid);
    if (porOrigem) {
      const idx = porOrigem.findIndex(r => r.id === refId);
      if (idx !== -1) {
        porOrigem.splice(idx, 1);
        if (porOrigem.length === 0) {
          this.referenciasPorOrigem.delete(remissao.elementoOrigemUuid);
        }
      }
    }

    const porDestino = this.referenciasPorDestino.get(remissao.dispositivoDestinoId);
    if (porDestino) {
      const idx = porDestino.findIndex(r => r.id === refId);
      if (idx !== -1) {
        porDestino.splice(idx, 1);
        if (porDestino.length === 0) {
          this.referenciasPorDestino.delete(remissao.dispositivoDestinoId);
        }
      }
    }

    return true;
  }

  getReferenciasPorOrigem(elementoOrigemUuid: number): RemissaoInterna[] {
    return this.referenciasPorOrigem.get(elementoOrigemUuid) || [];
  }

  getReferenciasPorDestino(dispositivoDestinoId: string): RemissaoInterna[] {
    return this.referenciasPorDestino.get(dispositivoDestinoId) || [];
  }

  getReferenciaPorId(refId: string): RemissaoInterna | undefined {
    return this.todasReferencias.find(r => r.id === refId);
  }

  getTodasReferencias(): RemissaoInterna[] {
    return [...this.todasReferencias];
  }

  atualizarDestino(oldId: string, newId: string, newUuid: number): RemissaoInterna[] {
    const referencias = this.referenciasPorDestino.get(oldId);
    if (!referencias || referencias.length === 0) {
      return [];
    }

    referencias.forEach(ref => {
      ref.dispositivoDestinoId = newId;
      ref.dispositivoDestinoUuid = newUuid;
    });

    this.referenciasPorDestino.delete(oldId);
    this.referenciasPorDestino.set(newId, referencias);

    return [...referencias];
  }

  marcarComoInvalidas(dispositivoDestinoId: string): RemissaoInterna[] {
    const referencias = this.referenciasPorDestino.get(dispositivoDestinoId);
    if (!referencias) {
      return [];
    }

    referencias.forEach(ref => {
      ref.valida = false;
    });

    return [...referencias];
  }

  restaurarReferencias(dispositivoDestinoId: string, novoUuid: number): RemissaoInterna[] {
    const referencias = this.referenciasPorDestino.get(dispositivoDestinoId);
    if (!referencias) {
      return [];
    }

    referencias.forEach(ref => {
      ref.valida = true;
      ref.dispositivoDestinoUuid = novoUuid;
    });

    return [...referencias];
  }

  removerReferenciasPorOrigem(elementoOrigemUuid: number): number {
    const referencias = this.referenciasPorOrigem.get(elementoOrigemUuid);
    if (!referencias) {
      return 0;
    }

    // Faz uma cópia do array para evitar problemas durante a iteração
    // pois this.remover() modifica o array original
    const copiaReferencias = [...referencias];
    const count = copiaReferencias.length;
    copiaReferencias.forEach(ref => this.remover(ref.id));

    return count;
  }

  processarAtualizacao(atualizacao: AtualizacaoRemissao): RemissaoInterna[] {
    switch (atualizacao.tipo) {
      case 'renumeracao':
        if (atualizacao.oldId && atualizacao.newId && atualizacao.newUuid !== undefined) {
          return this.atualizarDestino(atualizacao.oldId, atualizacao.newId, atualizacao.newUuid);
        }
        break;

      case 'remocao':
        if (atualizacao.oldId) {
          return this.marcarComoInvalidas(atualizacao.oldId);
        }
        break;
    }

    return [];
  }

  get tamanho(): number {
    return this.todasReferencias.length;
  }

  get vazio(): boolean {
    return this.todasReferencias.length === 0;
  }

  limpar(): void {
    this.referenciasPorOrigem.clear();
    this.referenciasPorDestino.clear();
    this.todasReferencias = [];
  }

  toJSON(): { referencias: RemissaoInterna[] } {
    return {
      referencias: this.todasReferencias.map(ref => ({
        ...ref,
        dataCriacao: ref.dataCriacao.toISOString() as any,
      })),
    };
  }

  static fromJSON(data: { referencias: RemissaoInterna[] }): RemissaoRegistry {
    const registry = new RemissaoRegistry();
    data.referencias.forEach(ref => {
      registry.adicionar({
        ...ref,
        dataCriacao: new Date(ref.dataCriacao as any),
      });
    });
    return registry;
  }
}
