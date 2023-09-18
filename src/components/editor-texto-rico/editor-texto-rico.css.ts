import { html } from 'lit';

export const editorTextoRicoCss = html`
  <style>
    .ql-snow.ql-toolbar .ql-linespacing {
      background: url('data:image/svg+xml;utf8, <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path class="ql-fill" d="M3.1 13.1Q2.9 13.1 2.75 13.25 2.6 13.4 2.6 13.55 2.6 13.75 2.75 13.9 2.9 14.05 3.1 14.05L12.9 14.05Q13.1 14.05 13.25 13.9 13.4 13.75 13.4 13.55 13.4 13.4 13.25 13.25 13.1 13.1 12.9 13.1L3.1 13.1M13.25 2.2Q13.1 2.05 12.9 2.05L3.1 2.05Q2.9 2.05 2.75 2.2 2.6 2.3 2.6 2.5 2.6 2.7 2.75 2.85 2.9 2.95 3.1 2.95L12.9 2.95Q13.1 2.95 13.25 2.85 13.4 2.7 13.4 2.5 13.4 2.3 13.25 2.2M10.3 5.9Q10.3 5.7 10.2 5.55L8.35 3.7Q8.2 3.55 8 3.55 7.8 3.55 7.7 3.7L5.85 5.55Q5.7 5.7 5.7 5.9 5.7 6.05 5.85 6.2 6 6.35 6.15 6.35 6.35 6.35 6.5 6.2L7.55 5.15 7.55 10.9 6.5 9.85Q6.35 9.75 6.15 9.75 6 9.75 5.85 9.85 5.7 10 5.7 10.2 5.7 10.4 5.85 10.5L7.7 12.35Q7.8 12.5 8 12.5 8.2 12.5 8.35 12.35L10.2 10.5Q10.3 10.4 10.3 10.2 10.3 10 10.2 9.85 10.05 9.75 9.85 9.75 9.65 9.75 9.55 9.85L8.5 10.9 8.5 5.15 9.55 6.2Q9.65 6.35 9.85 6.35 10.05 6.35 10.2 6.2 10.3 6.05 10.3 5.9Z"></path></svg>')
          no-repeat center,
        white;
      background-size: 16px;
    }
    .ql-snow.ql-toolbar .ql-text-indent {
      background: url('data:image/svg+xml;utf8, <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path class="ql-fill" d="M 1.65,2.3 0.9,3.05 2.65,4.95 0.9,6.9 1.65,7.65 4.15,4.95 1.65,2.3 M 2.5,12.45 v 1.1 h 11.25 v -1.1 H 2.5 m 11.25,-2.1 V 9.25 H 2.5 v 1.1 h 11.25 m 0,-4.3 H 6.25 V 7.1 h 7.5 V 6.05 m 0,-3.25 h -7.5 v 1.1 h 7.5 z"></path></svg>')
          no-repeat center,
        white;
      background-size: 16px;
    }
    .editor-texto-rico {
      height: 375px;
      font-size: 18px !important;
    }
    .editor-texto-rico p,
    .editor-texto-rico ol,
    .editor-texto-rico ul {
      margin-bottom: 0.7rem;
    }
    .editor-texto-rico p:not(.ql-align-rigth, .ql-align-center) {
      text-indent: 3rem;
    }
    .ql-toolbar.ql-snow .ql-formats {
      margin-right: 8px;
    }
    .editor-texto-rico .estilo-ementa {
      text-indent: 0 !important;
      text-align: justify;
      margin-left: 40%;
    }
    .editor-texto-rico .estilo-norma-alterada {
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
