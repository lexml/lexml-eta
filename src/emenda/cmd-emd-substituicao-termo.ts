import { SubstituicaoTermo } from '../model/emenda/emenda';

export class CmdEmdSubstituicaoTermo {
  constructor(private substituicaoTermo: SubstituicaoTermo) {}

  private getComplementoFlexoes(flexaoGenero: boolean, flexaoNumero: boolean): string {
    const flexoes: string[] = [];
    flexaoGenero && flexoes.push('gênero');
    flexaoNumero && flexoes.push('número');
    return flexoes.length ? `", fazendo-se as flexões de ${flexoes.join(' e ')} necessárias` : '';
  }

  getTexto(): string {
    const { tipo, termo, novoTermo, flexaoGenero, flexaoNumero } = this.substituicaoTermo;
    return `Substitua-se na Medida Provisória a/o ${tipo.toLowerCase()} "${termo}" por "${novoTermo}"${this.getComplementoFlexoes(flexaoGenero, flexaoNumero)}.`;
  }
}
