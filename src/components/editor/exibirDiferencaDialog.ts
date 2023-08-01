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

export const exibirDiferencasDialog = (diff: TextoDiff): void => {
  //const textoDiff = textoDiffAsHtml(diff.textoAtual, diff.textoOriginal, 'diffWords');

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

  const tabModificado = !diff.adicionado ? `<sl-tab slot="nav" panel="modificado">Modificado</sl-tab>` : '';
  const tabModificadoRevisao =
    diff.textoAntesRevisao !== undefined && diff.textoAposRevisao !== undefined ? `<sl-tab slot="nav" panel="modificadoRevisao">Modificado em revisão</sl-tab>` : '';

  const tabPanelModificado = !diff.adicionado
    ? `<sl-tab-panel name="modificado">
    <div class="texto-alterado">
      <p>Texto Original</p>
      ${diff.textoOriginal}
    </div>

    <p>Diferença</p>
    <div class="texto-alterado">
      ${textoDiffAsHtml(diff.textoOriginal, diff.textoAntesRevisao !== undefined ? diff.textoAntesRevisao : diff.textoAtual, 'diffWords')}
    </div>

    <p>Texto Atual</p>
    <div class="texto-alterado">
      ${diff.textoAtual}
    </div>
  </sl-tab-panel>`
    : '';

  const tabPanelModificadoRevisao =
    diff.textoAntesRevisao !== undefined && diff.textoAposRevisao !== undefined
      ? `<sl-tab-panel name="modificadoRevisao">
    <div class="texto-alterado">
      <p>Texto antes da revisão</p>
      ${diff.textoAntesRevisao}
    </div>

    <p>Diferença</p>
    <div class="texto-alterado">
      ${textoDiffAsHtml(diff.textoAntesRevisao, diff.textoAposRevisao, 'diffWords')}
    </div>

    <p>Texto após revisão (atual)</p>
    <div class="texto-alterado">
      ${diff.textoAposRevisao}
    </div>
  </sl-tab-panel>`
      : '';

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
