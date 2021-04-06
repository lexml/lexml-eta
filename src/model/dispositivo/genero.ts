export enum TipoGenero {
  MASCULINO = 'masculino',
  FEMININO = 'feminino',
  INDEFINIDO = 'indefinido',
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface Genero {
  tipoGenero: string;
  pronome: string;
}

export function GeneroFeminino<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'feminino';
    pronome = 'a ';
  };
}

export function GeneroIndefinido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'indefinido';
    pronome = '';
  };
}

export function GeneroMasculino<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'masculino';
    pronome = 'o ';
  };
}
