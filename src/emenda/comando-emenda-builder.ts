import { isArticulacao } from './../model/dispositivo/tipo';
import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { getArticulacao, percorreHierarquiaDispositivos } from '../model/lexml/hierarquia/hierarquiaUtil';
import { CmdEmdAdicao } from './cmd-emd-adicao';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { CmdEmdUtil, NomeComGenero } from './comando-emenda-util';
import { DispositivoComparator } from './dispositivo-comparator';

export class ItemComandoEmenda {
  constructor(public cabecalho: string, public citacao: string) {}
}

export class ComandoEmendaBuilder {
  constructor(private urn: string, private articulacao: Articulacao) {}

  getComandos(): ItemComandoEmenda[] {
    const ret: ItemComandoEmenda[] = [];

    const dispositivosEmenda = this.getDispositivosEmenda();

    const list = this.getDispositivosRepresentativosDeCadaComando(dispositivosEmenda);
    list.sort(DispositivoComparator.compare);

    // Implementar RefGenericaProjetoFactory.getRefGenericaProjeto(urn)
    const refGenericaProjeto = new NomeComGenero('Medida Provisória', 'F');

    list.forEach(d => {
      let cabecalho: string;
      let citacao: string;

      if (isArticulacao(d)) {
        //     CmdEmdAlteracaoNormaVigente cmd = new CmdEmdAlteracaoNormaVigente(d);
        //     cabecalho = cmd.getTexto(refGenericaProjeto);
        cabecalho = 'não implementado';

        //     CitacaoComandoAlteracaoNormaVigente cit = new CitacaoComandoAlteracaoNormaVigente(emenda, d);
        //     citacao = cit.getTexto();
        citacao = '';
      } else {
        const cmd = new CmdEmdDispPrj(dispositivosEmenda);
        cabecalho = cmd.getTexto(refGenericaProjeto);

        //     CitacaoComandoDispPrj cit = new CitacaoComandoDispPrj(emenda);
        citacao = '';
      }

      ret.push(new ItemComandoEmenda(cabecalho, citacao));
    });

    return ret;
    // return [new ItemComandoEmenda('Acrescente-se art. 1º-A ao Projeto, com a seguinte redação:', '')];
  }

  private getDispositivosRepresentativosDeCadaComando(dispositivosEmenda: Dispositivo[]): Dispositivo[] {
    const ret: Dispositivo[] = [];

    let temDispositivoDeProjeto = false;

    dispositivosEmenda.forEach(d => {
      const articulacao = getArticulacao(d);
      // Separa alterações
      if (articulacao && articulacao.pai && articulacao.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
        if (ret.indexOf(articulacao) === -1 && articulacao.pai.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_NOVO) {
          ret.push(articulacao);
        }
      } else if (!temDispositivoDeProjeto) {
        temDispositivoDeProjeto = true;
        ret.push(d);
      }
    });

    return ret;
  }

  private getDispositivosEmenda(): Dispositivo[] {
    const ret: Dispositivo[] = [];
    percorreHierarquiaDispositivos(this.articulacao, d => {
      if (d.pai && d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
        ret.push(d);
      }
    });
    return ret;
  }
}

/**
 * Comando de emenda que trata supressão, modificação e adição de dispositivos do projeto.
 */
class CmdEmdDispPrj {
  constructor(private dispositivosEmenda: Dispositivo[]) {}

  getTexto(refGenericaProjeto: NomeComGenero): string {
    let texto = '';

    const dispositivos = CmdEmdUtil.getDispositivosComando(this.dispositivosEmenda);

    // TODO Tratar artigos onde couber
    // List<Dispositivo> artigosOndeCouber = CmdEmdUtil.filtraArtigosOndeCouber(dispositivos);
    // // Se for caso de artigos onde couber, não pode ter outro tipo de alteração
    // if (!artigosOndeCouber.isEmpty()) {
    //     if (artigosOndeCouber.size() < dispositivos.size()) {
    //         throw new RuntimeException("Adição de artigos onde couber e outras alterações na mesma emenda.");
    //     }

    //     CmdEmdAdicaoArtigoOndeCouber cmd = new CmdEmdAdicaoArtigoOndeCouber(artigosOndeCouber);
    //     sb.append(cmd.getTexto(refGenericaProjeto));

    //     return sb.toString();
    // }

    // Combinar comandos
    const comandos: CmdEmdCombinavel[] = [];

    // TODO Tratar supressão
    // List<Dispositivo> dispositivosSuprimidos = DispositivoUtil
    //         .filtraDispositivosPorSituacao(dispositivos, DispositivoSuprimido.class);
    // if (!dispositivosSuprimidos.isEmpty()) {
    //     comandos.add(new CmdEmdSupressao(dispositivosSuprimidos));
    // }

    // TODO Tratar modificação
    // List<Dispositivo> dispositivosModificados = CmdEmdUtil.filtraDispositivosModificados(dispositivos);
    // if (!dispositivosModificados.isEmpty()) {
    //     comandos.add(new CmdEmdModificacao(dispositivosModificados));
    // }

    const dispositivosAdicionados = dispositivos.filter(d => d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_NOVO);
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
