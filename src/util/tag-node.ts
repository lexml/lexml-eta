import { StringBuilder } from './string-util';
/**
 * Utilitário para montar uma tag usando o pattern composite. Essa classe foi retirada do livro
 * Refactoring to Patterns
 */
export class TagNode {
  private valores = new Array<any>();

  private atributos = new StringBuilder();

  public constructor(private nome: string) {}

  toString(): string {
    if (!this.valores.length) {
      return '<' + this.nome + this.atributos + '/>';
    }
    const resultado = new StringBuilder('<' + this.nome + this.atributos + '>');
    this.valores.forEach(valor => {
      resultado.append(valor);
    });
    resultado.append('</' + this.nome + '>');
    return resultado.toString();
  }

  addValor(valor?: string): TagNode {
    if (valor) {
      this.valores.push(valor);
    }
    return this;
  }

  addAtributo(atributo: string, valor?: string): TagNode {
    this.atributos.append(' ');
    this.atributos.append(atributo);
    if (valor) {
      this.atributos.append("='");
      this.atributos.append(valor);
      this.atributos.append("'");
    }
    return this;
  }

  add(child: TagNode): TagNode {
    if (child) {
      this.valores.push(child);
    }
    return this;
  }
}
