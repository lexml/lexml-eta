import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { textoDiffAsHtml } from '../../util/string-util';

export class TextoDiff {
  quill!: EtaQuill;
  textoOriginal!: string;
  textoAntesRevisao!: string;
  textoAposRevisao!: string;
  textoAtual!: string;
  adicionado = false;
}

const OMISSIS = '....................';

export const exibirDiferencasDialog = (diff: TextoDiff): void => {
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

  diff = trataOmissisDiff(diff);

  const diferencaModificado = textoDiffAsHtml(diff.textoOriginal, diff.textoAntesRevisao !== undefined ? diff.textoAntesRevisao : diff.textoAtual, 'diffWords');

  const contemRevisao = diff.textoAntesRevisao !== undefined && diff.textoAposRevisao !== undefined;

  const tabModificado =
    !diff.adicionado && diferencaModificado !== diff.textoOriginal
      ? `<sl-tab slot="nav" panel="modificado"> ${contemRevisao ? 'Modificado sem revisão' : 'Modificado'} </sl-tab>`
      : '';
  const tabModificadoRevisao = contemRevisao ? `<sl-tab slot="nav" panel="modificadoRevisao">Modificado com revisão</sl-tab>` : '';

  const tabPanelModificado =
    !diff.adicionado && diferencaModificado !== diff.textoOriginal
      ? `<sl-tab-panel name="modificado">

        <sl-card class="card-header texto-alterado">
          <div slot="header">
            Texto original
          </div>
          ${diff.textoOriginal}
        </sl-card>

        <sl-card class="card-header texto-alterado">
          <div slot="header">
            Diferença
          </div>
          ${diferencaModificado}
        </sl-card>

        <sl-card class="card-header texto-alterado">
          <div slot="header">
          Texto atual
          </div>
          ${diff.textoAtual}
        </sl-card>

      </sl-tab-panel>`
      : '';

  const tabPanelModificadoRevisao =
    diff.textoAntesRevisao !== undefined && diff.textoAposRevisao !== undefined
      ? `<sl-tab-panel name="modificadoRevisao">

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              Texto antes da revisão
            </div>
            ${diff.textoAntesRevisao}
          </sl-card>

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              Diferença
            </div>
            ${textoDiffAsHtml(diff.textoAntesRevisao, diff.textoAposRevisao, 'diffWords')}
          </sl-card>

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              ${diff.textoAposRevisao === diff.textoOriginal ? 'Texto original' : 'Texto após revisão (atual)'}
            </div>
            ${diff.textoAposRevisao}
          </sl-card>

        </sl-tab-panel>`
      : '';

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
  <div class="texto-alterado">
    <sl-tab-group>
      ${tabModificado}
      ${tabModificadoRevisao}

      ${tabPanelModificado}
      ${tabPanelModificadoRevisao}
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

const trataOmissisDiff = (diff: TextoDiff): TextoDiff => {
  if (diff.textoAtual.match('....')) {
    diff.textoAtual = OMISSIS;
  }

  if (diff.textoAposRevisao && diff.textoAposRevisao.match('....')) {
    diff.textoAposRevisao = OMISSIS;
  }
  return diff;
};
