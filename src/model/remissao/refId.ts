export function gerarRefId(): string {
  return 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

/** Id estável gravado em `<Remissao id="...">` quando a remissão está inválida — especificação 10. */
export function gerarIdRemissaoInvalida(): string {
  return '_ri' + Date.now();
}
