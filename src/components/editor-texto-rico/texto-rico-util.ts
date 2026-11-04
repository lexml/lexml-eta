export const ajustaHtmlToEditor = (html = ''): string => {
  return html
    .replace(/indent/g, 'ql-indent')
    .replace(/align-justify/g, 'ql-align-justify')
    .replace(/align-center/g, 'ql-align-center')
    .replace(/align-right/g, 'ql-align-right');
};

export const ajustaHtmlFromEditor = (html = ''): string => {
  const result = html
    .replace(/ql-indent/g, 'indent')
    .replace(/ql-align-justify/g, 'align-justify')
    .replace(/ql-align-center/g, 'align-center')
    .replace(/ql-align-right/g, 'align-right');

  return removeElementosTDOcultos(result);
};

export const removeElementosTDOcultos = (html = ''): string => {
  // O quill1table adiciona elementos td ocultos para identificar/gerenciar undo de células mescladas.
  // Esses elementos não devem fazer parte do texto html a ser salvo.

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const elementosOcultos = tempDiv.querySelectorAll('td[merge_id]');
  elementosOcultos.forEach((elemento: any) => elemento.parentNode?.removeChild(elemento));
  return tempDiv.innerHTML;
};

export const CLASSE_REVISAO_SELECIONADA = 'revisao-selecionada';
export const CLASSE_FRAGMENTO_CONTINUA_ANTERIOR = 'revisao-fragmento-continua-anterior';
export const CLASSE_FRAGMENTO_CONTINUA_PROXIMO = 'revisao-fragmento-continua-proximo';
export const CLASSES_DESTAQUE_REVISAO = [CLASSE_REVISAO_SELECIONADA, CLASSE_FRAGMENTO_CONTINUA_ANTERIOR, CLASSE_FRAGMENTO_CONTINUA_PROXIMO];

// Destaques da revisão e do comentário e o spellcheck do texto excluído existem só na tela, não no texto entregue.
export const removeMarcacaoDestaqueRevisao = (html = ''): string => {
  const classes = [...CLASSES_DESTAQUE_REVISAO, CLASSE_COMENTARIO_SELECIONADO];
  const atributos = ['spellcheck', COMENTARIO_FRAGMENTO_FINAL_ATTRIBUTE];
  if (![...classes, ...atributos].some(marca => html.includes(marca))) {
    return html;
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  atributos.forEach(atributo => tempDiv.querySelectorAll(`[${atributo}]`).forEach(el => el.removeAttribute(atributo)));
  classes.forEach(classe =>
    tempDiv.querySelectorAll(`.${classe}`).forEach(el => {
      el.classList.remove(classe);
      if (!el.classList.length) el.removeAttribute('class');
    })
  );
  return tempDiv.innerHTML;
};

export const removeElementosTDOcultosByRegex = (html = ''): string => {
  const regex = /<td[^>]*\smerge_id="[^"]*"[^>]*>[\s\S]*?<\/td>/gim;
  return html.replace(regex, '');
};

export const COMENTARIO_TAG = 'comentario';
export const COMENTARIO_ID_ATTRIBUTE = 'id-sequencia-comentario';
export const CLASSE_COMENTARIO_SELECIONADO = 'comentario-selecionado';
// Reserva, no último fragmento do trecho, o espaço do ícone do comentário.
export const COMENTARIO_FRAGMENTO_FINAL_ATTRIBUTE = 'data-comentario-fragmento-final';

// Desembrulha as tags de comentário mantendo o texto (colagem e texto entregue ao host).
export const removeMarcacaoComentarioDoContainer = (container: HTMLElement): string => {
  container.querySelectorAll(COMENTARIO_TAG).forEach(el => {
    while (el.firstChild) {
      el.parentNode?.insertBefore(el.firstChild, el);
    }
    el.remove();
  });
  [COMENTARIO_ID_ATTRIBUTE, COMENTARIO_FRAGMENTO_FINAL_ATTRIBUTE].forEach(atributo => container.querySelectorAll(`[${atributo}]`).forEach(el => el.removeAttribute(atributo)));
  container.querySelectorAll(`.${CLASSE_COMENTARIO_SELECIONADO}`).forEach(el => {
    el.classList.remove(CLASSE_COMENTARIO_SELECIONADO);
    if (!el.classList.length) el.removeAttribute('class');
  });
  return container.innerHTML;
};

export const possuiMarcacaoComentario = (html = ''): boolean => /<\s*comentario[\s>]/i.test(html) || html.includes(COMENTARIO_ID_ATTRIBUTE);

export const removeMarcacaoComentario = (html = ''): string => {
  if (!possuiMarcacaoComentario(html)) {
    return html;
  }
  const container = document.createElement('div');
  container.innerHTML = html;
  return removeMarcacaoComentarioDoContainer(container);
};
