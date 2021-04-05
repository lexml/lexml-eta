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
    const chaves1: string[] = Object.keys(valor1 as object);
    const chaves2: string[] = Object.keys(valor2 as object);

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
