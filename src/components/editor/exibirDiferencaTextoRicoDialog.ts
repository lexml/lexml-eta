import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { substituiEspacosEntreTagsPorNbsp, textoDiffAsHtml } from '../../util/string-util';
//import diff from 'html-diff-ts';

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

  const diferencas =
    diffTextoRico.textoAntesRevisao !== diffTextoRico.textoAtual ? calcDiferenca(diffTextoRico.textoAntesRevisao, diffTextoRico.textoAtual) : `<p>Não existe diferença</p>`;
  //const diferencas = diff(diffTextoRico.textoAntesRevisao, diffTextoRico.textoAtual);

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

const getOcorrenciasAberturaTag = (tag: string, texto: string): string[] => {
  const regexAberturaTag = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  return texto.match(regexAberturaTag) || [];
};

const transformatTagP = (texto: string): string => {
  const regexAberturaTag = new RegExp('<p\\b[^>]*>', 'gi');
  const regexFechamentoTag = new RegExp('</p>', 'gi');
  return texto.replace(regexAberturaTag, () => `\n`).replace(regexFechamentoTag, `tagPFim`);
};

const transformaTag = (texto: string, tags: any[], regex: any, padrao: string, padraoAux: string): string => {
  texto = texto.replace(regex, padraoAux);

  while (texto.indexOf(padraoAux) !== -1) {
    tags.forEach(tag => {
      texto = texto.replace(padraoAux, padrao + tag.index);
    });
  }

  return texto;
};

const replaceTag = (texto: string, listaTagsEncontradas: any[], padrao: string): string => {
  listaTagsEncontradas.forEach(tag => {
    texto = texto.replace(padrao + tag.index, tag[0]);
  });
  return texto;
};

const TAG_IMG_TRANSFORMED = 'tagImgTransformed';
const TAG_IMG_TRANSFORMED_AUX = 'tagImgTransformedAux';

const TAG_TD_TRANSFORMED = 'tagTdTransformed';
const TAG_TD_TRANSFORMED_END = 'tagTdTransformedEnd';
const TAG_TD_TRANSFORMED_AUX = 'tagTdTransformedAux';

const contemImagem = (texto: string): boolean => {
  const regexImg = /<img\b[^>]*>/g;
  return regexImg.test(texto);
};

const contemTd = (texto: string): boolean => {
  const regexTd = /<td\b[^>]*>/g;
  return regexTd.test(texto);
};

const getAllTags = (texto: string, regex: any): any[] => {
  //const regexImg = /<img\b[^>]*>/g;

  const listaTagsEncontradas = [] as any;
  let match;
  while ((match = regex.exec(texto))) {
    listaTagsEncontradas.push(match);
  }

  return listaTagsEncontradas;
};

const adicionaParagrafoInicioTabela = (texto: string): string => {
  //const regexExisteParagrafoAntesDeTabela = /<\/p>+<table\b[^>]*>/g;
  //const regexExisteParagrafoAntesDeTabela = /<p\b[^>]*>+<\/p>+<table\b[^>]*>/g;
  const regexExisteParagrafoAntesDeTabela = /(<p\b[^>]*>(?!<\/p>).*?<\/p>)(<table\b[^>]*>)/gim;

  if (regexExisteParagrafoAntesDeTabela.test(texto)) {
    texto = texto.replace(regexExisteParagrafoAntesDeTabela, '$1<p></p>$2');
  }
  return texto;
};

export const calcDiferenca = (textoAntesRevisaoOriginal: string, textoAtualOriginal: string): string => {
  // Remove as tags <br> do texto
  const regexMatchBR = /<br\b[^>]*>/gi;
  const regexFimTd = /<\/td>/g;

  let textoAntesRevisao = textoAntesRevisaoOriginal.replace(regexMatchBR, '');
  let textoAtual = textoAtualOriginal.replace(regexMatchBR, '');

  textoAntesRevisao = textoAntesRevisao.replace(regexFimTd, TAG_TD_TRANSFORMED_END);
  textoAtual = textoAtual.replace(regexFimTd, TAG_TD_TRANSFORMED_END);

  let replacedTagImg = false;
  let replacedTagTd = false;

  // Identifica as aberturas de tags <p>
  const ocorrenciasTagPTextoAtual = getOcorrenciasAberturaTag('p', textoAtual);

  //adiciona parágrafo antes da tag table
  textoAntesRevisao = adicionaParagrafoInicioTabela(textoAntesRevisao);
  textoAtual = adicionaParagrafoInicioTabela(textoAtual);

  // Substitui as tags <p> por "\n" para que "textoDiffAsHtml (diffWords)" funcione corretamente
  textoAntesRevisao = transformatTagP(textoAntesRevisao);
  textoAtual = transformatTagP(textoAtual);

  let tagsImgTextoAntesRevisao = [] as any;
  let tagsImgTextoAtual = [] as any;

  let tagsTdTextoAntesRevisao = [] as any;
  let tagsTdTextoAtual = [] as any;

  if (contemImagem(textoAtual) || contemImagem(textoAntesRevisao)) {
    const regex = /<img\b[^>]*>/g;
    tagsImgTextoAntesRevisao = getAllTags(textoAntesRevisao, regex);
    tagsImgTextoAtual = getAllTags(textoAtual, regex);

    textoAntesRevisao = transformaTag(textoAntesRevisao, tagsImgTextoAntesRevisao, regex, TAG_IMG_TRANSFORMED, TAG_IMG_TRANSFORMED_AUX);
    textoAtual = transformaTag(textoAtual, tagsImgTextoAtual, regex, TAG_IMG_TRANSFORMED, TAG_IMG_TRANSFORMED_AUX);
    replacedTagImg = true;
  }

  if (contemTd(textoAtual) || contemTd(textoAntesRevisao)) {
    const regex = /<td\b[^>]*>/g;
    tagsTdTextoAntesRevisao = getAllTags(textoAntesRevisao, regex);
    tagsTdTextoAtual = getAllTags(textoAtual, regex);

    textoAntesRevisao = transformaTag(textoAntesRevisao, tagsTdTextoAntesRevisao, regex, TAG_TD_TRANSFORMED, TAG_TD_TRANSFORMED_AUX);
    textoAtual = transformaTag(textoAtual, tagsTdTextoAtual, regex, TAG_TD_TRANSFORMED, TAG_TD_TRANSFORMED_AUX);
    replacedTagTd = true;
  }

  // Calcula a diferença entre os textos
  let diferencas = textoDiffAsHtml(textoAntesRevisao, textoAtual, 'diffWords');
  if (!/<ins>|<del>/.test(diferencas)) {
    diferencas = substituiEspacosEntreTagsPorNbsp(textoDiffAsHtml(textoAntesRevisao, textoAtual, 'diffChars'), ['ins', 'del']);
  }

  if (replacedTagImg) {
    diferencas = replaceTag(diferencas, tagsImgTextoAntesRevisao, TAG_IMG_TRANSFORMED);
    diferencas = replaceTag(diferencas, tagsImgTextoAtual, TAG_IMG_TRANSFORMED);
  }

  if (replacedTagTd) {
    diferencas = replaceTag(diferencas, tagsTdTextoAntesRevisao, TAG_TD_TRANSFORMED);
    diferencas = replaceTag(diferencas, tagsTdTextoAtual, TAG_TD_TRANSFORMED);
    diferencas = diferencas.replace(/<del>tagTdTransformedEnd/g, 'tagTdTransformedEnd<del>');
    diferencas = diferencas.replace(/<\/del>tagTdTransformedEnd/g, 'tagTdTransformedEnd</del>');

    diferencas = diferencas.replace(/<ins>tagTdTransformedEnd/g, 'tagTdTransformedEnd<ins>');
    diferencas = diferencas.replace(/<\/ins>tagTdTransformedEnd/g, 'tagTdTransformedEnd</ins>');

    diferencas = diferencas.replace(/<\/del>tagTdTransformedEnd/g, 'tagTdTransformedEnd</del>');

    // diferencas = diferencas.replace(/(<\/ins>)(\/n)(tagPFim)(tagTdTransformedEnd)/g, '$2$3$4$1');
    diferencas = diferencas.replace(/tagTdTransformedEnd/g, '</td>');
  }

  // Substitui "\n" pelas ocorrencias de abertura de tags <p> e "[[fimP]]" por "</p>
  diferencas = ocorrenciasTagPTextoAtual.reduce((acc, p) => acc.replace(/\n/, p), diferencas).replace(/tagPFim/g, '</p>');
  diferencas = diferencas.replace(/(<p\b[^>]*>)(<\/p>)/g, '$1<br>$2');

  // Substitui inconsistências no fechamento de tags
  return diferencas.replace(/>>/g, '>');
};
