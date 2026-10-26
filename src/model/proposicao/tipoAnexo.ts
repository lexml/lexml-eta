export interface TipoAnexo {
  codigo: string;
  nome: string;
}

// Valor fixo do tipo de todo anexo adicionado, enquanto o campo de tipo está oculto na interface.
export const TIPO_ANEXO_NAO_INFORMADO: Readonly<TipoAnexo> = Object.freeze({ codigo: 'nao.informado', nome: 'Não informado' });

const textoNaoVazio = (valor: unknown): valor is string => typeof valor === 'string' && !!valor.trim();

// Ignora entrada inválida ou repetida e descarta `nao.informado` do host; "Não informado" fica sempre disponível, no fim.
export const normalizarTiposAnexos = (tipos?: readonly TipoAnexo[] | null): TipoAnexo[] => {
  const normalizados: TipoAnexo[] = [];
  const codigos = new Set<string>([TIPO_ANEXO_NAO_INFORMADO.codigo]);

  for (const tipo of Array.isArray(tipos) ? tipos : []) {
    if (!tipo || !textoNaoVazio(tipo.codigo) || !textoNaoVazio(tipo.nome)) continue;
    const codigo = tipo.codigo.trim();
    if (codigos.has(codigo)) continue;
    codigos.add(codigo);
    normalizados.push({ codigo, nome: tipo.nome.trim() });
  }

  return [...normalizados, { ...TIPO_ANEXO_NAO_INFORMADO }];
};
