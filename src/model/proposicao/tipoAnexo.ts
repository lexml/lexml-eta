export interface TipoAnexo {
  codigo: string;
  nome: string;
}

export const TIPO_ANEXO_OUTRO: Readonly<TipoAnexo> = Object.freeze({ codigo: 'outro', nome: 'Outro' });

const textoNaoVazio = (valor: unknown): valor is string => typeof valor === 'string' && !!valor.trim();

// Ignora entrada inválida ou repetida e descarta `outro` do host; "Outro" fica sempre disponível, no fim.
export const normalizarTiposAnexos = (tipos?: readonly TipoAnexo[] | null): TipoAnexo[] => {
  const normalizados: TipoAnexo[] = [];
  const codigos = new Set<string>([TIPO_ANEXO_OUTRO.codigo]);

  for (const tipo of Array.isArray(tipos) ? tipos : []) {
    if (!tipo || !textoNaoVazio(tipo.codigo) || !textoNaoVazio(tipo.nome)) continue;
    const codigo = tipo.codigo.trim();
    if (codigos.has(codigo)) continue;
    codigos.add(codigo);
    normalizados.push({ codigo, nome: tipo.nome.trim() });
  }

  return [...normalizados, { ...TIPO_ANEXO_OUTRO }];
};
