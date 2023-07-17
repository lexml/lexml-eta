import { EtaBlot } from './eta-blot';

const Container = Quill.import('blots/container');

export interface IContainerEta {
  get instanceBlotName(): string;
}

export abstract class EtaContainer extends Container implements IContainerEta {
  abstract get instanceBlotName(): string;

  constructor(node: any) {
    super(node);
  }

  private get firstBlot(): EtaBlot | undefined {
    return this.children.head;
  }

  protected findBlot(blotName: string): EtaBlot | undefined {
    if (!this.firstBlot) {
      return undefined;
    }
    return this.findBlotByBlotName(this.firstBlot, blotName);
  }

  protected findBlotByBlotName(node: any, blotName: string): any | undefined {
    if (node?.instanceBlotName === blotName) {
      return node;
    }

    // Verifica se o nó atual é um objeto
    if (typeof node === 'object' && node) {
      // Percorre as propriedades do objeto
      for (const key in node) {
        if (['children', 'head', 'next'].includes(key)) {
          // Chamada recursiva para cada propriedade do objeto
          const result = this.findBlotByBlotName(node[key], blotName);

          if (result?.instanceBlotName === blotName) {
            return result;
          }
        }
      }
    }

    return undefined;
  }

  protected findBlotByClass<T>(node: any, clazz: { new (...args: any[]): T }): T | undefined {
    // Verifica se o nó atual é do tipo T
    if (node instanceof clazz) {
      return node;
    }

    // Verifica se o nó atual é um objeto
    if (typeof node === 'object' && node) {
      // Percorre as propriedades do objeto
      for (const key in node) {
        if (['children', 'head', 'next'].includes(key)) {
          // Chamada recursiva para cada propriedade do objeto
          const result = this.findBlotByClass(node[key], clazz);

          // Se um nó do tipo T for encontrado, retorna o resultado
          if (result instanceof clazz) {
            return result;
          }
        }
      }
    }

    // Caso nenhum nó do tipo T seja encontrado, retorna undefined
    return undefined;
  }
}
