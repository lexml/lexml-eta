import { Dispositivo } from '../model/dispositivo/dispositivo';
import { isArtigo } from '../model/dispositivo/tipo';
import { StringBuilder } from '../util/string-util';
import { Articulacao } from './../model/dispositivo/dispositivo';
import { DescricaoSituacao } from './../model/dispositivo/situacao';
import { isAgrupador, isAgrupadorNaoArticulacao } from './../model/dispositivo/tipo';
import { getArtigoDoProjeto, isArticulacaoAlteracao, isDescendenteDeSuprimido, isDispositivoAlteracao } from './../model/lexml/hierarquia/hierarquiaUtil';
import { CitacaoComandoMultipla } from './citacao-cmd-multipla';
import { CmdEmdUtil } from './comando-emenda-util';
import { DispositivoComparator } from './dispositivo-comparator';

export class CitacaoComandoDispPrj {
  constructor(private articulacao: Articulacao) {}

  getTexto(): string {
    const sb = new StringBuilder();

    const dispositivos = this.getDispositivosParaCitacao();

    const qtdDispositivos = dispositivos.length;
    const qtdSuprimidos = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO).length;

    if (qtdDispositivos - qtdSuprimidos > 0) {
      this.getCitacoesMultiplas(sb, dispositivos);
    }

    return sb.toString();
  }

  private getDispositivosParaCitacao(): Dispositivo[] {
    const dispositivosEmenda = CmdEmdUtil.getDispositivosNaoOriginais(this.articulacao).filter(
      d => !(isAgrupadorNaoArticulacao(d) && d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO)
    );
    dispositivosEmenda.sort(DispositivoComparator.compare);

    const ret = new Array<Dispositivo>();

    dispositivosEmenda.forEach(d => {
      if (isArticulacaoAlteracao(d)) {
        // Entram alterações de norma vigente em dispositivos novos,
        if (d.pai!.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
          ret.push(d);
        }
      } else if (isDispositivoAlteracao(d)) {
        // dispositivos de alteração de norma vigente em dispositivos novos, e
        if (ret.indexOf(d.pai!) >= 0) {
          ret.push(d);
        }
      } else if (!isDescendenteDeSuprimido(d)) {
        // dispositivos que não são de alteração de norma vigente e que não são descendentes de suprimidos.
        ret.push(d);
      }
    });

    return ret;
  }

  getCitacoesMultiplas(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    // O dispositivo de referência será um artigo ou um agrupador de artigo.
    let listaDispRef = new Array<Dispositivo>();
    let dispRef;
    let dispRefAtual;

    dispositivos.forEach(d => {
      dispRef = (isArtigo(d) || isAgrupador(d)) && !isDispositivoAlteracao(d) ? d : getArtigoDoProjeto(d);

      if (dispRef !== dispRefAtual) {
        if (listaDispRef.length) {
          this.getCitacaoMultipla(sb, listaDispRef);
        }

        listaDispRef = [];
        listaDispRef.push(dispRef);

        dispRefAtual = dispRef;
      }

      if (listaDispRef.indexOf(d) < 0) {
        listaDispRef.push(d);
      }
    });

    if (listaDispRef.length) {
      this.getCitacaoMultipla(sb, listaDispRef);
    }
  }

  getCitacaoMultipla(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    sb.append(new CitacaoComandoMultipla().getTexto(dispositivos));
  }
}
