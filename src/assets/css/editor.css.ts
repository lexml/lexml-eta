import { html } from 'lit';

// Foi utilizado TemplateResult porque o editor.component.ts não usa ShadowDom
export const editorStyles = html`
  <style>
    :root {
      --elemento-padding-factor: 20;
      --eta-font-serif: 'Times New Roman', Times, serif;
    }

    #lx-eta-box {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 42px calc(100% - 30px);
      height: 100%;
    }

    /* #lx-eta-box .ql-toolbar.ql-snow {
      border: 1px solid #ccc;
      box-sizing: border-box;
      padding: 3px 10px 3px 10px;
    } */

    .ql-toolbar.ql-snow {
      border: 1px solid #ccc;
      box-sizing: border-box;
      font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
      /* padding: 8px; */
    }
    #lx-eta-box .ql-snow.ql-toolbar button,
    .ql-snow .ql-toolbar button {
      /* height: 20px !important;
      padding: 0px !important;
      width: 24px !important;
      margin: 0px !important; */
      background: none;
      border: none;
      cursor: pointer;
      display: inline-block;
      float: left;
      height: 24px;
      padding: 3px 5px;
      width: 28px;
    }

    #lx-eta-barra-ferramenta button:focus {
      outline: 0;
      border: 0px solid #f1f1f1;
      -webkit-box-shadow: 0px;
      box-shadow: none;
    }

    #lx-eta-barra-ferramenta .lx-eta-ql-button {
      font-size: 1.1em;
      color: #444444;
    }

    .lx-eta-rebate-180-graus {
      -moz-transform: scaleX(-1);
      -o-transform: scaleX(-1);
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
    }

    #lx-eta-editor {
      overflow-y: auto;
    }

    #lx-eta-editor .ql-editor {
      /* font-family: sans-serif, 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji'; */
      font-family: var(--eta-font-serif);
      font-size: 1rem;
      line-height: 1.42;
      color: #646260;
      text-transform: none !important;
      padding: 0 10px 0 8px;
      min-height: 250px;
      overflow-x: hidden;
    }

    #lx-eta-editor .ql-editor *:focus {
      outline: 0;
      border: 0px solid #f1f1f1;
      -webkit-box-shadow: 0px;
      box-shadow: none;
    }

    #lx-eta-editor .ql-editor label:before {
      /* content: attr(data-rotulo) ' '; */
    }

    #toast-msg {
      padding: 1em;
      font-size: 1.1em;
    }

    .lx-eta-dropbtn {
      background-color: transparent;
      color: #444444;
      width: 26px;
      font-weight: bold;
      vertical-align: middle;
      border: none;
      cursor: pointer;
      text-align: center;
    }

    .container__menu sl-button::part(base) {
      position: absolute;
      margin: -13px 0 0 -15px;
      background-color: #e1e1e1;
      line-height: 20px;
      height: 23px;
      color: black;
      font-weight: bold;
      font-size: 15px;
    }

    .container__menu sl-menu-item::part(suffix) {
      font-size: 14px;
      padding-left: 20px;
    }

    .container__menu sl-menu-item:hover .lx-eta-dropbtn {
      background-color: #e1e1e1;
    }

    .lx-eta-btn-disp-atual {
      margin-left: 10px !important;
      text-decoration: underline;
    }

    .lx-eta-btn-desfazer {
      margin-left: 10px !important;
    }

    .icon-undo-redo {
      width: 19px;
      height: 16px !important;
    }

    .icon-undo-redo:hover {
      fill: #0066cc;
    }

    .icon-negrito {
      fill: #444;
    }

    .icon-negrito:hover {
      fill: #0066cc;
    }

    .icon-sublinhado {
      fill: #444;
    }

    .icon-sublinhado:hover {
      fill: #0066cc;
    }

    .lx-eta-dropdown-content-right {
      right: 0;
    }

    .ql-snow .ql-hidden {
      display: none;
    }

    .ql-snow .ql-tooltip::before {
      content: 'Acesse a norma:';
    }

    .ql-snow .ql-tooltip a.ql-action::after {
      display: none;
    }

    .ql-snow .ql-tooltip a.ql-remove::before {
      display: none;
    }

    .ql-snow .ql-tooltip a.ql-preview {
      max-width: 300px;
    }

    .btn--artigoOndeCouber {
    }

    .container__linha {
      display: flex;
      width: 100%;
    }

    .container__linha--reverse {
      flex-direction: row-reverse;
    }

    .container__texto {
      flex: 1;
    }

    .container_elemento--omissis .container__texto {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }

    .container_elemento--omissis .container__texto--mensagem {
      flex: 1;
      display: inline-block;
    }

    .container_elemento--omissis .texto__rotulo {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      flex: none;
      order: 0;
      flex-grow: 0;
    }

    .container_elemento--omissis .texto__dispositivo {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      padding: 0px;
      flex-grow: 1;
    }

    .container_elemento--omissis .texto__omissis {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
      width: 0;
    }

    .container__menu {
      width: 30px;
      vertical-align: top;
      text-align: center;
    }

    .container__elemento--padrao {
      width: 100%;
      min-height: 26px;
      border: 3px solid #ffffff;
      line-height: 1.42;
      margin: 0;
      padding: 0 5px 0 0;
    }

    .container__elemento--articulacao {
      width: 100%;
      min-height: 1px;
      line-height: 0.42;
      margin: 1px;
    }

    .agrupador {
      text-align: center;
    }

    label[pode-informar-numeracao='true'] {
      cursor: pointer;
      /* border-bottom: 1px dashed; */
      -webkit-box-shadow: 0px -1px 0px green inset;
      -moz-box-shadow: 0px -1px 0px green inset;
      box-shadow: 0px -1px 0px green inset;
    }

    [existenanormaalterada] label:after {
      font-family: var(--sl-font-sans);
      position: relative;
      left: 5px;
      top: -1px;
      margin-right: 5px;
      border: 1px solid green;
      padding: 0 4px;
      font-weight: normal;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      font-size: 12px;
    }

    [existenanormaalterada='true'] label:after {
      content: 'Existente';
    }

    [existenanormaalterada='false'] label:after {
      content: 'Novo';
    }

    .texto__rotulo {
      color: black;
      font-weight: 600;
      font-size: 1rem;
    }

    .texto__rotulo--agrupador {
      display: block;
    }

    .texto__rotulo--padrao {
      margin-right: 10px;
    }

    .texto__rotulo--omissis {
      font-family: var(--sl-font-sans);
      box-shadow: none;
    }

    .texto__rotulo--omissis:before {
      position: relative;
      left: 0;
      top: -1px;
      margin-right: 5px;
      border: 1px solid green;
      padding: 0 4px;
      font-weight: normal;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
    }
    .texto__dispositivo {
      display: inline;
    }

    .container__texto[tipo-omissis='inciso-caput'] .texto__rotulo--omissis:before {
      content: ' Incisos omitidos ';
    }

    .container__texto[tipo-omissis='inciso-paragrafo'] .texto__rotulo--omissis:before {
      content: ' Incisos omitidos ';
    }

    .container__texto[tipo-omissis='paragrafo'] .texto__rotulo--omissis:before {
      content: ' Parágrafos omitidos ';
    }

    .container__texto[tipo-omissis='alinea'] .texto__rotulo--omissis:before {
      content: ' Alíneas omitidas ';
    }

    .container__texto[tipo-omissis='item'] .texto__rotulo--omissis:before {
      content: ' Itens omitidos ';
    }

    .Omissis {
      word-break: break-all;
      word-break: break-word;
      -webkit-hyphens: auto;
      -moz-hyphens: auto;
      -ms-hyphens: auto;
      hyphens: auto;
    }
    .dispositivo--adicionado br {
      content: '';
    }

    .dispositivo--adicionado {
      color: green;
    }

    .dispositivo--modificado {
      color: blue;
    }

    .dispositivo--suprimido {
      color: red;
    }

    .texto--suprimido {
      text-decoration: line-through;
    }

    .container__elemento--ativo {
      border: 3px solid #24d421;
      border-radius: 4px;
    }

    .mensagem {
      font-family: var(--sl-font-sans);
      font-size: 0.8em;
      font-weight: normal;
      border: 1px solid;
      padding: 4px 10px;
      margin: 2px;
      display: inline-block;
      border-radius: 2px;
    }

    .mensagem--success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }

    .mensagem--info {
      color: #0c5460;
      background-color: #d1ecf1;
      border-color: #bee5eb;
    }

    .mensagem--warning {
      color: #856404;
      background-color: #fff3cd;
      border-color: #ffeeba;
    }

    .mensagem--danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    .mensagem__fix {
      color: blue;
      text-decoration: underline;
      cursor: pointer;
    }
    lexml-eta-help {
      float: right;
    }

    #lx-eta-buffer {
      display: none;
      height: 0px;
    }

    [fecha-aspas]::after {
      content: '” (' attr(nota-alteracao) ')';
      font-weight: bold;
    }

    [abre-aspas]::before {
      content: '“';
      font-weight: bold;
    }
  </style>
`;
