export type ValidacaoNumeracao = 'rigida' | 'flexivel';

export const normalizaValidacaoNumeracao = (valor: unknown): ValidacaoNumeracao => (valor === 'flexivel' ? 'flexivel' : 'rigida');

// Modo do documento em edição; só é registrado depois de uma leitura bem-sucedida.
let modoAtual: ValidacaoNumeracao = 'rigida';

export const registraValidacaoNumeracao = (valor: unknown): void => {
  modoAtual = normalizaValidacaoNumeracao(valor);
};

export const getValidacaoNumeracao = (): ValidacaoNumeracao => modoAtual;

export const isValidacaoNumeracaoFlexivel = (): boolean => modoAtual === 'flexivel';
