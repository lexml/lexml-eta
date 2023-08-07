import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { textoDiffAsHtml } from '../../util/string-util';

export class TextoDiff {
  quill!: EtaQuill;
  textoOriginal!: string;
  textoAntesRevisao!: string;
  textoAposRevisao!: string;
  textoAtual!: string;
}

export const exibirDiferencasDialog = (diff: TextoDiff): void => {
  const textoDiff = textoDiffAsHtml(diff.textoAtual, diff.textoOriginal, 'diffWords');

  Array.from(document.querySelectorAll('#slDialogExibirDiferencas')).forEach(el => document.body.removeChild(el));

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.id = 'slDialogExibirDiferencas';

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Texto alterado';

  const fnDestroy = (): void => {
    try {
      diff.quill && diff.quill.focus();
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

  diff.quill && diff.quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
};
