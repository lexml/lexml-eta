export enum TipoGenero {
  MASCULINO = 'masculino',
  FEMININO = 'feminino',
  INDEFINIDO = 'indefinido',
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface Genero {
  tipoGenero: string;
  artigoDefinido: string;
  pronomePossessivoSingular: string;
  pronomePossessivoPlural: string;
  artigoDefinidoSingular: string;
  artigoDefinidoPlural: string;
  artigoIndefinidoSingular: string;
  artigoDefinidoPrecedidoPreposicaoASingular: string;
  artigoDefinidoPrecedidoPreposicaoAPlural: string;
  contracaoEmArtigoDefinidoSingular: string;
}

export function GeneroFeminino<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'feminino';
    artigoDefinido = 'a';
    pronomePossessivoSingular = ' da ';
    pronomePossessivoPlural = ' das ';
    artigoDefinidoSingular = ' a ';
    artigoDefinidoPlural = ' as ';
    artigoIndefinidoSingular = ' uma ';
    artigoDefinidoPrecedidoPreposicaoASingular = ' à ';
    artigoDefinidoPrecedidoPreposicaoAPlural = ' às ';
    contracaoEmArtigoDefinidoSingular = ' na ';
  };
}

export function GeneroIndefinido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'indefinido';
    artigoDefinido = '';
    pronomePossessivoSingular = '';
    pronomePossessivoPlural = '';
    artigoDefinidoSingular = '';
    artigoDefinidoPlural = '';
    artigoIndefinidoSingular = '';
    artigoDefinidoPrecedidoPreposicaoASingular = '';
    artigoDefinidoPrecedidoPreposicaoAPlural = '';
    contracaoEmArtigoDefinidoSingular = '';
  };
}

export function GeneroMasculino<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Genero {
    tipoGenero = 'masculino';
    artigoDefinido = 'o';
    pronomePossessivoSingular = ' do ';
    pronomePossessivoPlural = ' dos ';
    artigoDefinidoSingular = ' o ';
    artigoDefinidoPlural = ' os ';
    artigoIndefinidoSingular = ' um ';
    artigoDefinidoPrecedidoPreposicaoASingular = ' ao ';
    artigoDefinidoPrecedidoPreposicaoAPlural = ' aos ';
    contracaoEmArtigoDefinidoSingular = ' no ';
  };
}

export const generoFeminino = GeneroFeminino(Object);
export const generoMasculino = GeneroMasculino(Object);
