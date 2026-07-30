// Fase 3a: tradução pura de delta entre o Quill (coordenadas absolutas do documento) e o Y.Text
// de um dispositivo (coordenadas locais [0, tamanho)). É o coração de correção da co-edição de texto,
// isolado do Quill para ser testável headless. Formatação/atributos ficam para a Fase 3b (texto puro aqui).

export interface OpDelta {
  retain?: number;
  insert?: string;
  delete?: number;
}

// Recorta um delta do Quill para as ops locais de UM blot de conteúdo [offset, offset+tamanho).
// As posições do delta são todas relativas ao documento ANTIGO; inserts não consomem o antigo.
export const recortarParaYText = (delta: OpDelta[], offset: number, tamanho: number): OpDelta[] => {
  const fim = offset + tamanho;
  let abs = 0; // posição no documento antigo (Quill)
  const ops: OpDelta[] = [];

  const emitirRetain = (n: number): void => {
    if (n > 0) {
      ops.push({ retain: n });
    }
  };

  for (const op of delta) {
    if (op.retain !== undefined) {
      const dentro = Math.min(abs + op.retain, fim) - Math.max(abs, offset);
      emitirRetain(dentro);
      abs += op.retain;
    } else if (op.insert !== undefined) {
      if (abs >= offset && abs <= fim) {
        ops.push({ insert: op.insert });
      }
      // insert não avança a posição no documento antigo
    } else if (op.delete !== undefined) {
      const dentro = Math.min(abs + op.delete, fim) - Math.max(abs, offset);
      if (dentro > 0) {
        ops.push({ delete: dentro });
      }
      abs += op.delete;
    }
  }

  // retain final não muda nada num Y.Text — descarta para uma delta mínima.
  while (ops.length && ops[ops.length - 1].retain !== undefined && ops[ops.length - 1].insert === undefined) {
    ops.pop();
  }
  return ops;
};

// Coloca as ops locais de um Y.Text na posição absoluta do blot, para aplicar no Quill (updateContents).
export const paraDeltaQuill = (opsYText: OpDelta[], offset: number): OpDelta[] => {
  const ops: OpDelta[] = [];
  if (offset > 0) {
    ops.push({ retain: offset });
  }
  return ops.concat(opsYText);
};
