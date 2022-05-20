import { isDispositivoAlteracao } from './../hierarquia/hierarquiaUtil';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { ClassificacaoDocumento } from '../../documento/classificacao';
import { getArticulacao, isDispositivoCabecaAlteracao } from '../hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { converteNumeroArabicoParaLetra, isNumeracaoValida } from './numeracaoUtil';

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

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.informouArtigoUnico = /.*[uú]nico/i.test(rotulo);
      this.numero = this.informouArtigoUnico ? '1' : isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      if (dispositivo === undefined) {
        this.rotulo = TipoDispositivo.artigo.descricao;
      } else if (
        dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
        (dispositivo.situacao as DispositivoAdicionado).tipoEmenda === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER &&
        !isDispositivoAlteracao(dispositivo)
      ) {
        this.rotulo = 'Art.';
      } else if (this.numero === undefined) {
        this.rotulo = isDispositivoCabecaAlteracao(dispositivo) ? '\u201C' + dispositivo.tipo : dispositivo.tipo;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = this.PREFIXO + this.numero + this.SUFIXO;
      } else if (isDispositivoCabecaAlteracao(dispositivo)) {
        this.rotulo = '\u201C' + (this.informouArtigoUnico ? this.ARTIGO_UNICO : this.PREFIXO + this.getNumeroAndSufixoNumeracao());
      } else {
        getArticulacao(dispositivo).artigos.length === 1
          ? (this.rotulo = this.ARTIGO_UNICO)
          : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.getNumeroAndSufixoNumeracao());
      }
    }

    private getNumeroAndSufixoNumeracao(paraComandoEmenda = false): string {
      const partes = this.numero?.split('-');
      const [num, ...remaining] = partes!;
      const ordinal = parseInt(num ?? '1', 10) < 10;

      return (
        (ordinal ? num + this.SUFIXO : num) +
        (remaining.length > 0 ? '-' + remaining?.map(converteNumeroArabicoParaLetra).join('-').toUpperCase() : '') +
        (!paraComandoEmenda && (!ordinal || remaining.length) ? '.' : '')
      );
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; //TipoDispositivo.artigo.descricao?.toLowerCase() + '';
      }
      if (this.informouArtigoUnico) {
        return 'artigo único';
      }
      return this.getNumeroAndSufixoNumeracao(true);
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.artigo.descricao?.toLowerCase() + ' [ainda não numerado]';
      }
      if (this.informouArtigoUnico) {
        return 'artigo único';
      }
      return 'art. ' + this.getNumeroAndSufixoNumeracao(true);
    }
  };
}
