import { ajustaHtmlParaColagem } from '../../redux/elemento/util/colarUtil';
import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { textoDiffAsHtml } from '../../util/string-util';

export class TextoRicoDiff {
  quill!: EtaQuill;
  textoAntesRevisao!: string;
  textoAtual!: string;
}

export const exibirDiferencasTextoRicoDialog = (diff: TextoRicoDiff): void => {
  Array.from(document.querySelectorAll('#slDialogExibirDiferencasTextoRico')).forEach(el => document.body.removeChild(el));

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.id = 'slDialogExibirDiferencasTextoRico';

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Exibir diferenças após revisão';

  diff.textoAntesRevisao = ajustaHtmlParaColagem(diff.textoAntesRevisao);
  diff.textoAtual = ajustaHtmlParaColagem(diff.textoAtual);

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

    sl-dialog {
      --width: 90vw;
    }
    sl-dialog::part(base) {
      max-width: 1200px;
      margin: 0 auto;
    }

    .texto-alterado ins {
      background-color: #c6ffc6;
    }

    .texto-alterado del {
      background-color: #ffc6c6;
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

  </style>
  <div class="texto-alterado-texto-rico">
    <sl-tab-group>
    <sl-tab slot="nav" panel="general">Alterações durante a revisão</sl-tab>
      <sl-tab-panel name="general">
        
        <sl-card class="card-header texto-alterado">
          <div slot="header">
            Diferença
          </div>
          ${diff.textoAntesRevisao !== diff.textoAtual ? textoDiffAsHtml(diff.textoAntesRevisao, diff.textoAtual, 'diffWords') : `<p>Não existe diferença</p>`}
        </sl-card>
      
      </sl-tab-panel>
    </sl-tab-group>
  </div>


  <sl-button slot="footer" variant="primary">Fechar</sl-button>
  `);

  const fechar = content.querySelectorAll('sl-button')[0];

  fechar.onclick = (): Promise<void> => dialogElem?.hide();

  diff.quill && diff.quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
};
