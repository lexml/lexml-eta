export const ROTULOS_PENA = ['Pena', 'Penalidade', 'Medida Administrativa', 'Infração'];

export const ROTULO_PENA_PADRAO = 'Pena –';

// Hífen, meia-risca, travessão e o U+0096 que aparece em textos copiados do Planalto.
const SEPARADOR_FINAL = /\s*[-–—\u0096]\s*$/;

// Texto do rótulo, sem o separador final nem espaços nas pontas.
export const textoDoRotuloPena = (rotulo?: string): string => (rotulo ?? '').replace(SEPARADOR_FINAL, '').trim();

export const normalizaRotuloPena = (rotulo?: string): string => {
  const texto = textoDoRotuloPena(rotulo);
  return texto ? `${texto} –` : ROTULO_PENA_PADRAO;
};

// Opção do modal que representa o rótulo: um item de ROTULOS_PENA (sem diferenciar maiúsculas) ou 'Outro'.
export const identidadeRotuloPena = (rotulo?: string): string => {
  const texto = textoDoRotuloPena(rotulo).toLowerCase();
  return ROTULOS_PENA.find(r => r.toLowerCase() === texto) ?? 'Outro';
};
