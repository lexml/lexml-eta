import { isAgrupador } from './../model/dispositivo/tipo';
import { isDispositivoAlteracao, isArticulacaoAlteracao, getArtigo } from './../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoComparator } from './dispositivo-comparator';
import { Articulacao } from './../model/dispositivo/dispositivo';
import { DescricaoSituacao } from './../model/dispositivo/situacao';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { isArtigo } from '../model/dispositivo/tipo';
import { StringBuilder } from '../util/string-util';
import { CmdEmdUtil } from './comando-emenda-util';
import { CitacaoComandoSimples } from './citacao-cmd-simples';
import { CitacaoComandoMultipla } from './citacao-cmd-multipla';

export class CitacaoComandoDispPrj {
  constructor(private articulacao: Articulacao) {}

  getTexto(): string {
    const sb = new StringBuilder();

    const dispositivos = this.getDispositivosParaCitacao();

    const qtdDispositivos = dispositivos.length;
    const qtdSuprimidos = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO).length;

    if (qtdDispositivos - qtdSuprimidos > 0) {
      const disp = dispositivos[0];
      if (dispositivos.length === 1 && !isArtigo(disp)) {
        sb.append(new CitacaoComandoSimples().getTexto(disp));
      } else {
        this.getCitacoesMultiplas(sb, dispositivos);
      }
    }

    return sb.toString();
  }

  private getDispositivosParaCitacao(): Dispositivo[] {
    const dispositivosEmenda = CmdEmdUtil.getDispositivosNaoOriginais(this.articulacao);
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
      } else {
        // dispositivos que não são de alteração de norma vigente
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
      dispRef = (isArtigo(d) || isAgrupador(d)) && !isDispositivoAlteracao(d) ? d : getArtigo(d);

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
