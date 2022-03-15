import { getDispositivoPosterior } from '../model/lexml/hierarquia/hierarquiaUtil';
import { StringBuilder } from '../util/string-util';
import { Dispositivo } from './../model/dispositivo/dispositivo';
import { DescricaoSituacao } from './../model/dispositivo/situacao';
import { TipoDispositivo } from './../model/lexml/tipo/tipoDispositivo';
import { CmdEmdUtil } from './comando-emenda-util';

export class RangeDispositivos {
  private dispositivos: Dispositivo[] = [];

  constructor(disp?: Dispositivo) {
    if (disp) {
      this.add(disp);
    }
  }

  isSituacao(descricaoSituacao: string): boolean {
    return !!this.dispositivos.length && this.dispositivos[0].situacao.descricaoSituacao === descricaoSituacao;
  }

  isTipo(nomeTipo: string): boolean {
    return !!this.dispositivos.length && this.dispositivos[0].tipo === nomeTipo;
  }

  add(dispositivo: Dispositivo): boolean {
    if (!this.podeAdicionarAoRange(dispositivo)) {
      return false;
    }
    this.dispositivos.push(dispositivo);
    return true;
  }

  addInicio(dispositivo: Dispositivo): void {
    this.dispositivos.splice(0, 0, dispositivo);
  }

  isUltimo(dispositivo: Dispositivo): boolean {
    return this.dispositivos.indexOf(dispositivo) === this.dispositivos.length - 1;
  }

  getPrimeiro(): Dispositivo {
    return this.dispositivos[0];
  }

  getUltimo(): Dispositivo {
    return this.dispositivos[this.dispositivos.length - 1];
  }

  getQuantidadeDispositivos(): number {
    return this.dispositivos.length;
  }

  getAnterior(i: number): Dispositivo | undefined {
    if (i < 1) {
      return undefined;
    }
    return this.dispositivos[i - 1];
  }

  getNumeracaoParaComandoEmenda(): string {
    let numeracao = this.dispositivos[0].getNumeracaoParaComandoEmenda();
    if (this.dispositivos.length > 1) {
      numeracao += ' a ' + this.getUltimo().getNumeracaoParaComandoEmenda();
    }
    return numeracao;
  }

  print(comando: StringBuilder, ranges: RangeDispositivos[]): void {
    if (this.isRotuloNecessario(ranges)) {
      this.printRotuloInicio(comando, ranges);
    } else {
      comando.append(this.dispositivos[0].getNumeracaoParaComandoEmenda());
    }

    this.printSeparadorProximoDispositivo(comando, ranges);

    this.printRotuloFimSeExistir(comando);
  }

  private printRotuloFimSeExistir(comando: StringBuilder): void {
    if (this.dispositivos.length >= 2) {
      comando.append(this.dispositivos[this.dispositivos.length - 1].getNumeracaoParaComandoEmenda());
    }
  }

  private printSeparadorProximoDispositivo(comando: StringBuilder, ranges: RangeDispositivos[]): void {
    const rangePosterior = this.getRangeDispositivosPosterior(ranges);

    if (this.dispositivos.length >= 3) {
      comando.append(' a ');
    } else if (this.dispositivos.length === 2 && !rangePosterior) {
      comando.append(' e ');
    } else if (this.dispositivos.length > 1 && this.dispositivos.length < 3 && rangePosterior) {
      comando.append(', ');
    }
  }

  private printRotuloInicio(comando: StringBuilder, range: RangeDispositivos[]): void {
    const rangePosterior = this.getRangeDispositivosPosterior(range);
    if ((this.hasApenasUmDispositivo() && !rangePosterior) || (rangePosterior && !this.isMesmoTipoSituacao(rangePosterior))) {
      comando.append(this.getRotuloCompletoSingular(this.dispositivos[0]));
    } else {
      comando.append(this.getRotuloCompletoPlural(this.dispositivos[0]));
    }
  }

  private isMesmoTipoSituacao(range: RangeDispositivos): boolean {
    return range.isTipo(this.dispositivos[0].tipo) && range.isSituacao(this.dispositivos[0].situacao.descricaoSituacao);
  }

  private hasApenasUmDispositivo(): boolean {
    return this.dispositivos.length === 1;
  }

  private isRotuloNecessario(ranges: RangeDispositivos[]): boolean {
    const anterior = this.getRangeDispositivosAnterior(ranges);
    if (!anterior || !anterior.isMesmoTipoSituacao(this)) {
      return true;
    }
    if (this.isSituacao(DescricaoSituacao.DISPOSITIVO_NOVO) && !this.isMesmoPai(anterior)) {
      return true;
    }
    return false;
  }

  private isMesmoPai(range: RangeDispositivos): boolean {
    return this.getPrimeiro().pai === range.getPrimeiro().pai;
  }

  private getRotuloCompletoSingular(dispositivo: Dispositivo): string {
    const sb = new StringBuilder();

    if (dispositivo.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_NOVO) {
      sb.append(dispositivo.artigoDefinidoSingular);
    } else {
      sb.append(' ');
    }
    const rotulo = dispositivo.getNumeracaoComRotuloParaComandoEmenda();

    if (rotulo.endsWith('.')) {
      sb.append(rotulo.substring(0, rotulo.indexOf('.')));
    } else {
      sb.append(rotulo);
    }

    return sb.toString();
  }

  private getRotuloCompletoPlural(dispositivo: Dispositivo): string {
    const sb = new StringBuilder();
    if (dispositivo.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_NOVO) {
      sb.append(dispositivo.artigoDefinidoPlural);
    } else {
      sb.append(' ');
    }

    sb.append(this.getTipoDispositivoPlural(dispositivo));
    sb.append(' ');
    sb.append(dispositivo.getNumeracaoParaComandoEmenda());

    return sb.toString();
  }

  private getRangeDispositivosAnterior(ranges: RangeDispositivos[]): RangeDispositivos | undefined {
    const pos = ranges.indexOf(this);
    if (pos > 0) {
      return ranges[pos - 1];
    }
    return undefined;
  }

  private getRangeDispositivosPosterior(ranges: RangeDispositivos[]): RangeDispositivos | undefined {
    if (ranges.length === 1) {
      return undefined;
    }
    const pos = ranges.indexOf(this);
    if (pos >= 0 && pos < ranges.length - 1) {
      return ranges[pos + 1];
    }
    return undefined;
  }

  private getTipoDispositivoPlural(dispositivo: Dispositivo): string {
    if (dispositivo.tipo === TipoDispositivo.artigo.tipo) {
      return 'arts.';
    } else if (dispositivo.tipo === TipoDispositivo.paragrafo.tipo) {
      return '§§';
    }

    return dispositivo.descricaoPlural?.toLocaleLowerCase() + '';
  }

  private podeAdicionarAoRange(atual: Dispositivo): boolean {
    if (this.isVazio()) {
      return true;
    }

    const ultimo = this.getUltimo();

    // Mesmo tipo
    if (ultimo.tipo !== atual.tipo) {
      return false;
    }

    // Mesma situação
    if (ultimo.situacao.descricaoSituacao !== atual.situacao.descricaoSituacao) {
      return false;
    }

    // Devem ter o mesmo pai, exceto no caso de artigo
    if (atual.tipo !== TipoDispositivo.artigo.tipo && atual.pai !== ultimo.pai) {
      return false;
    }

    // Atual segue o último
    if (getDispositivoPosterior(ultimo) !== atual) {
      return false;
    }

    // Ambos (último e atual) apresentam alteração integral
    // ou ambos não apresentam alteração integral
    if (CmdEmdUtil.isAlteracaoIntegral(ultimo) !== CmdEmdUtil.isAlteracaoIntegral(atual)) {
      return false;
    }

    return true;
  }

  isVazio(): boolean {
    return this.dispositivos.length === 0;
  }

  toString(): string {
    const sb = new StringBuilder();
    this.dispositivos.forEach(d => {
      sb.append(' ');
      sb.append('' + d.rotulo);
    });
    return sb.toString();
  }

  getDispositivos(): Dispositivo[] {
    return this.dispositivos;
  }

  getDispositivo(i: number): Dispositivo {
    return this.dispositivos[i];
  }
}
