import { html } from 'lit';

export const comentariosCss = html`
  <style>
    lexml-eta-comentarios {
      display: block;
      height: 100%;
    }
    /* Valores do lexml-emenda, padrão visual dos comentários. */
    .comentarios {
      font-family: var(--eta-font-sans);
      font-style: normal;
      min-height: 100%;
      padding: 10px;
      background: white;
      color: var(--sl-color-neutral-800);
    }
    .comentarios__cabecalho {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 1rem 0px 0.5rem;
    }
    .comentarios h4 {
      font-family: var(--eta-font-sans);
      font-size: 1rem;
      font-style: normal;
      margin: 0;
    }
    .comentarios__ordenacao-container {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--sl-color-neutral-600);
      font-size: 0.72rem;
    }
    .comentarios__ordenacao {
      width: 120px;
      height: 26px;
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: 4px;
      color: var(--sl-color-neutral-700);
      font: inherit;
      font-size: 0.78rem;
      background: white;
    }
    .comentarios-texto-vazio {
      padding-left: 20px;
      color: var(--sl-color-gray-500);
      font-style: italic;
    }
    .comentarios__lista {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0;
    }
    .comentario-sequencia {
      border: 1px solid #d9dee8;
      border-radius: 8px;
      background: white;
      box-sizing: border-box;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
      padding: 14px;
    }
    .comentario-sequencia--selecionada {
      border: 2px solid #93c5fd;
      background: #fbfdff;
      box-shadow: 0 0 0 3px #eaf4ff, 0 1px 2px rgba(15, 23, 42, 0.08);
    }
    .comentario-sequencia:focus-visible {
      outline: 0;
      background: #f5fbff;
    }
    .comentario-sequencia__topo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--sl-color-neutral-200);
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .comentario-sequencia__origem {
      display: inline-flex;
      align-items: center;
      min-height: 20px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1;
      padding: 0 8px;
    }
    .comentario-sequencia__origem--texto,
    .comentario-sequencia__origem--justificativa {
      border: 1px solid #e5e7eb;
      background: #f3f4f6;
      color: #4b5563;
    }
    .comentario-sequencia__acoes {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .comentario-sequencia__acao {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: 0;
      background: transparent;
      color: var(--sl-color-neutral-600);
      cursor: pointer;
      font: inherit;
      font-size: 0.8rem;
      line-height: 1;
      padding: 0;
    }
    .comentario-sequencia__seta {
      display: inline-block;
      position: relative;
      width: 11px;
      height: 8px;
      flex: none;
    }
    .comentario-sequencia__seta::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 1px;
      width: 9px;
      border-top: 1.5px solid currentColor;
    }
    .comentario-sequencia__seta::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 1px;
      width: 5px;
      height: 5px;
      border-left: 1.5px solid currentColor;
      border-bottom: 1.5px solid currentColor;
      transform: rotate(45deg);
    }
    .comentario-sequencia__acao:hover {
      color: var(--sl-color-primary-700);
    }
    .comentario-sequencia__acao--excluir {
      color: #ef4444;
      font-size: 1rem;
    }
    .comentario-sequencia__trecho {
      display: block;
      border-left: 3px solid #f59e0b;
      border-radius: 7px;
      background: #f3f2ed;
      color: #374151;
      font-family: var(--eta-font-serif);
      font-size: 0.88rem;
      font-style: italic;
      line-height: 1.45;
      margin: 0 0 12px;
      overflow: hidden;
      padding: 10px 12px;
      white-space: nowrap;
    }
    .comentario-sequencia__trecho-conteudo {
      display: inline-flex;
      max-width: 100%;
      min-width: 0;
      vertical-align: bottom;
    }
    .comentario-sequencia__trecho-conteudo::before,
    .comentario-sequencia__trecho-conteudo::after {
      content: '"';
      flex: none;
    }
    .comentario-sequencia__trecho-texto {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      padding: 0 2px;
      text-overflow: ellipsis;
      white-space: pre;
    }
    .comentario-sequencia__comentarios {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .comentario-item {
      color: #374151;
    }
    .comentario-item:not(:last-child) {
      border-bottom: 1px solid var(--sl-color-neutral-200);
      margin-bottom: 10px;
      padding-bottom: 10px;
    }
    .comentario-item--resposta {
      margin-left: 16px;
    }
    .comentario-item__cabecalho {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 4px;
    }
    .comentario-item__autor {
      color: #111827;
      font-weight: 600;
      font-size: 0.84rem;
    }
    .comentario-item__data {
      color: #8a94a3;
      font-size: 0.7rem;
      line-height: 1.2;
      margin-left: auto;
      padding-left: 8px;
      white-space: nowrap;
    }
    /* O comentário é texto puro: as quebras de linha digitadas são preservadas. */
    .comentario-item__texto {
      color: #5f6b7a;
      font-family: var(--eta-font-sans);
      font-size: 0.88rem;
      line-height: 1.45;
      margin: 0;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }
    .comentario-item__acoes {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .comentario-item__acao {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: 0;
      background: transparent;
      color: var(--sl-color-neutral-600);
      cursor: pointer;
      font: inherit;
      font-size: 0.75rem;
      padding: 0;
    }
    .comentario-item__acao:hover {
      color: var(--sl-color-primary-700);
    }
    .comentario-item__acao--excluir {
      color: #ef4444;
    }
    .comentario-dialog::part(panel) {
      width: min(440px, calc(100vw - 32px));
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.24);
    }
    .comentario-dialog--confirmacao::part(panel) {
      width: min(440px, calc(100vw - 32px));
    }
    .comentario-dialog--lista::part(panel) {
      width: min(430px, calc(100vw - 24px));
      max-height: calc(100vh - 32px);
    }
    .comentario-dialog::part(header) {
      padding: 5px 24px 10px;
      align-items: center;
      border-bottom: 1px solid var(--sl-color-neutral-200);
    }
    .comentario-dialog::part(title) {
      color: #111827;
      font-family: var(--eta-font-sans);
      font-size: 1.15rem;
      font-weight: 600;
      letter-spacing: 0;
      line-height: 1.3;
      padding-left: 0;
      padding-bottom: 10px;
    }
    .comentario-dialog::part(close-button) {
      align-items: center;
      border: 0;
      color: #111827;
      display: inline-flex;
      font-size: 1.3rem;
      font-weight: 700;
      height: 32px;
      justify-content: center;
      margin-right: 0;
      margin-top: 10px;
      padding: 4px;
      width: 32px;
    }
    .comentario-dialog::part(body) {
      color: #374151;
      font-family: var(--eta-font-sans);
      padding: 12px 24px 20px;
    }
    .comentario-dialog--lista::part(body) {
      padding: 0;
      overflow: hidden;
    }
    .comentario-dialog::part(footer) {
      border-top: 1px solid var(--sl-color-neutral-200);
      padding: 16px 24px 20px;
    }
    .comentario-dialog--lista .comentarios {
      max-height: min(68vh, 680px);
      overflow-y: auto;
      padding: 12px;
    }
    .comentario-dialog__titulo-lista {
      align-items: center;
      display: inline-flex;
      gap: 8px;
    }
    .comentario-dialog__titulo-lista sl-icon {
      color: #111827;
      font-size: 1rem;
      transform: translateY(1px);
    }
    .comentario-modal__campo,
    .comentario-modal__grupo {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .comentario-modal__grupo {
      margin-bottom: 16px;
    }
    .comentario-modal__label {
      color: #374151;
      font-size: 0.87rem;
      font-weight: 500;
      line-height: 1.3;
    }
    .comentario-modal__trecho {
      border-left: 3px solid #f59e0b;
      border-radius: 7px;
      background: #f3f2ed;
      color: #374151;
      font-family: var(--eta-font-serif);
      font-size: 0.88rem;
      font-style: italic;
      line-height: 1.45;
      overflow: hidden;
      padding: 10px 12px;
      white-space: nowrap;
    }
    .comentario-modal__trecho-conteudo {
      display: inline-flex;
      max-width: 100%;
      min-width: 0;
      vertical-align: bottom;
    }
    .comentario-modal__trecho-conteudo::before,
    .comentario-modal__trecho-conteudo::after {
      content: '"';
      flex: none;
    }
    .comentario-modal__trecho-texto {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      padding: 0 2px;
      text-overflow: ellipsis;
      white-space: pre;
    }
    .comentario-modal__textarea {
      min-height: 100px;
      resize: vertical;
      border: 1px solid var(--sl-color-neutral-300);
      border-radius: 4px;
      color: #374151;
      font: inherit;
      line-height: 1.45;
      padding: 8px;
    }
    .comentario-modal__textarea::placeholder {
      color: #8a94a3;
    }
    .comentario-modal__textarea:focus {
      outline: 2px solid var(--sl-color-primary-200);
      border-color: var(--sl-color-primary-500);
    }
    .comentario-modal__contador {
      color: #6b7280;
      font-size: 0.74rem;
      line-height: 1;
      text-align: right;
    }
    .comentario-dialog__footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .comentario-dialog__footer sl-button::part(base) {
      min-width: 94px;
    }
    .comentario-modal__botao-icone {
      display: inline-flex;
      align-items: center;
      color: currentColor;
    }
    .comentario-modal__botao-icone svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .comentario-modal__botao-icone .ql-fill {
      fill: currentColor;
    }
    .comentario-confirmacao {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .comentario-confirmacao__icone {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fef2f2;
      color: #dc2626;
      font-size: 1.05rem;
    }
    .comentario-confirmacao__conteudo {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    .comentario-confirmacao__titulo {
      color: #111827;
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.35;
    }
    .comentario-confirmacao__texto {
      color: #4b5563;
      font-size: 0.91rem;
      line-height: 1.45;
      margin: 0;
    }
  </style>
`;
