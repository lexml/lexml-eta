import { Dispositivo } from '../model/dispositivo/dispositivo';
import { Genero, NomeComGenero } from '../model/dispositivo/genero';
import { StringBuilder } from '../util/string-util';
import { isArtigo, isAgrupadorNaoArticulacao } from './../model/dispositivo/tipo';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { DispositivosWriterCmdEmd } from './dispositivos-writer-cmd-emd';

export class CmdEmdAdicaoANormaVigente extends CmdEmdCombinavel {
  constructor(protected dispositivos: Dispositivo[], private generoNormaAlterada: Genero, private textoTodos: string) {
    super(dispositivos);
  }

  public getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    const sequencias = agrupador.getSequencias(this.dispositivos);

    // Prefixo
    const plural = this.dispositivos.length > 1;
    if (isPrimeiro) {
      sb.append(plural ? 'Acrescentem-se ' : 'Acrescente-se ');
    } else {
      sb.append(isUltimo ? '; e ' : '; ');
      sb.append(plural ? 'acrescentem-se ' : 'acrescente-se ');
    }

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    sb.append(dispositivosWriter.getTexto(sequencias));

    if (isUltimo) {
      const ultimaSequencia = sequencias[sequencias.length - 1];
      const primeiroDaUltimaSequencia = ultimaSequencia.getPrimeiroDispositivo();
      if (isArtigo(primeiroDaUltimaSequencia) || isAgrupadorNaoArticulacao(primeiroDaUltimaSequencia)) {
        sb.append(this.generoNormaAlterada.artigoDefinidoPrecedidoPreposicaoASingular);
      } else {
        if (this.textoTodos !== '') {
          sb.append(this.textoTodos);
        }
        sb.append(' ');
        sb.append(this.generoNormaAlterada.pronomePossessivoSingular);
      }
      sb.append(' ');
    }

    return sb.toString();
  }
}
