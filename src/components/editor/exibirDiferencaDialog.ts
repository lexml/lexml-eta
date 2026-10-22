import { Elemento } from '../../model/elemento';
import { RevisaoElemento } from '../../model/revisao/revisao';
import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { escapeHtml, sanitizarTituloDispositivo } from '../../util/html-util';
import { substituiEspacosEntreTagsPorNbsp, substituiMultiplosEspacosPorNbsp, textoDiffAsHtml } from '../../util/string-util';

export class TextoDiff {
  quill!: EtaQuill;
  textoOriginal!: string;
  textoAntesRevisao!: string;
  textoAtual!: string;
  // undefined = sem título; '' = título vazio.
  tituloAntesRevisao?: string;
  tituloAtual?: string;
  // Só a pena e a revisão alteracaoRotulo informam o rótulo.
  rotuloAntesRevisao?: string;
  rotuloAtual?: string;
  comRevisao = false;
  adicionado = false;
}

// O rótulo só entra quando a própria revisão o registra: a renumeração automática o muda sem gerar revisão.
const revisaoRegistraTrocaDeRotulo = (elemento: Elemento, revisao: RevisaoElemento): boolean =>
  elemento.tipo === 'Pena' || !!revisao.revisao?.split(',').some(operacao => operacao.split(';')[0] === 'alteracaoRotulo');

export const montaTextoDiff = (elemento: Elemento, quill: EtaQuill): TextoDiff => {
  const diff = new TextoDiff();
  diff.textoAtual = elemento.conteudo!.texto!;
  diff.tituloAtual = elemento.tituloDispositivo;
  diff.quill = quill;

  const revisao = elemento.revisao as RevisaoElemento;
  if (revisao) {
    diff.comRevisao = true;
    diff.textoAntesRevisao = revisao.elementoAntesRevisao!.conteudo!.texto!;
    diff.tituloAntesRevisao = revisao.elementoAntesRevisao!.tituloDispositivo;
    if (revisaoRegistraTrocaDeRotulo(elemento, revisao)) {
      diff.rotuloAntesRevisao = revisao.elementoAntesRevisao!.rotulo;
      diff.rotuloAtual = elemento.rotulo;
    }
    diff.textoOriginal = diff.textoAntesRevisao;
    // Em proposição todo dispositivo nasce novo: não há texto de norma vigente para a aba "Texto original".
    diff.adicionado = true;
  }
  return diff;
};

const OMISSIS = '....................';

// Título aparece quando existe em algum dos lados; o lado sem título mostra o marcador, que fica fora da comparação.
const montaTitulosDaRevisao = (diff: TextoDiff): { antes: string; diferenca: string; atual: string } => {
  if (diff.tituloAntesRevisao === undefined && diff.tituloAtual === undefined) {
    return { antes: '', diferenca: '', atual: '' };
  }
  const linha = (titulo?: string): string =>
    titulo === undefined ? '<div class="titulo-diff titulo-diff--ausente">Sem título</div>' : `<div class="titulo-diff">${sanitizarTituloDispositivo(titulo)}</div>`;
  const antes = sanitizarTituloDispositivo(diff.tituloAntesRevisao);
  const atual = sanitizarTituloDispositivo(diff.tituloAtual);
  return { antes: linha(diff.tituloAntesRevisao), diferenca: `<div class="titulo-diff">${comparaHtml(antes, atual)}</div>`, atual: linha(diff.tituloAtual) };
};

// Rótulo da pena aparece nos três cards; a comparação só marca o que mudou.
const montaRotulosDaRevisao = (diff: TextoDiff): { antes: string; diferenca: string; atual: string } => {
  if (diff.rotuloAntesRevisao === undefined && diff.rotuloAtual === undefined) {
    return { antes: '', diferenca: '', atual: '' };
  }
  const linha = (rotulo?: string): string => `<div class="rotulo-diff">${escapeHtml(rotulo ?? '')}</div>`;
  const antes = escapeHtml(diff.rotuloAntesRevisao ?? '');
  const atual = escapeHtml(diff.rotuloAtual ?? '');
  return { antes: linha(diff.rotuloAntesRevisao), diferenca: `<div class="rotulo-diff">${comparaHtml(antes, atual)}</div>`, atual: linha(diff.rotuloAtual) };
};

// Compara por palavras e depois por caracteres sobre o resultado sem espaços duplicados.
const comparaHtml = (antes: string, depois: string): string => {
  const porPalavras = textoDiffAsHtml(antes, depois, 'diffWords');
  const semEspacosDuplicados = porPalavras.replace(/\s+/g, ' ');
  return substituiEspacosEntreTagsPorNbsp(textoDiffAsHtml(semEspacosDuplicados, porPalavras, 'diffChars'), ['ins', 'del']);
};

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

  const contemRevisao = diff.comRevisao;

  const diferencaModificado = comparaHtml(diff.textoOriginal, diff.textoAtual);

  const tabModificado = !diff.adicionado && diferencaModificado !== diff.textoOriginal ? `<sl-tab slot="nav" panel="modificado"> Texto original </sl-tab>` : '';
  const tabModificadoRevisao = contemRevisao ? `<sl-tab slot="nav" panel="modificadoRevisao">Texto antes da revisão</sl-tab>` : '';

  const diferencaEntreTextoAtualETextoAntesRevisao = contemRevisao ? comparaHtml(diff.textoAntesRevisao ?? '', diff.textoAtual) : undefined;
  const titulos = montaTitulosDaRevisao(diff);
  const rotulos = montaRotulosDaRevisao(diff);

  diff.textoOriginal = substituiMultiplosEspacosPorNbsp(diff.textoOriginal);
  diff.textoAtual = substituiMultiplosEspacosPorNbsp(diff.textoAtual);
  if (contemRevisao) {
    diff.textoAntesRevisao = substituiMultiplosEspacosPorNbsp(diff.textoAntesRevisao ?? '');
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
            ${rotulos.antes}
            ${titulos.antes}
            <p class="texto-quill">
              ${diff.textoAntesRevisao}
            </p>
          </sl-card>

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              Diferença
            </div>
            ${rotulos.diferenca}
            ${titulos.diferenca}
            <p class="texto-quill">
              ${diferencaEntreTextoAtualETextoAntesRevisao!}
            </p>
          </sl-card>

          <sl-card class="card-header texto-alterado">
            <div slot="header">
              Texto atual
            </div>
            ${rotulos.atual}
            ${titulos.atual}
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

    .titulo-diff {
      font-weight: bold;
      margin: 0 0 0.5rem;
    }

    .rotulo-diff {
      font-weight: bold;
      margin: 0 0 0.5rem;
    }

    .titulo-diff--ausente {
      font-weight: normal;
      font-style: italic;
      color: var(--sl-color-neutral-500);
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
