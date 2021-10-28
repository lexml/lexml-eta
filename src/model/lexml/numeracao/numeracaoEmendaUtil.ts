import { Dispositivo } from '../../dispositivo/dispositivo';
import { getDispositivoAnterior, getDispositivoPosterior, isOriginal } from '../hierarquia/hierarquiaUtil';
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
    return new SeqOrdem(0, seqDispEmenda);
  }

  if (temOriginalAntes && temOriginalDepois) {
    return new SeqOrdem(seqOriginal, seqDispEmenda);
  }

  // if(temOriginalAntes && !temOriginalDepois) {
  return new SeqOrdem(seqOriginal + seqDispEmenda);
  // }
};

const hasIrmaoOriginalDepois = (d: Dispositivo): boolean => {
  const tipo = d.tipo;
  d = getDispositivoPosterior(d)!;
  while (d !== undefined) {
    if (isOriginal(d) && d.tipo === tipo) {
      return true;
    }
    d = getDispositivoPosterior(d)!;
  }
  return false;
};

const contaIrmaosOriginaisAte = (d: Dispositivo): number => {
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

const contaIrmaosNaoOriginaisConsecutivosAte = (d: Dispositivo): number => {
  let i = 0;
  const tipo = d.tipo;

  while (d !== undefined && !isOriginal(d) && d.tipo === tipo) {
    i++;
    d = getDispositivoAnterior(d)!;
  }
  return i;
};

class SeqOrdem {
  seq: number;
  letras?: string;

  constructor(seq: number, seq2 = 0) {
    this.seq = seq;

    if (seq > 0) {
      this.letras = intToAlpha(seq2).toUpperCase();
    } else if (seq2 > 1) {
      this.letras = intToAlpha(seq2 - 1).toUpperCase();
    }
  }
}
