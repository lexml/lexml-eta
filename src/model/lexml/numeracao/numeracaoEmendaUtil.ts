import { Dispositivo } from '../../dispositivo/dispositivo';
import { getDispositivoAnterior, getDispositivosPosterioresMesmoTipo, isOriginal } from '../hierarquia/hierarquiaUtil';
import { intToAlpha } from './numeracaoUtil';

export const calculaSeqOrdem = (d: Dispositivo): SeqOrdem => {
  const seqOriginal = contaIrmaosOriginaisAte(d);

  if (isOriginal(d)) {
    return new SeqOrdem(seqOriginal);
  }

  const seqDispEmenda = contaIrmaosNaoOriginaisConsecutivosAte(d);

  const temOriginalAntes = seqOriginal > 0;
  const temOriginalDepois = hasIrmaoOriginalDepois(d);

  if (!temOriginalAntes && !temOriginalDepois) {
    return new SeqOrdem(seqDispEmenda);
  }

  if (!temOriginalAntes && temOriginalDepois) {
    const seqOrdem = new SeqOrdem(0);
    seqOrdem.addNovoSeqOrdem(seqDispEmenda);

    return seqOrdem;
  }

  if (temOriginalAntes && temOriginalDepois) {
    const seqOrdem = new SeqOrdem(seqOriginal);
    seqOrdem.addNovoSeqOrdem(seqDispEmenda);

    return seqOrdem;
  }

  // if(temOriginalAntes && !temOriginalDepois) {
  return new SeqOrdem(seqOriginal + seqDispEmenda);
  // }
};

export const hasIrmaoOriginalDepois = (d: Dispositivo): boolean => {
  return getDispositivosPosterioresMesmoTipo(d).filter((dispositivo: Dispositivo) => isOriginal(dispositivo)).length > 0;
};

export const contaIrmaosOriginaisAte = (d: Dispositivo): number => {
  let i = 0;
  const tipo = d.tipo;

  do {
    if (isOriginal(d) && d.tipo === tipo) {
      i++;
    }
    d = getDispositivoAnterior(d)!;
  } while (d !== undefined);
  return i;
};

export const contaIrmaosNaoOriginaisConsecutivosAte = (d: Dispositivo): number => {
  let i = 0;
  const tipo = d.tipo;

  while (d !== undefined && !isOriginal(d) && d.tipo === tipo) {
    i++;
    d = getDispositivoAnterior(d)!;
  }
  return i;
};

export const calculaNumeracao = (d: Dispositivo): string => {
  return calculaSeqOrdem(d).getNumeracao();
};
class SeqOrdem {
  seq: number;
  letras?: string;

  constructor(seq: number) {
    this.seq = seq;
  }

  addNovoSeqOrdem(seq2: number): void {
    if (this.seq > 0) {
      this.letras = intToAlpha(seq2).toUpperCase();
    } else if (seq2 > 1) {
      this.letras = intToAlpha(seq2 - 1).toUpperCase();
    }
  }
  getNumeracao(): string {
    return this.seq + (this.letras ?? '');
  }
}
