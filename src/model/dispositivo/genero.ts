export enum TipoGenero {
  MASCULINO = 'masculino',
  FEMININO = 'feminino',
  INDEFINIDO = 'indefinido',
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface Genero {
  tipoGenero: string;
  artigoDefinido: string;
}

export function GeneroFeminino<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'feminino';
    artigoDefinido = 'a';
  };
}

export function GeneroIndefinido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'indefinido';
    artigoDefinido = '';
  };
}

export function GeneroMasculino<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'masculino';
    artigoDefinido = 'o';
  };
}
