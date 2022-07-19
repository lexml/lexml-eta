import { Alteracoes } from '../model/dispositivo/blocoAlteracao';
import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { generoFeminino, NomeComGenero } from '../model/dispositivo/genero';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { isOmissis } from '../model/dispositivo/tipo';
import { getGeneroUrnNorma, getNomeExtensoComDataExtenso } from '../model/lexml/documento/urnUtil';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';
import { CmdEmdAdicaoANormaVigente } from './cmd-emd-adicao-a-norma-vigente';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { CmdEmdModificacaoDeNormaVigente } from './cmd-emd-modificacao-de-norma-vigente';
import { CmdEmdSupressaoDeNormaVigente } from './cmd-emd-supressao-norma-vigente';
import { CmdEmdUtil } from './comando-emenda-util';
import { DispositivosWriterCmdEmd } from './dispositivos-writer-cmd-emd';

/**
 * Comando de emenda que trata comandos de alteração de norma vigente.
 */
export class CmdEmdDispNormaVigente {
  constructor(private alteracao: Articulacao) {}

  getTexto(refGenericaProjeto: NomeComGenero): string {
    const sb = new StringBuilder();

    const dispositivos = CmdEmdUtil.getDispositivosNaAlteracaoParaComando(this.alteracao);

    const urnNormaAlterada = (this.alteracao as Alteracoes).base;
    if (!urnNormaAlterada) {
      return 'Não foi possível gerar o comando de emenda porque a norma alterada não foi informada.';
    }

    const generoNormaAlterada = getGeneroUrnNorma(urnNormaAlterada);

    // let imprimirPrefixoESufixo = false;

    // Combinar comandos
    const comandos = new Array<CmdEmdCombinavel>();

    const dispositivosSuprimidos = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
    if (dispositivosSuprimidos.length) {
      comandos.push(new CmdEmdSupressaoDeNormaVigente(dispositivosSuprimidos, this.alteracao, urnNormaAlterada, generoNormaAlterada));
    }

    // Consideramos modificados os dispositivos já existentes na proposição e os que foram
    // adicionados pela emenda, mas que já existiam na norma vigente.
    const dispositivosModificados = dispositivos.filter(d => CmdEmdUtil.getDescricaoSituacaoParaComandoEmenda(d) === DescricaoSituacao.DISPOSITIVO_MODIFICADO);
    if (dispositivosModificados.length) {
      comandos.push(new CmdEmdModificacaoDeNormaVigente(dispositivosModificados, generoNormaAlterada));
      // imprimirPrefixoESufixo = true;
    }

    // Consideramos adicionados os dispositivos adicionados pela emenda e que não existiam na
    // norma vigente
    const dispositivosAdicionados = dispositivos.filter(d => CmdEmdUtil.getDescricaoSituacaoParaComandoEmenda(d) === DescricaoSituacao.DISPOSITIVO_ADICIONADO);
    if (dispositivosAdicionados.length) {
      comandos.push(new CmdEmdAdicaoANormaVigente(dispositivosAdicionados, generoNormaAlterada));
      // imprimirPrefixoESufixo = true;
    }

    comandos.sort(CmdEmdCombinavel.compare);

    let i = 0;
    const iUltimo = comandos.length - 1;
    comandos.forEach(cmd => {
      sb.append(cmd.getTexto(refGenericaProjeto, i === 0, i === iUltimo));
      i++;
    });

    // da/à Lei nº 11.340, de 7 de agosto de 2006
    this.escreveLei(sb, urnNormaAlterada);
    const terminouComAdicao = comandos[comandos.length - 1] instanceof CmdEmdAdicaoANormaVigente;
    if (terminouComAdicao) {
      // , na forma proposta pelo art. 6º do Projeto
      sb.append(', na forma proposta ');
    } else {
      // , como propost(o/a)(s)
      sb.append(', como ');
      this.escreveProposto(sb, dispositivos);
    }
    // pelo art. 6º do Projeto
    sb.append(' ');
    this.escreveDispositivoAlterado(sb, this.alteracao.pai!);
    sb.append(' ');
    sb.append(refGenericaProjeto.genero.pronomePossessivoSingular);
    sb.append(' ');
    sb.append(refGenericaProjeto.nome);
    if (this.temCitacao(dispositivosModificados, dispositivosAdicionados)) {
      sb.append(', nos termos a seguir:');
    } else {
      sb.append('.');
    }

    return removeEspacosDuplicados(sb.toString());
  }

  private temCitacao(dispositivosModificados: Dispositivo[], dispositivosAdicionados: Dispositivo[]): boolean {
    if (dispositivosModificados.length) {
      return true;
    }
    return !!dispositivosAdicionados.find(d => !isOmissis(d));
  }

  private escreveDispositivoAlterado(sb: StringBuilder, d: Dispositivo): void {
    sb.append('pel' + d.artigoDefinidoSingular.trim());
    sb.append(' ');
    sb.append(DispositivosWriterCmdEmd.getRotuloTipoDispositivo(d, false));
    sb.append(' ');
    sb.append(d.getNumeracaoParaComandoEmenda(d));
    sb.append(CmdEmdUtil.getRotuloPais(d));
  }

  private escreveLei(sb: StringBuilder, urn: string): void {
    sb.append(getNomeExtensoComDataExtenso(urn));
  }

  private escreveProposto(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    const plural = dispositivos.length > 1;
    const feminino = dispositivos.filter(d => d.tipoGenero === generoFeminino.tipoGenero).length === dispositivos.length;
    sb.append('propost' + (feminino ? 'a' : 'o') + (plural ? 's' : ''));
  }
}
