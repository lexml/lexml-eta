import { Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados, StringBuilder } from '../util/string-util';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { CmdEmdUtil } from './comando-emenda-util';
import { ArtigoAntesDispositivo, DispositivosWriterCmdEmd } from './dispositivos-writer-cmd-emd';

export class CmdEmdSupressao extends CmdEmdCombinavel {
  constructor(public dispositivos: Dispositivo[]) {
    super(dispositivos);
  }

  getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    // Suprima-se o § 1º do art. 9º do Projeto.
    // Suprima-se o inciso I do § 6º do art. 9º do Projeto.
    // Suprimam-se os §§ 1º e 2º do art. 9º do Projeto.
    // Suprimam-se os §§ 1º, 3º e 5º do art. 9º do Projeto.
    // Suprimam-se os §§ 1º a 3º do art. 9º do Projeto.
    // Suprimam-se os §§ 3º, 4º e 7º do art. 9º do Projeto.
    // Suprimam-se os §§ 1º, 3º a 5º e 7º do art. 9º do Projeto.
    // Suprima-se o parágrafo único do art. 8º do Projeto.
    // Suprimam-se os §§ 1º, 3º a 5º e o inciso I do § 6º do art. 9º do Projeto.
    // Suprimam-se o inciso IX do caput do art. 2º, o art. 3º, o parágrafo único do art. 8º e o
    // art. 9º do Projeto.

    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    const sequencias = agrupador.getSequencias(this.dispositivos);

    // Prefixo
    const plural = CmdEmdUtil.isSequenciasPlural(sequencias);
    if (isPrimeiro) {
      sb.append(plural ? 'Suprimam-se ' : 'Suprima-se ');
    } else {
      sb.append(isUltimo ? '; e ' : '; ');
      sb.append(plural ? 'suprimam-se ' : 'suprima-se ');
    }

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    dispositivosWriter.setArtigoAntesDispositivo(ArtigoAntesDispositivo.DEFINIDO);
    sb.append(dispositivosWriter.getTexto(sequencias));

    // Sufixo
    if (isUltimo) {
      sb.append(' ' + refGenericaProjeto.genero.pronomePossessivoSingular + ' ' + refGenericaProjeto.nome);
      sb.append(isPrimeiro ? '.' : ', nos termos a seguir:');
    }

    return removeEspacosDuplicados(sb.toString());
  }
}
