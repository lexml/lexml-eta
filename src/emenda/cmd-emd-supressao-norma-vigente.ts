import { Dispositivo } from '../model/dispositivo/dispositivo';
import { Genero, NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';
import { isArtigo } from './../model/dispositivo/tipo';
import { getNomeExtensoComDataExtenso } from './../model/lexml/documento/urnUtil';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { CmdEmdUtil } from './comando-emenda-util';
import { ArtigoAntesDispositivo, DispositivosWriterCmdEmd } from './dispositivos-writer-cmd-emd';

export class CmdEmdSupressaoDeNormaVigente extends CmdEmdCombinavel {
  constructor(protected dispositivos: Dispositivo[], private alteracao: Dispositivo, private urnNormaAlterada: string, private generoNormaAlterada: Genero) {
    super(dispositivos);
  }

  public getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    // Suprima-se do caput art. 2º do Projeto o inciso V do caput do art. 44 da Lei nº 9.096, de
    // 19 de setembro de 1995.

    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    const sequencias = agrupador.getSequencias(this.dispositivos);

    // Prefixo
    const plural = CmdEmdUtil.isSequenciasPlural(sequencias);
    if (isPrimeiro && isUltimo) {
      sb.append(plural ? 'Suprimam-se ' : 'Suprima-se ');
      this.escreveDispositivoAlterado(sb, this.alteracao.pai!);
      sb.append(' ');
      sb.append(refGenericaProjeto.genero.pronomePossessivoSingular);
      sb.append(' ');
      sb.append(refGenericaProjeto.nome);
      sb.append(' ');
    } else {
      if (!isPrimeiro) {
        sb.append(isUltimo ? '; e ' : '; ');
      }
      sb.append('suprimir ');
    }

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    dispositivosWriter.setArtigoAntesDispositivo(ArtigoAntesDispositivo.DEFINIDO);
    sb.append(dispositivosWriter.getTexto(sequencias));

    // Sufixo
    if (isUltimo) {
      sb.append(' ');
      sb.append(this.generoNormaAlterada.pronomePossessivoSingular);
      sb.append(' ');
      if (isPrimeiro) {
        sb.append(getNomeExtensoComDataExtenso(this.urnNormaAlterada));
        sb.append('.');
      }
    }

    return removeEspacosDuplicados(sb.toString());
  }

  private escreveDispositivoAlterado(sb: StringBuilder, d: Dispositivo): void {
    sb.append(d.pronomePossessivoSingular);
    sb.append(DispositivosWriterCmdEmd.getRotuloTipoDispositivo(d, false));
    sb.append(' ');
    sb.append(d.getNumeracaoParaComandoEmenda());
    sb.append(CmdEmdUtil.getRotuloPais(d));
  }
}
