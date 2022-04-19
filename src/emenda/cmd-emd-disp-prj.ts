import { Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { CmdEmdAdicao } from './cmd-emd-adicao';
import { CmdEmdAdicaoArtigoOndeCouber } from './cmd-emd-adicao-artigo-onde-couber';
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

    const artigosOndeCouber = dispositivos.filter(d => {
      return d.situacao instanceof DispositivoAdicionado && (d.situacao as DispositivoAdicionado).tipoEmenda === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
    });
    // Se for caso de artigos onde couber, não pode ter outro tipo de alteração
    if (artigosOndeCouber.length) {
      if (artigosOndeCouber.length < dispositivos.length) {
        throw new Error('Adição de artigos onde couber e outras alterações na mesma emenda.');
      }

      const cmd = new CmdEmdAdicaoArtigoOndeCouber(artigosOndeCouber);
      return cmd.getTexto(refGenericaProjeto);
    }

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

    return texto;
  }
}
