import { Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { StringBuilder } from '../util/string-util';
import { isAgrupadorNaoArticulacao, isArtigo, isOmissis } from './../model/dispositivo/tipo';
import { getArtigo, isArticulacaoAlteracao, percorreHierarquiaDispositivos } from './../model/lexml/hierarquia/hierarquiaUtil';
import { CitacaoComandoMultiplaAlteracaoNormaVigente } from './citacao-cmd-multipla-de-norma-vigente';
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
      this.getCitacoesMultiplas(sb, dispositivos);
    }

    return sb.toString();
  }

  private getCitacoesMultiplas(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    let dispositivosDaCabeca = new Array<Dispositivo>();
    let cabeca, cabecaAtual;

    for (const d of dispositivos) {
      cabeca = this.getCabeca(d);

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

  private getCabeca(d: Dispositivo): Dispositivo {
    if (isArticulacaoAlteracao(d.pai!)) {
      return d;
    }
    if (isArtigo(d) || isAgrupadorNaoArticulacao(d) || (isOmissis(d) && isAgrupadorNaoArticulacao(d.pai!))) {
      return this.getCabeca(d.pai!);
    }
    return this.getCabeca(getArtigo(d));
  }

  private getCitacaoMultipla(sb: StringBuilder, dispositivos: Dispositivo[]): void {
    const cit = new CitacaoComandoMultiplaAlteracaoNormaVigente();
    sb.append(cit.getTexto(dispositivos));
  }
}
