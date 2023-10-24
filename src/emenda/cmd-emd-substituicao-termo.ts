import { SubstituicaoTermo } from '../model/emenda/emenda';
import { getRefGenericaProjeto } from '../model/lexml/documento/urnUtil';

export class CmdEmdSubstituicaoTermo {
  constructor(private substituicaoTermo: SubstituicaoTermo, private urn: string) {}

  private getComplementoFlexoes(flexaoGenero: boolean, flexaoNumero: boolean): string {
    const flexoes: string[] = [];
    flexaoGenero && flexoes.push('gênero');
    flexaoNumero && flexoes.push('número');
    return flexoes.length ? `, fazendo-se as flexões de ${flexoes.join(' e ')} necessárias` : '';
  }

  getTexto(): string {
    const { tipo, termo, novoTermo, flexaoGenero, flexaoNumero } = this.substituicaoTermo;
    const refProjeto = getRefGenericaProjeto(this.urn);
    return `Substitua-se n${refProjeto.genero.artigoDefinido} ${refProjeto.nome} a/o ${tipo.toLowerCase()} “${termo}” por “${novoTermo}”${this.getComplementoFlexoes(
      flexaoGenero,
      flexaoNumero
    )}.`;
  }
}
