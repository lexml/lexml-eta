import { Dispositivo } from '../model/dispositivo/dispositivo';
import { Genero, NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { ArtigoAntesDispositivo, DispositivosWriterCmdEmd } from './dispositivos-writer-cmd-emd';

export class CmdEmdModificacaoDeNormaVigente extends CmdEmdCombinavel {
  constructor(protected dispositivos: Dispositivo[], private generoNormaAlterada: Genero, private textoTodos: string) {
    super(dispositivos);
  }

  getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    // parágrafo único ao art. 15-A da

    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    const sequencias = agrupador.separaDispositivosSeguidosDeOmissis(agrupador.getSequencias(this.dispositivos));

    // Prefixo
    if (isPrimeiro) {
      sb.append('Dê-se nova redação ');
    } else {
      sb.append(isUltimo ? '; e ' : '; ');
      sb.append('dê-se nova redação ');
    }

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    dispositivosWriter.setArtigoAntesDispositivo(ArtigoAntesDispositivo.DEFINIDO_COM_PREPOSICAO_A);
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
}
