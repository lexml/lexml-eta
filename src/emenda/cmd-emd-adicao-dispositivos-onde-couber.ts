import { isArtigo, isAgrupadorNaoArticulacao } from './../model/dispositivo/tipo';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';

export class CmdEmdAdicaoDispositivosOndeCouber {
  constructor(private dispositivos: Dispositivo[]) {}

  getTexto(refGenericaProjeto: NomeComGenero): string {
    // "Acrescente-se, onde couber, no Projeto o seguinte artigo:"
    // "Acrescentem-se, onde couber, no Projeto os seguintes artigos:"

    if (!this.dispositivos.length) {
      return '';
    }

    const strRefProjeto = refGenericaProjeto.genero.contracaoEmArtigoDefinidoSingular + ' ' + refGenericaProjeto.nome;

    const qtdArtigos = this.dispositivos.filter(d => isArtigo(d) && !isAgrupadorNaoArticulacao(d.pai!)).length;
    const qtdAgrupadores = this.dispositivos.filter(d => isAgrupadorNaoArticulacao(d)).length;

    const sb = new StringBuilder();

    const pluralTodos = qtdArtigos + qtdAgrupadores > 1;
    if (pluralTodos) {
      sb.append('Acrescentem-se, onde couber, ' + strRefProjeto + ' '); //os seguintes artigos:';
    } else {
      sb.append('Acrescente-se, onde couber, ' + strRefProjeto + ' ');
    }

    const temArtigos = qtdArtigos > 0;
    if (temArtigos) {
      sb.append(pluralTodos ? 'os seguintes ' : 'o seguinte ');
      sb.append(qtdArtigos > 1 ? 'artigos' : 'artigo');
    }

    if (qtdAgrupadores > 0) {
      const agrupador = this.dispositivos.find(d => isAgrupadorNaoArticulacao(d))!;
      if (temArtigos) {
        sb.append(' e ');
        sb.append(qtdAgrupadores > 1 ? agrupador.descricaoPlural?.toLocaleLowerCase() : agrupador.descricao?.toLocaleLowerCase());
      } else if (qtdAgrupadores > 1) {
        sb.append(agrupador.artigoDefinidoPlural + ' seguintes ' + agrupador.descricaoPlural?.toLocaleLowerCase());
      } else {
        sb.append(agrupador.artigoDefinido + ' seguinte ' + agrupador.descricao?.toLocaleLowerCase());
      }
    }

    sb.append(':');

    return removeEspacosDuplicados(sb.toString());
  }
}
