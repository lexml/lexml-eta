import { Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { StringBuilder } from '../util/string-util';
import { isArtigo, isOmissis } from './../model/dispositivo/tipo';
import { getArtigo, percorreHierarquiaDispositivos } from './../model/lexml/hierarquia/hierarquiaUtil';
import { CitacaoComandoMultiplaAlteracaoNormaVigente } from './citacao-cmd-multipla-de-norma-vigente';
import { CitacaoComandoSimples } from './citacao-cmd-simples';
import { DispositivoComparator } from './dispositivo-comparator';

export class CitacaoComandoDeNormaVigente {
  public getTexto(alteracao: Dispositivo): string {
    const sb = new StringBuilder();

    // Identifica dispositivos alterados
    const dispositivos = new Array<Dispositivo>();
    percorreHierarquiaDispositivos(alteracao, d => {
      if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
        dispositivos.push(d);
      }
    });

    dispositivos.sort(DispositivoComparator.compare);

    const qtdDispositivos = dispositivos.length;

    const qtdSemCitacaoObrigatoria = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO || isOmissis(d)).length;

    if (qtdDispositivos - qtdSemCitacaoObrigatoria > 0) {
      const disp = dispositivos[0];
      if (dispositivos.length === 1 && !isArtigo(disp)) {
        this.getCitacaoSimples(sb, disp);
      } else {
        this.getCitacoesMultiplas(sb, dispositivos);
      }
    }

    return sb.toString();
  }

  private getCitacaoSimples(sb: StringBuilder, dispositivo: Dispositivo): void {
    const cit = new CitacaoComandoSimples();
    sb.append(cit.getTexto(dispositivo, true));
  }

  private getCitacoesMultiplas(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    let dispositivosDoArtigo = new Array<Dispositivo>();
    let artigo, artigoAtual;

    for (const d of dispositivos) {
      artigo = isArtigo(d) ? d : getArtigo(d);

      if (artigo !== artigoAtual) {
        if (dispositivosDoArtigo.length) {
          this.getCitacaoMultipla(sb, dispositivosDoArtigo);
        }

        dispositivosDoArtigo = [artigo];
        artigoAtual = artigo;
      }

      if (!dispositivosDoArtigo.includes(d)) {
        dispositivosDoArtigo.push(d);
      }
    }

    if (dispositivosDoArtigo.length) {
      this.getCitacaoMultipla(sb, dispositivosDoArtigo);
    }
  }

  private getCitacaoMultipla(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    const cit = new CitacaoComandoMultiplaAlteracaoNormaVigente();
    sb.append(cit.getTexto(dispositivos));
  }
}
