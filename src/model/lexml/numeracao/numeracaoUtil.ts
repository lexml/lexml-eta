import { Articulacao, Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, isDispositivoEmenda } from '../../dispositivo/situacao';
import { isArtigo } from '../../dispositivo/tipo';
import { Elemento } from '../../elemento';
import { getDispositivoFromElemento } from '../../elemento/elementoUtil';
import {
  getArtigosPosterioresIndependenteAgrupador,
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipo,
  getDispositivoPosteriorMesmoTipo,
  getDispositivosPosterioresMesmoTipo,
  getProximoArtigoAnterior,
  isDispositivoAlteracao,
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

export const isNumeracaoZero = (numero: string): boolean => {
  return /^0(-[a-z]+)?$/i.test(numero);
};

export const isNumero = (numero: string): boolean => {
  return /^\d+$/.test(numero);
};

export const isNumeracaoValida = (numero: string): boolean => {
  return /^\d{1,}([-]?[\d]+)?$/.test(numero);
};

const isLetra = (letra: string): boolean => {
  return /[a-zA-Z]+/.test(letra);
};

export const isRomano = (numero: string): boolean => {
  return /^(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$/i.test(numero);
};

export const converteLetraParaNumeroArabico = (s: string): string => {
  if (!isLetra(s)) {
    return s;
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
  if (numeroRomano.startsWith('0')) {
    return '0';
  }
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
  let num = numero.search(/-/) === -1 ? parseInt(numero) : parseInt(numero.substring(0, numero.search(/-/)));
  const resto = numero.search(/-/) === -1 ? '' : numero.substring(numero.search(/-/));

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

export const trataNumeroAndComplemento = (numero: string, funcNumero?: any, funcComplemento?: any): string => {
  const num = numero.search(/-/) === -1 ? numero : numero.substring(0, numero.search(/-/));
  const resto = numero.search(/-/) === -1 ? '' : numero.substring(numero.search(/-/));

  const converted = num === '0' ? '0' : funcNumero ? funcNumero(num) : num;

  return converted + (resto ? funcComplemento(resto) : '');
};

export const converteNumerosComplementoParaLetra = (numero: string): string => {
  const partes = numero?.split('-');

  const novo = partes?.map(r => r && (isNumero(r) ? converteNumeroArabicoParaLetra(r)?.toUpperCase() : r));

  return novo?.length > 0 ? novo?.join('-') : '';
};

export const converteLetrasComplementoParaNumero = (numero: string): string => {
  const partes = numero?.split('-');

  const novo = partes?.map(r => r && (isLetra(r) ? converteLetraParaNumeroArabico(r) : r));

  return novo?.length > 0 ? novo?.join('-') : '';
};

export const comparaNumeracao = (a?: string, b?: string): number => {
  if (a === b) {
    return 0;
  }
  const partesA = a?.split('-');
  const partesB = b?.split('-');

  const [numA, ...remainingA] = partesA!;
  const [numB, ...remainingB] = partesB!;

  if (!numA || (numB && parseInt(numA) < parseInt(numB))) {
    return 1;
  }
  if (!numB || (numA && parseInt(numA) > parseInt(numB))) {
    return -1;
  }

  if (a && b && b.includes(a)) {
    return 1;
  }

  for (let i = 0; i < 3; i++) {
    const rA = i >= remainingA?.length ? 0 : remainingA[i];
    for (let j = 0; i < 3; i++) {
      const rB = j >= remainingB?.length ? 0 : remainingB[j];
      if (rA > rB) {
        return -1;
      }
      if (rA < rB) {
        return 1;
      }
    }
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

export const podeRenumerar = (articulacao: Articulacao, elemento: Elemento): boolean => {
  const dispositivo = getDispositivoFromElemento(articulacao, elemento);

  if (dispositivo === undefined) {
    return false;
  }
  return (
    elemento.hierarquia?.pai?.uuidAlteracao !== undefined &&
    elemento.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL &&
    elemento.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO &&
    !(
      isDispositivoAlteracao(dispositivo) &&
      dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
      getDispositivoPosteriorMesmoTipo(dispositivo)?.numero === '1' &&
      getDispositivoPosteriorMesmoTipo(dispositivo)?.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO
    )
  );
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

  // if(temOriginalAntes && !temOriginalDepois)
  return new SeqOrdem(seqOriginal + seqDispEmenda);
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
  const dispositivoAnterior = getDispositivoAnteriorMesmoTipo(d);
  const dispositivoPosterior = getDispositivoPosteriorMesmoTipo(d);

  if (dispositivoAnterior && isOriginal(dispositivoAnterior) && dispositivoPosterior && isOriginal(dispositivoPosterior)) {
    return dispositivoAnterior.numero + '-1';
  }

  return calculaSeqOrdem(d).getNumeracao(isDispositivoEmenda(d));
};

const mapValidacaoNumeracao = {
  Artigo: (numero: string): boolean => isNumero(numero) || /^(artigo )?[uúÚ]nico$/i.test(numero),
  Paragrafo: (numero: string): boolean => isNumero(numero) || /^(par[aáÁ]grafo )?[uúÚ]nico$/i.test(numero),
  Inciso: isRomano,
  Alinea: isLetra,
  Item: isNumero,
};

export const isNumeracaoValidaPorTipo = (numero: string, tipo: string): boolean => {
  const partes = numero.split('-');
  const partePrincipal = partes[0];
  const parteSufixo = partes.slice(1, partes.length).join('-');
  const fnValidacao = mapValidacaoNumeracao[tipo] || isRomano;
  const resultPartePrincipal = fnValidacao(partePrincipal) && partePrincipal !== '0';
  return partes.length === 1 ? resultPartePrincipal : resultPartePrincipal && isLetra(parteSufixo);
};

class SeqOrdem {
  seq: number;
  letras?: string;

  constructor(seq: number) {
    this.seq = seq;
  }

  addNovoSeqOrdem(seq2: number): void {
    if (this.seq > 0) {
      this.letras = '' + seq2;
    } else if (seq2 > 1) {
      this.letras = '' + --seq2;
    }
  }
  getNumeracao(isDispositivoEmenda: boolean): string {
    return '' + this.seq + (isDispositivoEmenda && this.letras ? '-' : '') + (this.letras ?? '');
  }
}
