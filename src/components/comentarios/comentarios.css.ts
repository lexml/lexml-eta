import { html } from 'lit';

export const comentariosCss = html`
  <style>
    lexml-eta-comentarios {
      display: block;
      height: 100%;
    }

    /* Cabeçalho e texto vazio no padrão da aba Notas. */
    .comentarios {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      padding: 10px;
      font-family: var(--eta-font-sans);
    }

    .comentarios__cabecalho {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 1rem 0 0.5rem;
    }

    .comentarios__cabecalho h4 {
      font-family: var(--eta-font-sans);
      font-style: normal;
      margin: 0;
    }

    .comentarios__ordenacao {
      font: inherit;
      font-size: 0.85rem;
      padding: 2px 4px;
      border: 1px solid var(--sl-color-gray-300);
      border-radius: 4px;
      background-color: white;
    }

    .comentarios__vazio {
      padding-left: 20px;
      font-family: var(--eta-font-serif);
      font-style: italic;
      color: var(--sl-color-gray-500);
    }

    .comentarios__lista {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.25rem 2px 0.5rem;
      overflow-y: auto;
    }

    .comentario-sequencia {
      border: 1px solid var(--sl-color-gray-300);
      border-radius: 6px;
      padding: 0.5rem;
      background-color: white;
      cursor: pointer;
    }

    .comentario-sequencia--selecionada {
      border-color: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.28);
    }

    .comentario-sequencia:focus-visible {
      outline: 2px solid var(--sl-color-primary-600);
      outline-offset: 2px;
    }

    .comentario-sequencia__topo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .comentario-sequencia__origem {
      font-size: 0.75rem;
      color: var(--sl-color-gray-600);
    }

    .comentario-sequencia__acoes,
    .comentario-item__acoes {
      display: flex;
      gap: 0.25rem;
    }

    .comentario-sequencia__acao,
    .comentario-item__acao {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 0;
      border-radius: 4px;
      padding: 2px 6px;
      background-color: transparent;
      color: var(--sl-color-gray-700);
      font: inherit;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .comentario-sequencia__acao:hover,
    .comentario-item__acao:hover {
      background-color: var(--sl-color-gray-100);
    }

    .comentario-sequencia__excluir,
    .comentario-item__excluir {
      color: var(--sl-color-danger-600);
    }

    .comentario-sequencia__trecho {
      margin: 0.4rem 0;
      padding: 0.15rem 0.5rem;
      border-left: 3px solid #fdd663;
      background-color: #fff8c5;
      font-size: 0.85rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .comentario-item {
      padding: 0.35rem 0;
    }

    .comentario-item--resposta {
      border-top: 1px solid var(--sl-color-gray-200);
      margin-left: 0.75rem;
    }

    .comentario-item__cabecalho {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .comentario-item__autor {
      font-weight: bold;
      font-size: 0.85rem;
    }

    .comentario-item__data {
      font-size: 0.75rem;
      color: var(--sl-color-gray-600);
    }

    /* O comentário é texto puro: as quebras de linha digitadas são preservadas. */
    .comentario-item__texto {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .comentario-dialog::part(panel) {
      max-width: min(560px, 95vw);
    }

    .comentario-modal__label {
      display: block;
      font-size: 0.85rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .comentario-modal__trecho blockquote {
      margin: 0 0 0.75rem;
      padding: 0.25rem 0.5rem;
      border-left: 3px solid #fdd663;
      background-color: #fff8c5;
      max-height: 6rem;
      overflow-y: auto;
    }

    .comentario-modal__textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 7rem;
      resize: vertical;
      font: inherit;
      padding: 0.5rem;
    }

    .comentario-modal__contador {
      display: block;
      text-align: right;
      font-size: 0.75rem;
      color: var(--sl-color-gray-600);
    }

    .comentario-modal__icone svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .comentario-confirmacao__titulo {
      font-weight: bold;
      margin: 0 0 0.5rem;
    }

    .comentario-confirmacao__texto {
      margin: 0;
    }
  </style>
`;
