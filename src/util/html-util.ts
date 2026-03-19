export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function stripHtml(texto: string): string {
  return texto.replace(/<[^>]+>/g, '');
}
