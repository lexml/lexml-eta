import { EtaQuill } from '../../util/eta-quill/eta-quill';
import diff from 'html-diff-ts';

export class TextoRicoDiff {
  quill!: EtaQuill;
  textoAntesRevisao!: string;
  textoAtual!: string;
}

export const exibirDiferencasTextoRicoDialog = (diffTextoRico: TextoRicoDiff): void => {
  Array.from(document.querySelectorAll('#slDialogExibirDiferencasTextoRico')).forEach(el => document.body.removeChild(el));

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.id = 'slDialogExibirDiferencasTextoRico';

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Exibir diferenças após revisão';

  //const diferencas = diffTextoRico.textoAntesRevisao !== diffTextoRico.textoAtual ? calcDiferenca(diffTextoRico.textoAntesRevisao, diffTextoRico.textoAtual) : `<p>Não existe diferença</p>`;
  const diferencas = diffTextoRico.textoAntesRevisao !== diffTextoRico.textoAtual ? diff(diffTextoRico.textoAntesRevisao, diffTextoRico.textoAtual) : `<p>Não existe diferença</p>`;

  const fnDestroy = (): void => {
    try {
      diffTextoRico.quill && diffTextoRico.quill.focus();
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

    sl-dialog {
      --width: 90vw;
    }
    sl-dialog::part(base) {
      max-width: 1200px;
      margin: 0 auto;
    }

    .texto-alterado table {
      border-collapse: collapse;
      width: 100%;
    }

    sl-tab-panel::part(base) {
      padding-top: 1rem;
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: stretch;
      justify-content: center;
    }

    sl-card {
      box-shadow: var(--sl-shadow-x-large) !important;
      width: 100%;
    }

    sl-card::part(base){
      height: 100%;
    }

    sl-card::part(header) {
      background-color: var(--sl-color-neutral-200);
    }

    @media (max-width: 768px) {
      sl-tab-panel::part(base) {
        flex-direction: column;
      }
      sl-dialog {
        --width: 100vw !important;
      }
    }

    ins, ins > * {
      background-color: #c6ffc6 !important;
      text-decoration: none;
    }

    del, del > * {
      background-color: #ffc6c6;
    }
  </style>
  <div class="texto-alterado-texto-rico">
    <div class="texto-alterado">
    ${diferencas}
    </div>
  </div>


  <sl-button slot="footer" variant="primary">Fechar</sl-button>
  `);

  const fechar = content.querySelectorAll('sl-button')[0];

  fechar.onclick = (): Promise<void> => dialogElem?.hide();

  diffTextoRico.quill && diffTextoRico.quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
};
