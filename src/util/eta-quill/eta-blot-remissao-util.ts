// Evita que o Quill "resgate" Attributors (data-ref-id etc.) para um <span> genérico ao desembrulhar o <a>.
export function limparAtributosRemissaoAntesDoUnwrap(domNode: HTMLElement, atributos: string[]): void {
  atributos.forEach(atributo => domNode.removeAttribute(atributo));
}
