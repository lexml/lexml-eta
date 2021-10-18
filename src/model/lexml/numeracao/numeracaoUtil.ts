import { Elemento } from '../../elemento';

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
  return /^\d{1,}([-]{1}[a-zA-Z]+)?$/.test(numero);
};

const isLetra = (letra: string): boolean => {
  return /[a-zA-Z]+/.test(letra);
};

const isRomano = (numero: string): boolean => {
  return /^(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$/i.test(numero);
};

//
// Alínea
//
export const converteLetraParaNumeroArabico = (s: string): string => {
  if (!isLetra(s)) {
    throw new Error(`O valor ${s} não é uma sequência de letras válida.`);
  }

  s = s.toLowerCase();

  let acumulador = 0;

  [...s].forEach(atual => (acumulador = atual.toLowerCase().charCodeAt(0) - 97 + 1 + acumulador * 26));

  return acumulador.toString();
};

export const converteNumeroArabicoParaLetra = (numero: string): string => {
  let str = '';

  let n = parseInt(numero);
  let d = 0;
  while (n > 0) {
    d = (n - 1) % 26;
    n = (n - d - 1) / 26;
    str = str.replace(/^/, String.fromCharCode(97 + d));
  }
  return str;
};

//
// Inciso
//
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
  let num = parseInt(numero);

  for (const key in ALGARISMOS_ROMANOS) {
    temp = Math.floor(num / ALGARISMOS_ROMANOS[key]);
    if (temp >= 0) {
      for (let i = 0; i < temp; i++) {
        resultado += key;
      }
    }
    num = num % ALGARISMOS_ROMANOS[key];
  }
  return resultado;
};

export const trataComplemento = (numero: string, func?: any): string => {
  const partes = numero?.split('-');

  const resto = partes.length > 1 ? numero.substring(numero.indexOf('-')) : '';
  const converted = func ? func(partes![0]) : partes![0];

  return converted + resto?.toUpperCase();
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
  return elemento.hierarquia?.pai?.uuidAlteracao !== undefined;
};
