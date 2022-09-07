import { Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { DispositivosWriterCmdEmd, ArtigoAntesDispositivo } from './dispositivos-writer-cmd-emd';

export class CmdEmdModificacao extends CmdEmdCombinavel {
  constructor(protected dispositivos: Dispositivo[]) {
    super(dispositivos);
  }

  getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    // Dê-se ao art. 7º-A do Capítulo II do Projeto a seguinte redação:

    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    const sequencias = agrupador.getSequencias(this.dispositivos);

    // Prefixo
    if (isPrimeiro) {
      sb.append('Dê-se ');
      if (!isUltimo) {
        sb.append('nova redação ');
      }
    } else {
      sb.append(isUltimo ? '; e ' : '; ');
      sb.append('dê-se nova redação ');
    }

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    dispositivosWriter.setArtigoAntesDispositivo(ArtigoAntesDispositivo.DEFINIDO_COM_PREPOSICAO_A);
    dispositivosWriter.comandoModificacao = true;
    sb.append(dispositivosWriter.getTexto(sequencias));

    // Sufixo
    if (isUltimo) {
      sb.append(' ' + refGenericaProjeto.genero.pronomePossessivoSingular + ' ' + refGenericaProjeto.nome);
      sb.append(isPrimeiro ? ' a seguinte redação:' : ', nos termos a seguir:');
    }

    return removeEspacosDuplicados(sb.toString());
  }
}
