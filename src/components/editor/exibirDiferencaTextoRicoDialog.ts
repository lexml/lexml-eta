import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { substituiEspacosEntreTagsPorNbsp, textoDiffAsHtml } from '../../util/string-util';

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

  const diferencas = diff.textoAntesRevisao !== diff.textoAtual ? calcDiferenca(diff.textoAntesRevisao, diff.textoAtual) : `<p>Não existe diferença</p>`;

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

  diff.quill && diff.quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
};

const getOcorrenciasAberturaTag = (tag: string, texto: string): string[] => {
  const regexAberturaTag = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  return texto.match(regexAberturaTag) || [];
};

const transformatTagP = (texto: string): string => {
  const regexAberturaTag = new RegExp('<p\\b[^>]*>', 'gi');
  const regexFechamentoTag = new RegExp('</p>', 'gi');
  return texto.replace(regexAberturaTag, () => `\n`).replace(regexFechamentoTag, `[[fimP]]`);
};

const transformaTagImg = (texto: string, tags: any[]): string => {
  const regexTagImg = new RegExp('(<img\\b[^>]*>)', 'g');
  texto = texto.replace(regexTagImg, TAG_TRANSFORMED_AUX);

  while (texto.indexOf(TAG_TRANSFORMED_AUX) !== -1) {
    tags.forEach(tag => {
      texto = texto.replace(TAG_TRANSFORMED_AUX, TAG_TRANSFORMED + tag.index);
    });
  }

  return texto;
};

const replaceTagImg = (texto: string, listaTagsEncontradas: any[]): string => {
  listaTagsEncontradas.forEach(tag => {
    texto = texto.replace(TAG_TRANSFORMED + tag.index, tag[0]);
  });
  return texto;
};

const TAG_TRANSFORMED = 'tagImgTransformed';
const TAG_TRANSFORMED_AUX = 'tagImgTransformedAux';

const contemImagem = (texto: string): boolean => {
  const regexImg = /<img\b[^>]*>/g;
  return regexImg.test(texto);
};

const getAllTagsImg = (texto: string): any[] => {
  const regexImg = /<img\b[^>]*>/g;

  const listaTagsEncontradas = [] as any;
  let match;
  while ((match = regexImg.exec(texto))) {
    listaTagsEncontradas.push(match);
  }

  return listaTagsEncontradas;
};

export const calcDiferenca = (textoAntesRevisaoOriginal: string, textoAtualOriginal: string): string => {
  // Remove as tags <br> do texto
  const regexMatchBR = /<br\b[^>]*>/gi;
  let textoAntesRevisao = textoAntesRevisaoOriginal.replace(regexMatchBR, '');
  let textoAtual = textoAtualOriginal.replace(regexMatchBR, '');
  let replacedTagImg = false;

  // Identifica as aberturas de tags <p>
  const ocorrenciasTagPTextoAtual = getOcorrenciasAberturaTag('p', textoAtual);

  // Substitui as tags <p> por "\n" para que "textoDiffAsHtml (diffWords)" funcione corretamente
  textoAntesRevisao = transformatTagP(textoAntesRevisao);
  textoAtual = transformatTagP(textoAtual);

  let tagsImgTextoAntesRevisao;
  let tagsImgTextoAtual;

  if (contemImagem(textoAtual) || contemImagem(textoAntesRevisao)) {
    tagsImgTextoAntesRevisao = getAllTagsImg(textoAntesRevisao);
    tagsImgTextoAtual = getAllTagsImg(textoAtual);

    textoAntesRevisao = transformaTagImg(textoAntesRevisao, tagsImgTextoAntesRevisao);
    textoAtual = transformaTagImg(textoAtual, tagsImgTextoAtual);
    replacedTagImg = true;
  }

  // Calcula a diferença entre os textos
  let diferencas = textoDiffAsHtml(textoAntesRevisao, textoAtual, 'diffWords');
  if (!/<ins>|<del>/.test(diferencas)) {
    diferencas = substituiEspacosEntreTagsPorNbsp(textoDiffAsHtml(textoAntesRevisao, textoAtual, 'diffChars'), ['ins', 'del']);
  }

  if (replacedTagImg) {
    diferencas = replaceTagImg(diferencas, tagsImgTextoAntesRevisao);
    diferencas = replaceTagImg(diferencas, tagsImgTextoAtual);
  }

  // Substitui "\n" pelas ocorrencias de abertura de tags <p> e "[[fimP]]" por "</p>
  diferencas = ocorrenciasTagPTextoAtual.reduce((acc, p) => acc.replace(/\n/, p), diferencas).replace(/\[\[fimP\]\]/g, '</p>');
  diferencas = diferencas.replace(/(<p\b[^>]*>)(<\/p>)/g, '$1<br>$2');

  // Substitui inconsistências no fechamento de tags
  return diferencas.replace(/>>/g, '>');
};
