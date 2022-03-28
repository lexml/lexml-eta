import { isDispositivoAlteracao, isArticulacaoAlteracao } from './../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoComparator } from './dispositivo-comparator';
import { Articulacao } from './../model/dispositivo/dispositivo';
import { DescricaoSituacao } from './../model/dispositivo/situacao';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { isArtigo } from '../model/dispositivo/tipo';
import { StringBuilder } from '../util/string-util';
import { CmdEmdUtil } from './comando-emenda-util';
import { CitacaoComandoSimples } from './citacao-cmd-simples';

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
        sb.append('<p>Citação múltipla não implementada.</p>');
        // this.getCitacoesMultiplas(sb, dispositivos);
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

  // private void getCitacoesMultiplas(final StringBuilder sb, final List<Dispositivo> dispositivos) {
  //     List<Dispositivo> dispArtigo = new ArrayList<Dispositivo>();
  //     Dispositivo artigo, artigoAtual = null;

  //     sb.append("<Citacao>");

  //     for (Dispositivo d : dispositivos) {

  //         artigo = DispositivoUtil.getArtigoDoProjeto(d);

  //         if (artigo != artigoAtual) {

  //             if (!dispArtigo.isEmpty()) {
  //                 getCitacaoMultipla(sb, dispArtigo);
  //             }

  //             dispArtigo.clear();
  //             dispArtigo.add(artigo);

  //             artigoAtual = artigo;
  //         }

  //         if (!dispArtigo.contains(d)) {
  //             dispArtigo.add(d);
  //         }
  //     }

  //     if (!dispArtigo.isEmpty()) {
  //         getCitacaoMultipla(sb, dispArtigo);
  //     }

  //     sb.append("</Citacao>");
  // }

  // private void getCitacaoMultipla(final StringBuilder sb, final List<Dispositivo> dispositivos) {
  //     CitacaoComandoMultipla cit = new CitacaoComandoMultipla(emenda);
  //     sb.append(cit.getTexto(dispositivos));
  // }
}
