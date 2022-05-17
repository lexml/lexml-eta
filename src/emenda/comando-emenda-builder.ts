import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { ComandoEmenda, ItemComandoEmenda } from '../model/emenda/emenda';
import { getArticulacao } from '../model/lexml/hierarquia/hierarquiaUtil';
import { isArticulacao } from './../model/dispositivo/tipo';
import { getRefGenericaProjeto } from './../model/lexml/documento/urnUtil';
import { CitacaoComandoDeNormaVigente } from './citacao-cmd-de-norma-vigente';
import { CitacaoComandoDispPrj } from './citacao-cmd-disp-prj';
import { CmdEmdDispNormaVigente } from './cmd-emd-disp-norma-vigente';
import { CmdEmdDispPrj } from './cmd-emd-disp-prj';
import { CmdEmdUtil } from './comando-emenda-util';
import { DispositivoComparator } from './dispositivo-comparator';

export class ComandoEmendaBuilder {
  constructor(private urn: string, private articulacao: Articulacao) {}

  getComandoEmenda(): ComandoEmenda {
    const ret = new ComandoEmenda();

    const dispositivosEmenda = CmdEmdUtil.getDispositivosNaoOriginais(this.articulacao);

    const list = this.getDispositivosRepresentativosDeCadaComando(dispositivosEmenda);
    list.sort(DispositivoComparator.compare);

    if (!list.length) {
      return ret;
    }

    const refProjeto = getRefGenericaProjeto(this.urn);

    list.forEach(d => {
      let cabecalho: string;
      let citacao: string;

      if (isArticulacao(d)) {
        const cmd = new CmdEmdDispNormaVigente(d as Articulacao);
        cabecalho = cmd.getTexto(refProjeto);

        const cit = new CitacaoComandoDeNormaVigente();
        citacao = cit.getTexto(d);
      } else {
        const cmd = new CmdEmdDispPrj(dispositivosEmenda);
        cabecalho = cmd.getTexto(refProjeto);

        const cit = new CitacaoComandoDispPrj(this.articulacao);
        citacao = cit.getTexto();
      }

      ret.comandos.push(new ItemComandoEmenda(cabecalho, citacao));
    });

    if (ret.comandos.length > 1) {
      ret.cabecalhoComum = this.montaCabecalhoComum(refProjeto, ret.comandos.length);
      ret.comandos.forEach((c, i) => {
        c.rotulo = `Item ${i + 1} –`;
      });
    }

    return ret;
  }

  private getDispositivosRepresentativosDeCadaComando(dispositivosEmenda: Dispositivo[]): Dispositivo[] {
    const ret: Dispositivo[] = [];

    let temDispositivoDeProjeto = false;

    dispositivosEmenda.forEach(d => {
      const articulacao = getArticulacao(d);
      // Separa alterações
      if (articulacao && articulacao.pai && articulacao.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
        if (ret.indexOf(articulacao) === -1 && articulacao.pai.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
          ret.push(articulacao);
        }
      } else if (!temDispositivoDeProjeto) {
        temDispositivoDeProjeto = true;
        ret.push(d);
      }
    });

    return ret;
  }

  montaCabecalhoComum(refProjeto: NomeComGenero, qtdItens: number): string {
    return `Dê-se nova redação ${refProjeto.genero.artigoDefinidoPrecedidoPreposicaoASingular} ${refProjeto.nome} nos termos dos itens ${this.listarItens(qtdItens)} a seguir.`;
  }

  listarItens(qtdItens: number): string {
    return Array(qtdItens)
      .fill(0)
      .map((_, i) => i + 1)
      .join(', ')
      .replace(/, (\d+?)$/, ' e $1');
  }
}
