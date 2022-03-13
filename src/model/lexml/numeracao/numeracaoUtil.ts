import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, isDispositivoEmenda } from '../../dispositivo/situacao';
import { isArtigo } from '../../dispositivo/tipo';
import { Elemento } from '../../elemento';
import {
  getArtigosPosterioresIndependenteAgrupador,
  getDispositivoAnterior,
  getDispositivosPosterioresMesmoTipo,
  getProximoArtigoAnterior,
  isOriginal,
  isOriginalAlteradoModificadoOuSuprimido,
} from '../hierarquia/hierarquiaUtil';

const I = 1,
  V = 5,
  X = 10,
  L = 50,
  C = 100,
  D = 500,
  M = 1000;

const ALGARISMOS_ROMANOS: { [key: string]: number } = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XV: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
};

export const isNumero = (numero: string): boolean => {
  return /^\d+$/.test(numero);
};

export const isNumeracaoValida = (numero: string): boolean => {
  return /^\d{1,}([-]?[a-zA-Z]+)?$/.test(numero);
};

const isLetra = (letra: string): boolean => {
  return /[a-zA-Z]+/.test(letra);
};

export const isRomano = (numero: string): boolean => {
  return /^(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$/i.test(numero);
};

export const converteLetraParaNumeroArabico = (s: string): string => {
  if (!isLetra(s)) {
    throw new Error(`O valor ${s} não é uma sequência de letras válida.`);
  }

  s = s.toLowerCase();

  let acumulador = 0;

  [...s].forEach(atual => (acumulador = atual.toLowerCase().charCodeAt(0) - 97 + 1 + acumulador * 26));

  return acumulador.toString();
};

export const converteNumeroArabicoParaLetra = (strNumero: string): string => {
  const number = parseInt(strNumero);
  return number ? intToAlpha(number) : strNumero;
};

export const intToAlpha = (numero: number): string => {
  let str = '';

  let d = 0;
  while (numero > 0) {
    d = (numero - 1) % 26;
    numero = (numero - d - 1) / 26;
    str = str.replace(/^/, String.fromCharCode(97 + d));
  }
  return str;
};

export const converteNumeroRomanoParaArabico = (numeroRomano: string): string => {
  if (!isRomano(numeroRomano)) {
    throw new Error("O valor '" + numeroRomano + "' não é um número em algarismo romano válido.");
  }

  numeroRomano = numeroRomano.toLowerCase();

  let tot = 0;
  let mode = I;
  for (let i = numeroRomano.length - 1; i >= 0; i--) {
    const value = numberCharToInt(numeroRomano.charAt(i));

    if (value > mode) {
      mode = value;
    }
    if (value < mode) {
      tot -= value;
    } else {
      tot += value;
    }
  }

  return tot.toString();
};

const numberCharToInt = (numeroRomano: string): number => {
  switch (numeroRomano.toLowerCase()) {
    case 'i':
      return I;
    case 'v':
      return V;
    case 'x':
      return X;
    case 'l':
      return L;
    case 'c':
      return C;
    case 'd':
      return D;
    case 'm':
      return M;
    default:
      return 0;
  }
};

export const converteNumeroArabicoParaRomano = (numero: string): string => {
  let resultado = '';
  let temp;
  let num = numero.search(/[a-zA-Z-]/) === -1 ? parseInt(numero) : parseInt(numero.substring(0, numero.search(/[a-zA-Z-]/)));
  const resto = numero.search(/[a-zA-Z-]/) === -1 ? '' : numero.substring(numero.search(/[a-zA-Z-]/));

  for (const key in ALGARISMOS_ROMANOS) {
    temp = Math.floor(num / ALGARISMOS_ROMANOS[key]);
    if (temp >= 0) {
      for (let i = 0; i < temp; i++) {
        resultado += key;
      }
    }
    num = num % ALGARISMOS_ROMANOS[key];
  }
  return resultado + resto;
};

export const trataComplemento = (numero: string, func?: any): string => {
  const num = numero.search(/-[a-zA-Z-]/) === -1 ? numero : numero.substring(0, numero.search(/-[a-zA-Z-]/));
  const resto = numero.search(/-[a-zA-Z-]/) === -1 ? '' : numero.substring(numero.search(/-[a-zA-Z-]/));

  const converted = func ? func(num) : num;

  return converted + resto?.toUpperCase();
};

export const converteLetraComplementoParaNumero = (numero: string): string => {
  const partes = numero?.split('-');
  const [num, ...remaining] = partes!;

  const novo = remaining.map(r => converteLetraParaNumeroArabico(r));

  return novo?.length > 0 ? num + '-' + novo?.join('-').toUpperCase() : num;
};

export const comparaNumeracao = (a?: string, b?: string): number => {
  if (!a || (b && a < b)) {
    return 1;
  }

  if (!b || (a && a > b)) {
    return -1;
  }

  return 0;
};

export const rotuloParaEdicao = (texto: string): string => {
  return texto
    .replace(/\./g, '')
    .replace(/["“]/g, '')
    .replace(/^Parte$/i, '')
    .replace(/^Livro$/i, '')
    .replace(/^Titulo$/i, '')
    .replace(/^Capitulo$/i, '')
    .replace(/^Secao$/i, '')
    .replace(/^Subsecao$/i, '')
    .replace(/^Artigo$/i, '')
    .replace(/^Paragrafo$/i, '')
    .replace(/^Inciso$/i, '')
    .replace(/^Alinea$/i, '')
    .replace(/^Item$/i, '')
    .replace(/Art/i, '')
    .replace(/§/i, '')
    .replace(/§/i, '')
    .replace(/[º]/i, '')
    .replace(/[–-][/s]*$/, '')
    .replace(/[)][/s]*$/, '')
    .trim();
};

export const podeRenumerar = (elemento: Elemento): boolean => {
  return elemento.hierarquia?.pai?.uuidAlteracao !== undefined && elemento.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL;
};

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
  const lista = isArtigo(d) ? getArtigosPosterioresIndependenteAgrupador(d) ?? [] : getDispositivosPosterioresMesmoTipo(d);
  return lista.filter((dispositivo: Dispositivo) => isOriginal(dispositivo)).length > 0;
};

export const contaIrmaosOriginaisAte = (d: Dispositivo): number => {
  let i = 0;
  const tipo = d.tipo;

  do {
    if ((isOriginal(d) || isOriginalAlteradoModificadoOuSuprimido(d)) && d.tipo === tipo) {
      i++;
    }
    d = isArtigo(d) ? getProximoArtigoAnterior(d.pai!, d)! : getDispositivoAnterior(d)!;
  } while (d !== undefined);
  return i;
};

export const contaIrmaosNaoOriginaisConsecutivosAte = (d: Dispositivo): number => {
  let i = 0;
  const tipo = d.tipo;

  while (d !== undefined && !isOriginal(d) && !isOriginalAlteradoModificadoOuSuprimido(d) && d.tipo === tipo) {
    i++;
    d = isArtigo(d) ? getProximoArtigoAnterior(d.pai!, d)! : getDispositivoAnterior(d)!;
  }
  return i;
};

export const calculaNumeracao = (d: Dispositivo): string => {
  return calculaSeqOrdem(d).getNumeracao(isDispositivoEmenda(d));
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
  getNumeracao(isDispositivoEmenda: boolean): string {
    return '' + this.seq + (isDispositivoEmenda && this.letras ? '-' : '') + (this.letras ?? '');
  }
}
