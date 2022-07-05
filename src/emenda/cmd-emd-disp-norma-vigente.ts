import { Alteracoes } from '../model/dispositivo/blocoAlteracao';
import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
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
  //private UrnService urnService;

  constructor(private alteracao: Articulacao) {}

  getTexto(refGenericaProjeto: NomeComGenero): string {
    const sb = new StringBuilder();

    const dispositivos = CmdEmdUtil.getDispositivosNaAlteracaoParaComando(this.alteracao);

    const urnNormaAlterada = (this.alteracao as Alteracoes).base;
    if (!urnNormaAlterada) {
      return 'Não foi possível gerar o comando de emenda porque a norma alterada não foi informada.';
    }

    const generoNormaAlterada = getGeneroUrnNorma(urnNormaAlterada);

    let imprimirPrefixoESufixo = false;

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
      imprimirPrefixoESufixo = true;
    }

    // Consideramos adicionados os dispositivos adicionados pela emenda e que não existiam na
    // norma vigente
    const dispositivosAdicionados = dispositivos.filter(d => CmdEmdUtil.getDescricaoSituacaoParaComandoEmenda(d) === DescricaoSituacao.DISPOSITIVO_ADICIONADO);
    if (dispositivosAdicionados.length) {
      comandos.push(new CmdEmdAdicaoANormaVigente(dispositivosAdicionados, generoNormaAlterada));
      imprimirPrefixoESufixo = true;
    }

    comandos.sort(CmdEmdCombinavel.compare);

    // Altere-se o art. 2º do Projeto para acrescentar
    if (imprimirPrefixoESufixo) {
      sb.append('Altere-se ');
      this.escreveDispositivoAlterado(sb, this.alteracao.pai!);
      sb.append(' ');
      sb.append(refGenericaProjeto.genero.pronomePossessivoSingular);
      sb.append(' ');
      sb.append(refGenericaProjeto.nome);
      sb.append(' para ');
    }

    let i = 0;
    const iUltimo = comandos.length - 1;
    comandos.forEach(cmd => {
      sb.append(cmd.getTexto(refGenericaProjeto, i === 0, i === iUltimo));
      i++;
    });

    // Lei nº 9.096, de 19 de setembro de 1995, nos termos a seguir:
    if (imprimirPrefixoESufixo) {
      this.escreveLei(sb, urnNormaAlterada);
      if (this.temCitacao(dispositivosModificados, dispositivosAdicionados)) {
        sb.append(', nos termos a seguir:');
      } else {
        sb.append('.');
      }
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
    sb.append(d.artigoDefinidoSingular);
    sb.append(DispositivosWriterCmdEmd.getRotuloTipoDispositivo(d, false));
    sb.append(' ');
    sb.append(d.getNumeracaoParaComandoEmenda(d));
    sb.append(CmdEmdUtil.getRotuloPais(d));
  }

  private escreveLei(sb: StringBuilder, urn: string): void {
    sb.append(getNomeExtensoComDataExtenso(urn));
  }
}
