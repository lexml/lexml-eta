import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArtigo } from '../../dispositivo/tipo';
import { DispositivoLexmlFactory } from '../factory/dispositivo-lexml-factory';

export class ArticulacaoParser {
  static load(obj: any): Articulacao {
    const articulacao = DispositivoLexmlFactory.createArticulacao();
    ArticulacaoParser.getChildren(articulacao, obj.Articulacao);

    // ArticulacaoParser.print(articulacao);

    return articulacao;
  }

  static getChildren(parent: Dispositivo, obj: any): void {
    for (const property in obj) {
      if (obj[property] instanceof Array) {
        for (const elemento of obj[property]) {
          const filho = ArticulacaoParser.createDispositivo(property, elemento, parent);
          ArticulacaoParser.getChildren(filho, elemento);
        }
      } else {
        if (!ArticulacaoParser.isProperty(property)) {
          const filho = ArticulacaoParser.createDispositivo(property, obj[property], parent);
          if (property.toLowerCase() === 'caput') {
            (parent as Artigo).caput = filho;
          }
          ArticulacaoParser.getChildren(filho, obj[property]);
        }
      }
    }
  }

  private static getNivel(dispositivo: Dispositivo, atual = 0): number {
    if (dispositivo?.pai === undefined || isArtigo(dispositivo) || isAgrupador(dispositivo)) {
      return atual;
    }
    atual = ++atual;
    return isArtigo(dispositivo?.pai) ? atual : ArticulacaoParser.getNivel(dispositivo.pai, atual);
  }

  private static createDispositivo(property: string, elemento: any, parent: Dispositivo): Dispositivo {
    const filho = DispositivoLexmlFactory.create(property, parent);

    filho.texto = elemento['p'] ? elemento['p'] : elemento['NomeAgrupador'];

    filho.rotulo = elemento['Rotulo'];
    return filho;
  }

  private static isProperty(value: string): boolean {
    return ['@id', 'NomeAgrupador', 'Rotulo', 'p'].includes(value);
  }

  private static print(dispositivo: Dispositivo): void {
    if (dispositivo === null || dispositivo.filhos === null) {
      return;
    }

    dispositivo.filhos.forEach(filho => {
      ArticulacaoParser.print(filho);
    });
  }
}
