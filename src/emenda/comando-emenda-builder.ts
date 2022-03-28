import { DispositivoAdicionado } from './../model/lexml/situacao/dispositivoAdicionado';
import { CmdEmdModificacao } from './cmd-emd-modificacao';
import { getRefGenericaProjeto } from './../model/lexml/documento/urnUtil';
import { isArticulacao } from './../model/dispositivo/tipo';
import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { getArticulacao } from '../model/lexml/hierarquia/hierarquiaUtil';
import { CmdEmdAdicao } from './cmd-emd-adicao';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { CmdEmdUtil } from './comando-emenda-util';
import { DispositivoComparator } from './dispositivo-comparator';
import { NomeComGenero } from '../model/dispositivo/genero';
import { CmdEmdSupressao } from './cmd-emd-supressao';
import { ComandoEmenda, ItemComandoEmenda } from '../model/lexml/documento/emenda';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { CmdEmdAdicaoArtigoOndeCouber } from './cmd-emd-adicao-artigo-onde-couber';
import { CitacaoComandoDispPrj } from './citacao-cmd-disp-prj';

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

    const refGenericaProjeto = getRefGenericaProjeto(this.urn);

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

        const cit = new CitacaoComandoDispPrj(this.articulacao);
        citacao = cit.getTexto();
      }

      ret.comandos.push(new ItemComandoEmenda(cabecalho, citacao));
    });

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
}

/**
 * Comando de emenda que trata supressão, modificação e adição de dispositivos do projeto.
 */
class CmdEmdDispPrj {
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
