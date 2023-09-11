import { html } from 'lit';

export const editorTextoRicoCss = html`
  <style>
    .editor-texto-rico {
      height: 375px;
    }
    .editor-texto-rico p:not(.ql-align-rigth, .ql-align-center) {
      text-indent: 3em;
    }
    .ql-toolbar.ql-snow .ql-formats {
      margin-right: 8px;
    }
    .editor-texto-rico .estilo-artigo-subordinados {
      text-indent: 0 !important;
      text-align: justify;
    }
    .editor-texto-rico .estilo-agrupador-artigo {
      text-indent: 0 !important;
      text-align: center;
    }
    .editor-texto-rico .estilo-ementa {
      text-indent: 0 !important;
      text-align: justify;
      margin-left: 40%;
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

    .ql-picker.ql-estilo .ql-picker-label[data-value='artigo-subordinados']:before,
    .ql-picker.ql-estilo .ql-picker-item[data-value='artigo-subordinados']:before {
      content: 'Artigo e subordinados';
    }

    .ql-picker.ql-estilo .ql-picker-label[data-value='agrupador-artigo']:before,
    .ql-picker.ql-estilo .ql-picker-item[data-value='agrupador-artigo']:before {
      content: 'Agrupador de artigo';
    }

    .ql-picker.ql-estilo .ql-picker-label[data-value='ementa']:before,
    .ql-picker.ql-estilo .ql-picker-item[data-value='ementa']:before {
      content: 'Ementa';
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
    }

    .table-selected {
      border: 1px solid #87ceeb; /* Define a borda sólida em tom azul claro */
      box-shadow: 0 0 10px rgba(135, 206, 235, 0.5); /* Adiciona sombra com tom azul claro */
    }

    @media (max-width: 768px) {
      .mobile-buttons {
        display: inline-block !important;
      }
      #chk-em-revisao-justificativa span {
        display: none;
      }
    }
  </style>
`;
