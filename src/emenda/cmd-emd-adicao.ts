import { isAgrupador } from './../model/dispositivo/tipo';
import { removeEspacosDuplicados, StringBuilder } from './../util/string-util';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { CmdEmdUtil } from './comando-emenda-util';
import { AgrupadorDispositivosCmdEmd } from './agrupador-dispositivos-cmd-emd';
import { DispositivosWriterCmdEmd } from './dispositivos-writer-cmd-emd';
import { SequenciaRangeDispositivos } from './sequencia-range-dispositivos';
import { isArtigo } from '../model/dispositivo/tipo';
import { RangeDispositivos } from './range-dispositivos';
import { CmdEmdCombinavel } from './cmd-emd-combinavel';
import { NomeComGenero } from '../model/dispositivo/genero';
import { isDispositivoRaiz } from '../model/lexml/hierarquia/hierarquiaUtil';

export class CmdEmdAdicao extends CmdEmdCombinavel {
  constructor(public dispositivos: Dispositivo[]) {
    super(dispositivos);
  }

  getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string {
    // Acrescente-se art. 7º-A ao Capítulo II do Projeto, com a seguinte redação:
    // Acrescentem-se arts. 7º-A e 7º-B ao Capítulo II do Projeto, com a seguinte redação:
    // Acrescente-se art. 2º-A antes do Capítulo I do Projeto, com a seguinte redação:
    // Acrescentem-se art. 2º-A antes do Capítulo I e art. 2º-B ao Capítulo I do Projeto, com a
    // seguinte redação:
    // Acrescentem-se parágrafo único ao art. 1º e parágrafo único ao art. 2º do Projeto, com a
    // seguinte redação:
    // Acrescentem-se §§ 1º e 2º ao art. 1º e §§ 1º e 2º ao art. 2º do Projeto, com a seguinte
    // redação:
    // Acrescentem-se § 0 ao art. 9º, alínea “a” inciso I do § 4º do art. 9º e § 8º ao art. 9º
    // do Projeto, com a seguinte redação:

    const sb = new StringBuilder();

    const agrupador = new AgrupadorDispositivosCmdEmd();
    let sequencias = agrupador.getSequencias(this.dispositivos);
    sequencias = this.trataLocalizacaoArtigoEmAgrupador(sequencias);

    // Prefixo
    const plural = CmdEmdUtil.isSequenciasPlural(sequencias);
    if (isPrimeiro) {
      sb.append(plural ? 'Acrescentem-se ' : 'Acrescente-se ');
    } else {
      sb.append(isUltimo ? '; e ' : '; ');
      sb.append(plural ? 'acrescentem-se ' : 'acrescente-se ');
    }

    // Dispositivos
    const dispositivosWriter = new DispositivosWriterCmdEmd();
    sb.append(dispositivosWriter.getTexto(sequencias));

    // Sufixo
    if (isUltimo) {
      const ultimaSequencia = sequencias[sequencias.length - 1];
      if (!isArtigo(ultimaSequencia.getPrimeiroDispositivo()) || ultimaSequencia.localizarArtigoEmAgrupador) {
        sb.append(refGenericaProjeto.genero.pronomePossessivoSingular);
      } else {
        sb.append(refGenericaProjeto.genero.artigoDefinidoPrecedidoPreposicaoASingular);
      }
      sb.append(refGenericaProjeto.nome);
      sb.append(isPrimeiro ? ', com a seguinte redação:' : ', nos termos a seguir:');
    }

    return removeEspacosDuplicados(sb.toString());
  }

  private trataLocalizacaoArtigoEmAgrupador(sequencias: SequenciaRangeDispositivos[]): SequenciaRangeDispositivos[] {
    const ret = new Array<SequenciaRangeDispositivos>();

    for (const sequencia of sequencias) {
      if (isArtigo(sequencia.getPrimeiroDispositivo())) {
        ret.push(...this.trataLocalizacaoArtigoAgrupadorSequencia(sequencia));
      } else {
        ret.push(sequencia);
      }
    }

    return ret;
  }

  private trataLocalizacaoArtigoAgrupadorSequencia(sequencia: SequenciaRangeDispositivos): SequenciaRangeDispositivos[] {
    const sequencias = new Array<SequenciaRangeDispositivos>();

    // Junta todos os artigos dos ranges da sequencia em uma única lista
    const artigos = new Array<Dispositivo>();
    for (const range of sequencia.getRanges()) {
      artigos.push(...range.getDispositivos());
    }

    // Verifica a necessidade de reagrupar
    let reagrupar = false;
    for (const art of artigos) {
      if (this.isInclusaoArtigoProximoAgrupador(art)) {
        reagrupar = true;
        break;
      }
    }

    // Se não for necessário repassa a sequência como veio
    if (!reagrupar) {
      sequencias.push(sequencia);
      return sequencias;
    }

    // Vamos reagrupá-los em ranges dentro do mesmo pai
    let s = new SequenciaRangeDispositivos(); // Nova sequência
    s.localizarArtigoEmAgrupador = true;
    sequencias.push(s);

    let r = new RangeDispositivos(); // Novo range
    s.add(r);

    let artAnterior: Dispositivo | undefined = undefined;
    for (const art of artigos) {
      if (!r.isVazio()) {
        if (art.pai !== (artAnterior as Dispositivo).pai) {
          s = new SequenciaRangeDispositivos();
          s.localizarArtigoEmAgrupador = true;
          sequencias.push(s);

          r = new RangeDispositivos();
          s.add(r);
        } else if (CmdEmdUtil.getDispositivoIrmaoPosterior(artAnterior as Dispositivo) !== art) {
          r = new RangeDispositivos();
          s.add(r);
        }
      }

      r.add(art);

      artAnterior = art;
    }

    // Quebra ranges com 2 dispositivos em duas
    for (const s2 of sequencias) {
      s2.setRanges(AgrupadorDispositivosCmdEmd.separaRangesDeDoisDispositivos(s2.getRanges()));
    }

    return sequencias;
  }

  private isInclusaoArtigoProximoAgrupador(artigo: Dispositivo): boolean {
    return this.isInclusaoArtigoInicioAgrupador(artigo) || this.isInclusaoArtigoAntesAgrupador(artigo);
  }

  private isInclusaoArtigoInicioAgrupador(artigo: Dispositivo): boolean {
    // Dentro de agrupador de artigo
    const pai = artigo.pai as Dispositivo;
    if (isDispositivoRaiz(pai) || !isAgrupador(pai)) {
      return false;
    }

    // Verifica se ele é o primeiro artigo do pai
    return pai.filhos.indexOf(artigo) === 0;
  }

  private isInclusaoArtigoAntesAgrupador(disp: Dispositivo): boolean {
    // TODO Testar também último artigo do projeto seguido de agrupador

    // Verifica se o próximo artigo está no mesmo agrupador
    const pai = disp.pai;
    const irmao = CmdEmdUtil.getDispositivoIrmaoPosterior(disp);

    // Se existe próximo artigo com outro pai, é porque existe um agrupador entre eles
    return !!irmao && pai !== irmao.pai;
  }
}
