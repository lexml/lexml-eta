import { html } from 'lit';

export const editorTextoRicoCss = html`
  <style>
    .lexml-eta-editor-texto-rico {
      height: 375px;
      font-size: 18px !important;
    }
    .lexml-eta-editor-texto-rico img {
      display: block;
      margin: auto;
    }
    .lexml-eta-editor-texto-rico p,
    .lexml-eta-editor-texto-rico ol,
    .lexml-eta-editor-texto-rico ul {
      margin-bottom: 0.7rem;
    }
    .lexml-eta-editor-texto-rico p:not(.ql-align-rigth, .ql-align-center) {
      text-indent: 3rem;
    }
    .ql-toolbar.ql-snow .ql-formats {
      margin-right: 8px;
    }
    .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip {
      font-family: var(--eta-font-sans);
      font-size: 0.9rem;
    }
    .ql-tooltip .ql-action,
    .ql-tooltip .ql-remove {
      background-color: var(--sl-color-gray-100);
      border: 1px solid var(--sl-color-gray-500);
      border-radius: 3px;
      color: var(--sl-color-gray-900);
      width: fit-content !important;
      padding: 0 15px;
      margin: 0 0 0 10px;
    }
    .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
      content: 'Salvar';
      margin: 0 !important;
      padding: 0 !important;
    }
    .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip a.ql-action::after {
      display: inline;
      content: 'Editar';
      margin: 0 !important;
      padding: 0 !important;
      border: 0;
    }
    .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip a.ql-remove::before {
      display: inline;
      content: 'Remover';
      margin: 0 !important;
      padding: 0 !important;
    }
    .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip[data-mode='link']::before {
      content: 'Insira o link:';
    }
    .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip::before {
      content: 'Visite o link:';
    }
    @media (max-width: 600px) {
      .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip {
        display: flex;
        gap: 5px;
        flex-direction: column;
      }
      .ql-tooltip .ql-action,
      .ql-tooltip .ql-remove {
        margin: 0;
      }
      .lexml-eta-editor-texto-rico.ql-snow .ql-tooltip.ql-hidden {
        display: none;
      }
    }

    .lexml-eta-editor-texto-rico .estilo-ementa {
      text-indent: 0 !important;
      text-align: justify;
      margin-left: 40%;
    }
    .lexml-eta-editor-texto-rico .estilo-norma-alterada {
      margin-left: 3rem;
    }

    #revisoes-justificativa-icon sl-icon,
    #revisoes-texto-livre-icon sl-icon,
    #aceita-revisao-justificativa {
      margin-right: 0.1rem;
    }

    .revisoes-justificativa-icon__ativo {
      color: white;
      background-color: var(--sl-color-warning-600) !important;
      border-color: white !important;
    }
    .revisoes-texto-livre-icon__ativo {
      color: white;
      background-color: var(--sl-color-warning-600) !important;
      border-color: white !important;
    }
    .lista-revisoes-justificativa {
      padding-left: 1rem;
      padding-right: 0.5rem;
    }
    #chk-em-revisao-justificativa {
      border: 1px solid #ccc !important;
      padding: 5px 10px !important;
      border-radius: 20px !important;
      margin-left: auto;
      margin-right: 5px;
      font-weight: bold;
      background-color: #eee;
    }
    #chk-em-revisao-justificativa[checked] {
      background-color: var(--sl-color-blue-100);
    }

    #chk-em-revisao-texto-livre {
      border: 1px solid #ccc !important;
      padding: 5px 10px !important;
      border-radius: 20px !important;
      margin-left: auto;
      margin-right: 5px;
      font-weight: bold;
      background-color: #eee;
    }
    #chk-em-revisao-texto-livre[checked] {
      background-color: var(--sl-color-blue-100);
    }

    #toolbar {
      padding: 1.5px 0 1.5px 8px;
    }

    #badge-marca-alteracao-justificativa::part(base) {
      min-width: 1.4rem;
    }

    #badge-marca-alteracao-texto-livre::part(base) {
      min-width: 1.4rem;
    }
    revisao-container {
      margin-left: auto;
    }

    .ql-toolbar .panel-revisao {
      display: flex;
      flex-grow: 1;
    }

    .ql-picker.ql-estilo .ql-picker-label {
      width: 160px;
    }

    .ql-picker.ql-estilo .ql-picker-label::before,
    .ql-picker.ql-estilo .ql-picker-item::before {
      content: 'Texto normal';
    }

    .ql-picker.ql-estilo .ql-picker-label[data-value='ementa']:before,
    .ql-picker.ql-estilo .ql-picker-item[data-value='ementa']:before {
      content: 'Ementa';
    }

    .ql-picker.ql-estilo .ql-picker-label[data-value='norma-alterada']:before,
    .ql-picker.ql-estilo .ql-picker-item[data-value='norma-alterada']:before {
      content: 'Norma alterada';
    }

    .ql-estilo span.ql-picker-label {
      border-color: #ccc !important;
    }

    .ql-picker-item[data-value='insert']::after {
      content: 'Inserir tabela';
    }

    .ql-picker-item[data-value='append-col']::after {
      content: 'Inserir coluna';
    }

    .ql-picker-item[data-value='append-col-before']::after {
      content: 'Inserir coluna à esquerda';
    }

    .ql-picker-item[data-value='append-col-after']::after {
      content: 'Inserir coluna à direita';
    }

    .ql-picker-item[data-value='remove-col']::after {
      content: 'Remover coluna';
    }

    .ql-picker-item[data-value='change-width-col-modal']::after {
      content: 'Alterar a largura da coluna';
    }

    .ql-picker-item[data-value='change-width-table-modal']::after {
      content: 'Alterar a largura da tabela';
    }

    .ql-picker-item[data-value='append-row']::after {
      content: 'Inserir linha';
    }

    .ql-picker-item[data-value='append-row-above']::after {
      content: 'Inserir linha acima';
    }

    .ql-picker-item[data-value='append-row-below']::after {
      content: 'Inserir linha abaixo';
    }

    .ql-picker-item[data-value='remove-row']::after {
      content: 'Remover linha';
    }

    .ql-picker-item[data-value='split-cell']::after {
      content: 'Dividir célula';
    }

    .ql-picker-item[data-value='merge-selection']::after {
      content: 'Mesclar células';
    }

    .ql-picker-item[data-value='remove-cell']::after {
      content: 'Remover célula';
    }

    .ql-picker-item[data-value='remove-selection']::after {
      content: 'Remover seleção';
    }

    .ql-picker-item[data-value='undo']::after {
      content: 'Desfazer';
    }

    .ql-picker-item[data-value='redo']::after {
      content: 'Refazer';
    }

    .ql-picker-item[data-value='remove-table']:before {
      content: 'Remover tabela';
    }

    .ql-editor td > p {
      text-indent: 0 !important;
      margin-bottom: 0 !important;
    }

    .table-selected {
      border: 1px solid #87ceeb; /* Define a borda sólida em tom azul claro */
      box-shadow: 0 0 10px rgba(135, 206, 235, 0.5); /* Adiciona sombra com tom azul claro */
    }

    .ql-snow .ql-editor img {
      max-width: 100%;
    }

    .lexml-eta-editor-texto-rico p.ql-text-indent-0px {
      text-indent: 0;
    }

    .lexml-eta-editor-texto-rico p.ql-margin-bottom-0px {
      margin-bottom: 0;
    }

    /* Sem cor de fundo: o fundo fica reservado ao destaque de comentário. */
    .lexml-eta-editor-texto-rico .ql-editor ins {
      color: #188038;
      text-decoration: none;
      background-color: transparent;
    }

    /* Traço por imagem de fundo: text-decoration não é recolorido nos filhos (negrito, nota de rodapé). */
    .lexml-eta-editor-texto-rico .ql-editor del {
      text-decoration: none;
      background-color: transparent;
      background-image: linear-gradient(#d93025, #d93025);
      background-position: 0 55%;
      background-repeat: repeat-x;
      background-size: 100% 2px;
    }

    .lexml-eta-editor-texto-rico .ql-editor ins.revisao-selecionada {
      --cor-moldura-revisao: #188038;
    }

    .lexml-eta-editor-texto-rico .ql-editor del.revisao-selecionada {
      --cor-moldura-revisao: #d93025;
    }

    .lexml-eta-editor-texto-rico .ql-editor ins.revisao-selecionada,
    .lexml-eta-editor-texto-rico .ql-editor del.revisao-selecionada {
      border-top: 2px solid var(--cor-moldura-revisao);
      border-bottom: 2px solid var(--cor-moldura-revisao);
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }

    /* Laterais curtas por pseudo-elemento: border-left/right deslocaria o texto. */
    .lexml-eta-editor-texto-rico .ql-editor ins.revisao-selecionada::before,
    .lexml-eta-editor-texto-rico .ql-editor del.revisao-selecionada::before {
      content: '';
      display: inline-block;
      width: 2px;
      height: 0.5em;
      background-color: var(--cor-moldura-revisao);
      vertical-align: top;
      margin-left: -2px;
    }

    .lexml-eta-editor-texto-rico .ql-editor ins.revisao-selecionada::after,
    .lexml-eta-editor-texto-rico .ql-editor del.revisao-selecionada::after {
      content: '';
      display: inline-block;
      width: 2px;
      height: 0.5em;
      background-color: var(--cor-moldura-revisao);
      margin-right: -2px;
      position: relative;
      top: 0.35em;
    }

    .lexml-eta-editor-texto-rico .ql-editor ins.revisao-selecionada.revisao-fragmento-continua-anterior::before,
    .lexml-eta-editor-texto-rico .ql-editor del.revisao-selecionada.revisao-fragmento-continua-anterior::before,
    .lexml-eta-editor-texto-rico .ql-editor ins.revisao-selecionada.revisao-fragmento-continua-proximo::after,
    .lexml-eta-editor-texto-rico .ql-editor del.revisao-selecionada.revisao-fragmento-continua-proximo::after {
      content: none;
    }

    .ql-toolbar button.ql-lexml-eta-comentario:disabled,
    .ql-toolbar button.ql-lexml-eta-comentario:disabled:hover,
    .ql-toolbar button.ql-lexml-eta-comentario:disabled:focus {
      color: #9ca3af;
      cursor: default;
      opacity: 0.45;
    }

    .ql-toolbar button.ql-lexml-eta-comentario:disabled svg,
    .ql-toolbar button.ql-lexml-eta-comentario:disabled:hover svg,
    .ql-toolbar button.ql-lexml-eta-comentario:disabled:focus svg {
      color: #9ca3af;
    }

    .lexml-eta-editor-texto-rico .ql-editor comentario {
      background-color: #fff8c5;
    }

    .lexml-eta-editor-texto-rico .ql-editor comentario.comentario-selecionado {
      background-color: #fdd663;
      border-radius: 2px;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.28);
    }

    .lexml-eta-editor-texto-rico .ql-editor comentario del {
      background-color: inherit;
    }

    /* Dentro de uma exclusão, o fundo do comentário cobriria o traço do del: o traço é repetido nele. */
    .lexml-eta-editor-texto-rico .ql-editor del comentario {
      background-color: #fff8c5;
      background-image: linear-gradient(#d93025, #d93025);
      background-position: 0 55%;
      background-repeat: repeat-x;
      background-size: 100% 2px;
    }

    /* Espaço do ícone, só no último fragmento do trecho. */
    .lexml-eta-editor-texto-rico .ql-editor comentario[data-comentario-fragmento-final] {
      margin-right: 22px;
    }

    .lexml-eta-editor-texto-rico.ql-container {
      position: relative;
    }

    .lexml-eta-editor-texto-rico .comentarios-texto-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 6;
      overflow: visible;
    }

    .lexml-eta-editor-texto-rico .comentario-texto-icone {
      position: absolute;
      top: 0;
      left: 0;
      width: 16px;
      height: 16px;
      padding: 0;
      border: 0;
      background-color: transparent;
      cursor: pointer;
      opacity: 1;
      overflow: visible;
      pointer-events: auto;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .lexml-eta-editor-texto-rico .comentario-texto-icone::before {
      display: none;
    }

    .lexml-eta-editor-texto-rico .comentario-texto-icone__svg {
      width: 14px;
      height: 14px;
      display: block;
      pointer-events: none;
    }

    .lexml-eta-editor-texto-rico .comentario-texto-icone__fundo {
      fill: #fff8c5;
    }

    .lexml-eta-editor-texto-rico .comentario-texto-icone__contorno {
      fill: #111827;
    }

    .lexml-eta-editor-texto-rico .comentario-texto-icone:hover,
    .lexml-eta-editor-texto-rico .comentario-texto-icone--selecionado {
      background-color: transparent;
    }

    .lexml-eta-editor-texto-rico .comentario-texto-icone:hover .comentario-texto-icone__fundo,
    .lexml-eta-editor-texto-rico .comentario-texto-icone--selecionado .comentario-texto-icone__fundo {
      fill: #fdd663;
    }

    .lexml-eta-editor-texto-rico .ql-tooltip input:invalid {
      color: red;
    }

    .lexml-eta-editor-texto-rico .ql-tooltip div.tooltip-invalid-message {
      color: red;
      display: none;
      font-family: var(--eta-font-sans);
      font-size: 0.9rem;
    }

    .lexml-eta-editor-texto-rico .ql-tooltip[data-mode='link'] div.tooltip-invalid-message::after {
      content: 'A URL deve iniciar com http:// ou https://';
    }

    .lexml-eta-editor-texto-rico .ql-tooltip[data-mode='link'] input:invalid ~ div.tooltip-invalid-message {
      display: block;
    }

    @-moz-document url-prefix() {
      #lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor {
        white-space: pre-wrap;
      }
    }

    @media (max-width: 768px) {
      .mobile-buttons {
        display: inline-block !important;
      }
      #chk-em-revisao-justificativa span {
        display: none;
      }
      .ql-snow .ql-editor img {
        max-width: 100%;
      }
    }
  </style>
`;
