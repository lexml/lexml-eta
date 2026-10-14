import { Elemento } from '../../model/elemento';
import PrivateQuill from '../../internal/quill/private-quill';
import { adicionarTituloDispositivoAction, editarTituloDispositivoAction, removerTituloDispositivoAction } from '../../model/lexml/acao/atualizarTituloDispositivoAction';
import { getTextoSemHtml } from '../../util/string-util';
import { mensagensTitulo } from '../../model/lexml/dispositivo/dispositivoValidator';
import { sanitizarTituloDispositivo } from '../../util/html-util';

// O Quill separa linhas em <p>; o título é de linha única, então cada quebra vira um espaço.
const htmlDoEditor = (quill: any): string => sanitizarTituloDispositivo(quill.root.innerHTML.replace(/<\/p>\s*<p>/gi, ' '));

export const editarTituloDispositivoDialog = (elemento: Elemento, nomeDispositivo: string, quill: any, store: any): void => {
  const dialogElem = document.createElement('sl-dialog') as any;
  document.body.appendChild(dialogElem);
  dialogElem.label = elemento.tituloDispositivo === undefined ? 'Adicionar título do dispositivo' : 'Editar título';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
    <div class="titulo-dispositivo-toolbar">
      <button type="button" class="ql-italic" title="Itálico"></button>
      <button type="button" class="ql-underline" title="Sublinhado"></button>
      <button type="button" class="ql-script" value="sub" title="Subscrito"></button>
      <button type="button" class="ql-script" value="super" title="Sobrescrito"></button>
    </div>
    <div class="titulo-dispositivo-editor" style="min-height: 60px"></div>
    <div class="titulo-dispositivo-aviso" role="status" style="color: var(--sl-color-warning-700, #a15c07); margin-top: 8px"></div>
    <sl-button slot="footer" variant="default">Cancelar</sl-button>
    <sl-button slot="footer" variant="primary">Ok</sl-button>
    <sl-button slot="footer" variant="danger" class="titulo-dispositivo-remover" style="order: -1; margin-right: auto">Remover</sl-button>
  `);

  const toolbar = content.querySelector('.titulo-dispositivo-toolbar') as HTMLElement;
  const editor = content.querySelector('.titulo-dispositivo-editor') as HTMLElement;
  const aviso = content.querySelector('.titulo-dispositivo-aviso') as HTMLElement;
  const [cancelar, ok, remover] = Array.from(content.querySelectorAll('sl-button')) as any[];
  // Só há o que remover quando o dispositivo já tem título.
  if (elemento.tituloDispositivo === undefined) {
    remover.remove();
  }

  const fechar = (): void => {
    dialogElem.hide();
    dialogElem.remove();
  };

  ok.onclick = (): void => {
    if (ok.disabled) {
      return;
    }
    const novoTitulo = htmlDoEditor(editorQuill);
    if (novoTitulo !== elemento.tituloDispositivo) {
      const acao = elemento.tituloDispositivo === undefined ? adicionarTituloDispositivoAction : editarTituloDispositivoAction;
      store.dispatch(acao.execute(elemento, novoTitulo));
    }
    fechar();
  };

  remover.onclick = (): void => {
    store.dispatch(removerTituloDispositivoAction.execute(elemento));
    fechar();
  };

  cancelar.onclick = (): void => {
    quill.focus();
    fechar();
  };

  quill.blur();
  dialogElem.appendChild(content);

  const editorQuill = new PrivateQuill(editor, {
    formats: ['italic', 'underline', 'script'],
    modules: {
      toolbar: { container: toolbar },
      // Enter confirma (título de linha única).
      keyboard: { bindings: { confirmar: { key: 13, handler: (): boolean => (ok.dispatchEvent(new MouseEvent('click')), false) } } },
    },
    theme: 'snow',
  });

  // Título vazio não é confirmável: para eliminar o título há o botão Remover.
  const atualizarOk = (): void => {
    ok.disabled = getTextoSemHtml(htmlDoEditor(editorQuill).replace(/&nbsp;/g, ' ')) === '';
  };

  const atualizarAviso = (): void => {
    aviso.textContent = mensagensTitulo(htmlDoEditor(editorQuill), nomeDispositivo)
      .map(m => m.descricao)
      .join(' ');
  };

  editorQuill.setContents(editorQuill.clipboard.convert(elemento.tituloDispositivo ?? ''), 'silent');
  // Ao adicionar, o aviso de vazio só aparece depois que o usuário mexe no texto.
  if (elemento.tituloDispositivo !== undefined) {
    atualizarAviso();
  }
  atualizarOk();
  editorQuill.on('text-change', () => {
    atualizarOk();
    atualizarAviso();
  });

  dialogElem.show();
  setTimeout(() => {
    editorQuill.focus();
    editorQuill.setSelection(editorQuill.getLength(), 0);
  }, 0);
};
