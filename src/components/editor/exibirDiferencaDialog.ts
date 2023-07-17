import { textoDiffAsHtml } from '../../util/string-util';

export const exibirDiferencasDialog = (texto1 = '', texto2 = '', quill?: any): void => {
  const textoDiff = textoDiffAsHtml(texto1, texto2, 'diffWords');

  Array.from(document.querySelectorAll('#slDialogExibirDiferencas')).forEach(el => document.body.removeChild(el));

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.id = 'slDialogExibirDiferencas';

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Texto alterado';

  const fnDestroy = (): void => {
    try {
      quill && quill.focus();
      dialogElem?.hide();
      document.body.removeChild(dialogElem);
    } catch (error) {
      // console.log(error);
    }
  };

  dialogElem.addEventListener('sl-after-hide', () => {
    setTimeout(() => fnDestroy(), 0);
  });

  const content = document.createRange().createContextualFragment(`
  <style>
    .texto-alterado ins {
      background-color: #c6ffc6;
    }

    .texto-alterado del {
      background-color: #ffc6c6;
    }
  </style>
  <div class="texto-alterado">
    ${textoDiff}
  </div>
  <sl-button slot="footer" variant="primary">Fechar</sl-button>
  `);

  const fechar = content.querySelectorAll('sl-button')[0];

  fechar.onclick = (): Promise<void> => dialogElem?.hide();

  quill && quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
};
