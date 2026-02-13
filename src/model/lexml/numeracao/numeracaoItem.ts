import { addSpaceRegex } from '../../../util/string-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { converteLetrasComplementoParaNumero, converteNumerosComplementoParaLetra, trataNumeroAndComplemento } from './numeracaoUtil';

export function NumeracaoItem<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoItemLcp95';
    private SUFIXO = '.';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      // Para itens aninhados (ex: "34.1)"), extrair apenas a última parte do número
      // O formato "34.1" indica que 34 é do pai e 1 é do filho
      // Então extraímos apenas o número final (1)
      const normalized = numero.trim().replace(/\.(\d+)/g, '-$1');

      // Tenta capturar padrão como "34-1" ou "34-1-2" ou "1-A"
      const match = /\d+(-[a-zA-Z0-9]+)+/.exec(normalized);
      if (match) {
        // Se encontrou padrão composto (ex: 34-1), pegar apenas a última parte numérica
        const parts = match[0].split('-');
        const lastPart = parts[parts.length - 1];
        // Se a última parte é um número puro, usar apenas ele (formato aninhado: 34.1 -> 1)
        if (/^\d+$/.test(lastPart)) {
          return lastPart;
        }
        // Se a última parte contém letra, retornar o formato composto (ex: 1-A)
        return match[0];
      }

      // Fallback: capturar número simples
      const num = /\d+/.exec(numero.trim());
      return num ? num[0] : addSpaceRegex(numero).trim().replace(/\.$/, '').trim();
    }

    private isNumeracaoValidaParaRotulo(numero: string): boolean {
      return /^\d{1,}(([-]?[a-zA-Z0-9]+){0,2})$/.test(numero);
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.numero = this.isNumeracaoValidaParaRotulo(temp) ? trataNumeroAndComplemento(temp, undefined, converteLetrasComplementoParaNumero) : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      this.rotulo =
        this.numero === undefined
          ? TipoDispositivo.item.name
          : trataNumeroAndComplemento(this.numero, undefined, dispositivo.isDispositivoAlteracao ? converteNumerosComplementoParaLetra : undefined) + this.SUFIXO;
    }
  };
}
