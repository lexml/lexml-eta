import { Dispositivo } from '../model/dispositivo/dispositivo';
import { Genero, NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';
import { isArtigo } from './../model/dispositivo/tipo';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { DispositivosWriterCmdEmd } from './dispositivos-writer-cmd-emd';

export class CmdEmdAdicaoANormaVigente extends CmdEmdCombinavel {
  constructor(protected dispositivos: Dispositivo[], private generoNormaAlterada: Genero) {
    super(dispositivos);
  }

  public getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    // parágrafo único ao art. 15-A da

    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    const sequencias = agrupador.getSequencias(this.dispositivos);

    // Prefixo
    if (!isPrimeiro) {
      sb.append(isUltimo ? '; e ' : '; ');
    }
    sb.append('acrescentar ');

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    sb.append(dispositivosWriter.getTexto(sequencias));

    // Sufixo
    if (isUltimo) {
      const ultimaSequencia = sequencias[sequencias.length - 1];
      sb.append(' ');
      if (!isArtigo(ultimaSequencia.getPrimeiroDispositivo())) {
        sb.append(this.generoNormaAlterada.pronomePossessivoSingular);
      } else {
        sb.append(this.generoNormaAlterada.artigoDefinidoPrecedidoPreposicaoASingular);
      }
      sb.append(' ');
    }

    return removeEspacosDuplicados(sb.toString());
  }
}
