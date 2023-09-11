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

export const removeElementosTDOcultosByRegex = (html = ''): string => {
  const regex = /<td[^>]*\smerge_id="[^"]*"[^>]*>[\s\S]*?<\/td>/gim;
  return html.replace(regex, '');
};
