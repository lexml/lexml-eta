export const validarRecursivo = (erros: LogErro[], modelo: any, comparado: any, caminho: string): void => {
  if (typeof modelo !== typeof comparado) {
    addErro(erros, caminho, `Tipo esperado '${typeof modelo}', recebido '${typeof comparado}'.`);
    return;
  }

  if ((modelo === null && comparado !== null) || (modelo !== null && comparado === null)) {
    addErro(erros, caminho, `Divergência de valor nulo.`);
    return;
  }

  if (Array.isArray(modelo)) {
    if (!Array.isArray(comparado)) {
      addErro(erros, caminho, `Esperado Array, recebido outro tipo.`);
      return;
    }

    if (modelo.length !== comparado.length) {
      addErro(erros, caminho, `Tamanho do array incorreto. Esperado: ${modelo.length}, Recebido: ${comparado.length}.`);
    }

    const maxLen = Math.max(modelo.length, comparado.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < modelo.length && i < comparado.length) {
        validarRecursivo(erros, modelo[i], comparado[i], `${caminho}[${i}]`);
      }
    }
    return;
  }

  if (typeof modelo === 'object' && modelo !== null) {
    const chavesModelo = Object.keys(modelo);
    const chavesComparado = Object.keys(comparado);

    const faltando = chavesModelo.filter(k => !chavesComparado.includes(k));
    if (faltando.length > 0) {
      addErro(erros, caminho, `Atributos faltando: [${faltando.join(', ')}].`);
    }

    const excedentes = chavesComparado.filter(k => !chavesModelo.includes(k));
    if (excedentes.length > 0) {
      addErro(erros, caminho, `Atributos inesperados: [${excedentes.join(', ')}].`);
    }

    for (const chave of chavesModelo) {
      if (chavesComparado.includes(chave)) {
        validarRecursivo(erros, modelo[chave], comparado[chave], `${caminho}.${chave}`);
      }
    }
    return;
  } else if (typeof modelo === 'string' && comparado !== null) {
    modelo = modelo
      .replace(/\n/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replaceAll('\\"', "'");
    comparado = comparado
      .replace(/\n/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replaceAll('\\"', "'");
  }

  if (modelo !== comparado) {
    addErro(erros, caminho, `Valor divergente. Esperado: '${modelo}' | Recebido: '${comparado}'.`);
  }
};

export const addErro = (erros: LogErro[], caminho: string, mensagem: string): void => {
  erros.push({ mensagem: mensagem, caminho: caminho, tipo: 'erro' });
};

export interface LogErro {
  mensagem: string;
  caminho: string;
  tipo: 'erro' | 'aviso';
}
