export function gerarRefId(): string {
  return 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}
