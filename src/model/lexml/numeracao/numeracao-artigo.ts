import { addSpaceRegex } from '../../../util/string-util';
import { Articulacao, Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';
import { getArticulacao } from '../hierarquia/hierarquia-util';
import { isNumeracaoValida } from './numeracao-util';

export function NumeracaoArtigo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoArtigoLcp95';
    PREFIXO = 'Art. ';
    SUFIXO = 'º';
    private ARTIGO_UNICO = 'Artigo único.';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      return addSpaceRegex(numero)
        .replace(/\./g, '')
        .replace(/artigo [uú]nico/i, '1')
        .replace(/(art[.]{1})/i, '')
        .replace(/[º]/i, '')
        .trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      if (this.numero === undefined || !dispositivo) {
        this.rotulo = '\u201C' + TipoDispositivo.artigo.name;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = this.numero + this.SUFIXO;
      } else if (this.numero !== undefined && dispositivo.isDispositivoAlteracao) {
        this.rotulo = '\u201C' + this.PREFIXO + this.numero + this.getSufixoNumeracao();
      } else {
        this.rotulo =
          (getArticulacao(dispositivo) as Articulacao).artigos.length === 1
            ? this.ARTIGO_UNICO
            : this.PREFIXO + this.numero === undefined
            ? undefined
            : this.PREFIXO + this.numero + this.getSufixoNumeracao();
      }
    }

    private getSufixoNumeracao(): string {
      const partes = this.numero?.split('-');
      return parseInt(partes![0] ?? '1', 10) > 9 ? '.' : this.SUFIXO;
    }
  };
}
