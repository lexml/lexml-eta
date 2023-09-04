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
    .editor-texto-rico .estilo-emenda {
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
