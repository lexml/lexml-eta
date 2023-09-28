import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { substituiEspacosEntreTagsPorNbsp, substituiMultiplosEspacosPorNbsp, textoDiffAsHtml } from '../../util/string-util';

export class TextoDiff {
  quill!: EtaQuill;
  textoOriginal!: string;
  textoAntesRevisao!: string;
  textoAtual!: string;
  adicionado = false;
}

const OMISSIS = '....................';

export const exibirDiferencasDialog = (diff: TextoDiff): void => {
  Array.from(document.querySelectorAll('#slDialogExibirDiferencas')).forEach(el => document.body.removeChild(el));

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.id = 'slDialogExibirDiferencas';

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Exibir diferenças do texto atual com';

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

  const contemRevisao = !!diff.textoAntesRevisao;

  let diferencaModificado = textoDiffAsHtml(diff.textoOriginal, diff.textoAtual, 'diffWords');
  let diferencaSemEspacosDuplicados = diferencaModificado.replace(/\s+/g, ' ');
  diferencaModificado = substituiEspacosEntreTagsPorNbsp(textoDiffAsHtml(diferencaSemEspacosDuplicados, diferencaModificado, 'diffChars'), ['ins', 'del']);

  const tabModificado = !diff.adicionado && diferencaModificado !== diff.textoOriginal ? `<sl-tab slot="nav" panel="modificado"> Texto original </sl-tab>` : '';
  const tabModificadoRevisao = contemRevisao ? `<sl-tab slot="nav" panel="modificadoRevisao">Texto antes da revisão</sl-tab>` : '';

  let diferencaEntreTextoAtualETextoAntesRevisao = contemRevisao ? textoDiffAsHtml(diff.textoAntesRevisao, diff.textoAtual, 'diffWords') : undefined;
  if (contemRevisao) {
    diferencaSemEspacosDuplicados = diferencaEntreTextoAtualETextoAntesRevisao!.replace(/\s+/g, ' ');
    diferencaEntreTextoAtualETextoAntesRevisao = substituiEspacosEntreTagsPorNbsp(
      textoDiffAsHtml(diferencaSemEspacosDuplicados, diferencaEntreTextoAtualETextoAntesRevisao!, 'diffChars'),
      ['ins', 'del']
    );
  }

  diff.textoOriginal = substituiMultiplosEspacosPorNbsp(diff.textoOriginal);
  diff.textoAtual = substituiMultiplosEspacosPorNbsp(diff.textoAtual);
  if (contemRevisao) {
    diff.textoAntesRevisao = substituiMultiplosEspacosPorNbsp(diff.textoAntesRevisao);
  }
  const tabPanelModificado =
    !diff.adicionado && diferencaModificado !== diff.textoOriginal
      ? `<sl-tab-panel name="modificado">

        <sl-card class="card-header texto-alterado">
          <div slot="header">
            Texto original
          </div>
          <p class="texto-quill">
            ${diff.textoOriginal}
          </p>
        </sl-card>

        <sl-card class="card-header texto-alterado">
          <div slot="header">
            Diferença
          </div>
          <p class="texto-quill">
            ${diferencaModificado}
          </p>
        </sl-card>

        <sl-card class="card-header texto-alterado">
          <div slot="header">
          Texto atual
          </div>
          <p class="texto-quill">
            ${diff.textoAtual}
          </p>
        </sl-card>

      </sl-tab-panel>`
      : '';

  const tabPanelModificadoRevisao = contemRevisao
    ? `<sl-tab-panel name="modificadoRevisao">

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              Texto antes da revisão
            </div>
            <p class="texto-quill">
              ${diff.textoAntesRevisao}
            </p>
          </sl-card>

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              Diferença
            </div>
            <p class="texto-quill">
              ${diferencaEntreTextoAtualETextoAntesRevisao!}
            </p>
          </sl-card>

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              Texto atual
            </div>
            <p class="texto-quill">
              ${diff.textoAtual}
            </p>
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
      text-decoration: none;
    }

    .texto-alterado del {
      background-color: #ffc6c6;
    }

    p .texto-quill {
      white-space: pre-wrap;
      text-align: justify;
      text-indent: 0 !important;
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
      width: 33%;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    @media (max-width: 768px) {
      sl-card {
        width: 100%;
      }
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
  if (diff.textoAtual.includes('....')) {
    diff.textoAtual = OMISSIS;
  }
  return diff;
};
