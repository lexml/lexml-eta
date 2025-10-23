import { Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { CmdEmdAdicao } from './cmd-emd-adicao';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { CmdEmdModificacao } from './cmd-emd-modificacao';
import { CmdEmdSupressao } from './cmd-emd-supressao';
import { CmdEmdUtil } from './comando-emenda-util';

/**
 * Comando de emenda que trata supressão, modificação e adição de dispositivos do projeto.
 */
export class CmdEmdDispPrj {
  constructor(private dispositivosEmenda: Dispositivo[]) {}

  getTexto(refGenericaProjeto: NomeComGenero): string {
    let texto = '';

    const dispositivos = CmdEmdUtil.getDispositivosComando(this.dispositivosEmenda);

    // Combinar comandos
    const comandos: CmdEmdCombinavel[] = [];

    const dispositivosSuprimidos = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
    if (dispositivosSuprimidos.length) {
      comandos.push(new CmdEmdSupressao(dispositivosSuprimidos));
    }

    const dispositivosModificados = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO);
    if (dispositivosModificados.length) {
      comandos.push(new CmdEmdModificacao(dispositivosModificados));
    }

    const dispositivosAdicionados = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO);
    if (dispositivosAdicionados.length) {
      comandos.push(new CmdEmdAdicao(dispositivosAdicionados));
    }

    comandos.sort(CmdEmdCombinavel.compare);

    let i = 0;
    const iUltimo = comandos.length - 1;
    comandos.forEach(cmd => {
      texto += cmd.getTexto(refGenericaProjeto, i === 0, i === iUltimo);
      i++;
    });

    return CmdEmdUtil.normalizaCabecalhoComandoEmenda(texto);
  }
}
