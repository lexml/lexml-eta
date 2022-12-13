// import { TipoDispositivo } from './../tipo/tipoDispositivo';
import { addSpaceRegex, StringBuilder } from '../../../util/string-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { ClassificacaoDocumento } from '../../documento/classificacao';
import { irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import {
  converteLetrasComplementoParaNumero,
  converteNumeroArabicoParaRomano,
  converteNumeroRomanoParaArabico,
  converteNumerosComplementoParaLetra,
  isNumeracaoValida,
  isNumeracaoZero,
  isRomano,
  trataNumeroAndComplemento,
} from './numeracaoUtil';

export function NumeracaoAgrupador<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAgrupadorLcp95';
    numero?: string;
    rotulo?: string;
    informouAgrupadorUnico = false;
    private getNomeAgrupadorUnico(dispositivo: Dispositivo): string {
      return `${dispositivo.descricao} únic${dispositivo.artigoDefinido}`.toLocaleUpperCase();
    }

    private normalizaNumeracao(numero: string): string {
      const numeracao = numero.split(' ')[1] ?? numero;
      const num = /[CDILMVX]+(-[a-zA-Z]+)*/.exec(numeracao);
      return num ? num[0] : addSpaceRegex(numeracao).trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      if (!rotulo || ['parte', 'livro', 'título', 'capítulo', 'seção', 'subseção'].some(s => s === rotulo.toLowerCase())) {
        return;
      }
      this.informouAgrupadorUnico = /.*[uú]nic[ao]/i.test(rotulo);
      if (this.informouAgrupadorUnico) {
        this.numero = '1';
      } else {
        const numAux = this.normalizaNumeracao(rotulo!);
        if (!numAux) {
          this.numero = undefined;
          return;
        }
        const temp = trataNumeroAndComplemento(numAux, isNumeracaoZero(rotulo) ? null : converteNumeroRomanoParaArabico, converteLetrasComplementoParaNumero);
        this.numero = isNumeracaoValida(temp) ? temp : undefined;
      }
    }

    createRotulo(dispositivo: Dispositivo): void {
      // const prefixo = dispositivo.descricao === undefined ? dispositivo.name ?? '' : dispositivo.descricao.toLocaleUpperCase();
      const prefixo =
        dispositivo.descricao === undefined
          ? dispositivo.name ?? ''
          : ['Secao', 'Subsecao'].includes(dispositivo.tipo)
          ? dispositivo.descricao
          : dispositivo.descricao.toLocaleUpperCase();

      if (
        this.numero === undefined ||
        (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
          (dispositivo.situacao as DispositivoAdicionado).tipoEmenda === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER &&
          dispositivo.pai?.tipo === 'Articulacao')
      ) {
        this.rotulo = prefixo; //TipoDispositivo[dispositivo.tipo.toLowerCase()].descricao?.toUpperCase() ?? dispositivo.tipo;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = prefixo + ' ' + this.numero;
      } else if (dispositivo.isDispositivoAlteracao && isDispositivoCabecaAlteracao(dispositivo)) {
        this.rotulo = this.informouAgrupadorUnico
          ? this.getNomeAgrupadorUnico(dispositivo)
          : prefixo +
            ' ' +
            trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, dispositivo.isDispositivoAlteracao ? converteNumerosComplementoParaLetra : undefined);
      } else {
        irmaosMesmoTipo(dispositivo).length === 1 && !(dispositivo.pai?.situacao as DispositivoAdicionado).existeNaNormaAlterada
          ? (this.rotulo = this.getNomeAgrupadorUnico(dispositivo))
          : (this.rotulo =
              prefixo +
              ' ' +
              trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, dispositivo.isDispositivoAlteracao ? converteNumerosComplementoParaLetra : undefined));
      }
    }

    setMaiusculaPrimeiraLetraDaDescricao(s: string): string {
      const partes = s.split('-');
      const [main, ...remaining] = partes!;
      const palavras = main.toLocaleLowerCase().split(' ');

      for (let i = 0; i < palavras.length; i++) {
        palavras[i] = isRomano(palavras[i]) ? palavras[1].toUpperCase() : palavras[i].charAt(0).toUpperCase() + palavras[i].slice(1);
      }

      return palavras.join(' ') + (remaining.length > 0 ? '-' + remaining.join('') : '');
    }

    getNumeracaoParaComandoEmenda(): string {
      const sb = new StringBuilder();

      sb.append(this.setMaiusculaPrimeiraLetraDaDescricao(this.rotulo!));

      return sb.toString();
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      return this.getNumeracaoParaComandoEmenda();
    }
  };
}
