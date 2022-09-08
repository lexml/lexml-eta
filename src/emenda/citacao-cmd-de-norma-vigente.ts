import { Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { StringBuilder } from '../util/string-util';
import { isArtigo, isOmissis, isAgrupadorNaoArticulacao } from './../model/dispositivo/tipo';
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
    let dispositivosDaCabeca = new Array<Dispositivo>();
    let cabeca, cabecaAtual;

    for (const d of dispositivos) {
      cabeca = isArtigo(d) || isAgrupadorNaoArticulacao(d) ? d : getArtigo(d);

      if (cabeca !== cabecaAtual) {
        if (dispositivosDaCabeca.length) {
          this.getCitacaoMultipla(sb, dispositivosDaCabeca);
        }

        dispositivosDaCabeca = [cabeca];
        cabecaAtual = cabeca;
      }

      if (!dispositivosDaCabeca.includes(d)) {
        dispositivosDaCabeca.push(d);
      }
    }

    if (dispositivosDaCabeca.length) {
      this.getCitacaoMultipla(sb, dispositivosDaCabeca);
    }
  }

  private getCitacaoMultipla(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    const cit = new CitacaoComandoMultiplaAlteracaoNormaVigente();
    sb.append(cit.getTexto(dispositivos));
  }
}
