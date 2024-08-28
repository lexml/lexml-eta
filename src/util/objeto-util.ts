export class ObjetoUtil {
  static arrayIgual(valor1: unknown, valor2: unknown): boolean {
    if (!Array.isArray(valor1) || !Array.isArray(valor2)) {
      return false;
    }
    const v1: unknown[] = valor1 as unknown[];
    const v2: unknown[] = valor2 as unknown[];

    if (v1.length !== v2.length) {
      return false;
    }

    for (let i = 0; i < v1.length; i++) {
      if (!ObjetoUtil.igual(v1[i], v2[1])) {
        return false;
      }
    }
    return true;
  }

  static igual(valor1: unknown, valor2: unknown): boolean {
    if (typeof valor1 !== typeof valor2) {
      return false;
    }

    if (Array.isArray(valor1) || Array.isArray(valor2)) {
      return ObjetoUtil.arrayIgual(valor1, valor2);
    }

    if (typeof valor1 !== 'object') {
      return valor1 === valor2;
    }

    if (valor1 === valor2) {
      return true;
    }
    const chaves1: string[] = Object.keys(valor1 as any);
    const chaves2: string[] = Object.keys(valor2 as any);

    if (chaves1.length !== chaves2.length) {
      return false;
    }

    for (let i = 0; i < chaves1.length; i++) {
      if (!ObjetoUtil.igual(chaves1[i], chaves2[i])) {
        return false;
      }
    }
    return true;
  }
}

export const removeFromArray = (array: any[], element: any): void => {
  array.splice(array.indexOf(element), 1);
};

export const existInArray = (array: string[], value: string): boolean => {
  if (!array) {
    return false;
  }
  return array.includes(value);
};
