import { Dispositivo } from '../model/dispositivo/dispositivo';
import { Genero, NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { CmdEmdUtil } from './comando-emenda-util';
import { ArtigoAntesDispositivo, DispositivosWriterCmdEmd, TipoReferenciaAgrupador } from './dispositivos-writer-cmd-emd';

export class CmdEmdSupressaoDeNormaVigente extends CmdEmdCombinavel {
  constructor(
    protected dispositivos: Dispositivo[],
    private alteracao: Dispositivo,
    private urnNormaAlterada: string,
    private generoNormaAlterada: Genero,
    private textoTodos: string
  ) {
    super(dispositivos);
  }

  public getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    const sequencias = agrupador.getSequencias(this.dispositivos);

    // Prefixo
    const plural = CmdEmdUtil.isSequenciasPlural(sequencias);
    if (isPrimeiro) {
      sb.append(plural ? 'Suprimam-se ' : 'Suprima-se ');
    } else {
      if (!isPrimeiro) {
        sb.append(isUltimo ? '; e ' : '; ');
      }
      sb.append(plural ? 'suprimam-se ' : 'suprima-se ');
    }

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    dispositivosWriter.artigoAntesDispositivo = ArtigoAntesDispositivo.DEFINIDO;
    dispositivosWriter.tipoReferenciaAgrupador = TipoReferenciaAgrupador.O_AGRUPADOR;
    sb.append(dispositivosWriter.getTexto(sequencias));

    if (isUltimo) {
      if (this.textoTodos !== '') {
        sb.append(this.textoTodos);
      }
      sb.append(' ');
      sb.append(this.generoNormaAlterada.pronomePossessivoSingular);
      sb.append(' ');
    }

    return removeEspacosDuplicados(sb.toString());
  }

  private escreveDispositivoAlterado(sb: StringBuilder, d: Dispositivo): void {
    sb.append(d.pronomePossessivoSingular);
    sb.append(DispositivosWriterCmdEmd.getRotuloTipoDispositivo(d, false));
    sb.append(' ');
    sb.append(d.getNumeracaoParaComandoEmenda(d));
    sb.append(CmdEmdUtil.getRotuloPais(d));
  }
}
