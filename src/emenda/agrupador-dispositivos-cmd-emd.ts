import { CmdEmdUtil } from './comando-emenda-util';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { getDispositivoPosterior } from './../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from './../model/lexml/tipo/tipoDispositivo';
import { removeFromArray } from './../util/objeto-util';
import { RangeDispositivos } from './range-dispositivos';
import { SequenciaRangeDispositivos } from './sequencia-range-dispositivos';

export class AgrupadorDispositivosCmdEmd {
  getSequencias(dispositivos: Dispositivo[]): SequenciaRangeDispositivos[] {
    const ranges = this.getRanges(dispositivos);

    const sequencias = this.agrupaRanges(ranges);

    // SequenciaRangeDispositivos.debug(sequencias);

    return sequencias;
  }

  private getRanges(dispositivos: Dispositivo[]): RangeDispositivos[] {
    let ranges = new Array<RangeDispositivos>();

    let range = new RangeDispositivos();
    for (const dispositivo of dispositivos) {
      if (!range.add(dispositivo)) {
        ranges.push(range);
        range = new RangeDispositivos();
        range.add(dispositivo);
      }
    }

    if (!range.isVazio()) {
      ranges.push(range);
    }

    ranges = AgrupadorDispositivosCmdEmd.separaRangesDeDoisDispositivos(ranges);

    return ranges;
  }

  static separaRangesDeDoisDispositivos(ranges: RangeDispositivos[]): RangeDispositivos[] {
    const ret = new Array<RangeDispositivos>();
    for (const range of ranges) {
      if (range.getQuantidadeDispositivos() === 2) {
        ret.push(new RangeDispositivos(range.getPrimeiro()));
        ret.push(new RangeDispositivos(range.getUltimo()));
      } else {
        ret.push(range);
      }
    }
    return ret;
  }

  private separaRangesDeDoisDispositivosEmSequencias(sequencias: SequenciaRangeDispositivos[]): void {
    for (const s of sequencias) {
      s.setRanges(AgrupadorDispositivosCmdEmd.separaRangesDeDoisDispositivos(s.getRanges()));
    }
  }

  private agrupaRanges(ranges: RangeDispositivos[]): SequenciaRangeDispositivos[] {
    const sequencias = new Array<SequenciaRangeDispositivos>();

    let sequencia = new SequenciaRangeDispositivos();
    for (const range of ranges) {
      if (sequencia.isVazio()) {
        sequencia.add(range);
        sequencias.push(sequencia);
      } else {
        if (this.isMesmaSequencia(sequencia, range)) {
          sequencia.add(range);
        } else {
          sequencia = new SequenciaRangeDispositivos();
          sequencia.add(range);
          sequencias.push(sequencia);
        }
      }
    }

    return sequencias;
  }

  private isMesmaSequencia(sequencia: SequenciaRangeDispositivos, range: RangeDispositivos): boolean {
    const dispSequencia = sequencia.getPrimeiroDispositivo();
    const dispRange = range.getUltimo();
    return (
      CmdEmdUtil.isMesmoTipoParaComandoEmenda(dispSequencia, dispRange) &&
      CmdEmdUtil.isMesmaSituacaoParaComandoEmenda(dispSequencia, dispRange) &&
      (dispSequencia.tipo === TipoDispositivo.artigo.tipo || dispSequencia.pai === dispRange.pai) &&
      dispSequencia.tipo !== TipoDispositivo.omissis.tipo
    );
  }

  separaDispositivosSeguidosDeOmissis(sequencias: SequenciaRangeDispositivos[]): SequenciaRangeDispositivos[] {
    const ret = new Array<SequenciaRangeDispositivos>();
    for (const s of sequencias) {
      ret.push(...this.separaDispositivosSeguidosDeOmissis2(s));
    }
    return ret;
  }

  private separaDispositivosSeguidosDeOmissis2(s: SequenciaRangeDispositivos): SequenciaRangeDispositivos[] {
    const ret = new Array<SequenciaRangeDispositivos>();

    let ns = new SequenciaRangeDispositivos();
    ret.push(ns);

    let nr = new RangeDispositivos();
    ns.add(nr);

    for (const r of s.getRanges()) {
      if (nr.getQuantidadeDispositivos() > 0) {
        nr = new RangeDispositivos();
        ns.add(nr);
      }

      for (const d of r.getDispositivos()) {
        // Identifica dispositivo seguido de omissis
        const posterior = getDispositivoPosterior(d);
        if (posterior && posterior.tipo === TipoDispositivo.omissis.tipo) {
          // Quebra em sequência com apenas este dispositivo
          if (this.adicionaouDispositivos(ns, nr)) {
            if (nr.getQuantidadeDispositivos() === 0) {
              ns.remove(nr);
            }
            ns = new SequenciaRangeDispositivos();
            ret.push(ns);
            nr = new RangeDispositivos();
            ns.add(nr);
          }
          ns.informarCaputDoDispositivo = true;
          nr.add(d);

          ns = new SequenciaRangeDispositivos();
          ret.push(ns);
          nr = new RangeDispositivos();
          ns.add(nr);
        } else {
          nr.add(d);
        }
      }
    }

    if (nr.getQuantidadeDispositivos() === 0) {
      ns.remove(nr);
    }
    if (ns.getQuantidadeRanges() === 0) {
      removeFromArray(ret, ns);
    }

    this.separaRangesDeDoisDispositivosEmSequencias(ret);

    return ret;
  }

  private adicionaouDispositivos(s: SequenciaRangeDispositivos, r: RangeDispositivos): boolean {
    return s.getQuantidadeRanges() > 1 || r.getQuantidadeDispositivos() > 0;
  }
}
