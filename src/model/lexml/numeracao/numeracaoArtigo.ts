import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { isAgrupador } from '../../dispositivo/tipo';
import { getArticulacao, isDispositivoCabecaAlteracao } from '../hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { isDispositivoAlteracao } from './../hierarquia/hierarquiaUtil';
import { converteLetrasComplementoParaNumero, converteNumeroArabicoParaLetra, isNumeracaoValida, trataNumeroAndComplemento, formatarMilhares } from './numeracaoUtil';

export function NumeracaoArtigo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoArtigoLcp95';
    PREFIXO = 'Art. ';
    SUFIXO = 'º';
    private ARTIGO_UNICO = 'Artigo único.';
    numero?: string;
    rotulo?: string;
    informouArtigoUnico = false;

    private normalizaNumeracao(numero: string): string {
      return numero
        .replace(/["”“]/g, '')
        .replace(/\./g, '')
        .replace(/artigo [uú]nico/i, '1')
        .replace(/(art[.]{0,1})/i, '')
        .replace(/[º]/i, '')
        .trim();
    }

    private isNumeracaoComComplementoAlfabetico(numero: string): boolean {
      return /^\d{1,}[º]?(([-]?[a-zA-Z]+){0,2})$/.test(numero);
    }

    private isNumeracaoComComplementoNumerico(numero: string): boolean {
      return /^\d{1,}[º]?(([-]?[1-9]+){0,2})$/.test(numero);
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.informouArtigoUnico = /.*[uú]nico/i.test(rotulo);
      this.numero = this.informouArtigoUnico
        ? '1'
        : this.isNumeracaoComComplementoAlfabetico(temp)
        ? trataNumeroAndComplemento(temp, undefined, converteLetrasComplementoParaNumero)
        : this.isNumeracaoComComplementoNumerico(temp)
        ? temp
        : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      if (dispositivo === undefined) {
        this.rotulo = TipoDispositivo.artigo.descricao;
      } else if (this.numero === undefined) {
        this.rotulo = dispositivo.tipo;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = this.PREFIXO + this.numero + this.SUFIXO;
      } else if (isDispositivoCabecaAlteracao(dispositivo) || (isDispositivoAlteracao(dispositivo) && isAgrupador(dispositivo.pai!) && dispositivo.pai!.filhos.length === 1)) {
        this.rotulo = this.informouArtigoUnico ? this.ARTIGO_UNICO : this.PREFIXO + this.getNumeroAndSufixoNumeracao(dispositivo);
      } else {
        getArticulacao(dispositivo).artigos.length === 1
          ? (this.rotulo = this.ARTIGO_UNICO)
          : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.getNumeroAndSufixoNumeracao(dispositivo));
      }
    }

    private getNumeroAndSufixoNumeracao(dispositivo: Dispositivo, paraComandoEmenda = false): string {
      const partes = this.numero?.split('-');
      const [num, ...remaining] = partes!;
      const ordinal = +(num ?? '1') > 0 && parseInt(num ?? '1', 10) < 10;
      return (
        (ordinal ? num + this.SUFIXO : formatarMilhares(num)) +
        (remaining.length > 0
          ? '-' +
            remaining
              ?.map(str => (dispositivo.isDispositivoAlteracao ? converteNumeroArabicoParaLetra(str) : str))
              .join('-')
              .toUpperCase()
          : '') +
        (!paraComandoEmenda && (!ordinal || remaining.length) ? '.' : '')
      );
    }

    getNumeracaoParaComandoEmenda(dispositivo: Dispositivo): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; //TipoDispositivo.artigo.descricao?.toLowerCase() + '';
      }
      if (this.informouArtigoUnico) {
        return 'artigo único';
      }
      return this.getNumeroAndSufixoNumeracao(dispositivo, true);
    }

    getNumeracaoComRotuloParaComandoEmenda(dispositivo: Dispositivo): string {
      if (this.numero === undefined) {
        return TipoDispositivo.artigo.descricao?.toLowerCase() + ' [ainda não numerado]';
      }
      if (this.informouArtigoUnico) {
        return 'artigo único';
      }
      return 'art. ' + this.getNumeroAndSufixoNumeracao(dispositivo, true);
    }
  };
}
