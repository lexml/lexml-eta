import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArtigo } from '../../dispositivo/tipo';
import { createArticulacao, criaDispositivo } from '../dispositivo/dispositivoLexmlFactory';
import { DispositivoOriginal } from '../situacao/dispositivoOriginal';

export class ArticulacaoParser {
  static load(obj: any, emendamento = false): Articulacao {
    const articulacao = createArticulacao();
    ArticulacaoParser.getChildren(articulacao, obj.Articulacao, emendamento);

    // ArticulacaoParser.print(articulacao);

    return articulacao;
  }

  static getChildren(parent: Dispositivo, obj: any, emendamento: boolean): void {
    for (const property in obj) {
      if (obj[property] instanceof Array) {
        for (const elemento of obj[property]) {
          const filho = ArticulacaoParser.createDispositivo(property, elemento, parent, emendamento);
          ArticulacaoParser.getChildren(filho, elemento, emendamento);
        }
      } else {
        if (!ArticulacaoParser.isProperty(property)) {
          const filho = ArticulacaoParser.createDispositivo(property, obj[property], parent, emendamento);
          if (property.toLowerCase() === 'caput') {
            (parent as Artigo).caput = filho;
          }
          ArticulacaoParser.getChildren(filho, obj[property], emendamento);
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

  private static createDispositivo(property: string, elemento: any, parent: Dispositivo, emendamento: boolean): Dispositivo {
    const filho = criaDispositivo(parent, property);
    filho.texto = elemento['p'] ? elemento['p'] : elemento['NomeAgrupador'];
    filho.rotulo = elemento['Rotulo'];
    if (emendamento) {
      filho.situacao = new DispositivoOriginal();
    }
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
