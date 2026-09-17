export function gerarRefId(): string {
  return 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

let contadorIdRemissaoInvalida = 0;

/** Id estável gravado em `<Remissao id="...">` quando a remissão está inválida — especificação 10.
 * Contador com padding fixo evita colisão entre chamadas no mesmo milissegundo. */
export function gerarIdRemissaoInvalida(): string {
  return '_ri' + Date.now() + String(contadorIdRemissaoInvalida++).padStart(6, '0');
}
