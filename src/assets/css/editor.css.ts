import { html } from 'lit';
// Foi utilizado TemplateResult porque o editor.component.ts não usa ShadowDom
export const editorStyles = html`
  <style>
    :root {
      --elemento-padding-factor: 20;
    }

    #lx-eta-box {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 30px calc(100% - 30px);
      height: 100%;
    }

    #lx-eta-box .ql-toolbar.ql-snow {
      border: 1px solid #ccc;
      box-sizing: border-box;
      padding: 3px 10px 3px 10px;
      position: sticky;
      top: 50px;
      background-color: #ffffff;
      z-index: 99;
    }

    #lx-eta-box .ql-snow.ql-toolbar button,
    .ql-snow .ql-toolbar button {
      height: 20px !important;
      padding: 0px !important;
      width: 24px !important;
      margin: 0px !important;
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
      font-family: sans-serif, 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
      font-size: 1rem;
      line-height: 1.42;
      color: #646260;
      text-transform: none !important;
      padding: 5px;
    }

    #lx-eta-editor .ql-editor *:focus {
      outline: 0;
      border: 0px solid #f1f1f1;
      -webkit-box-shadow: 0px;
      box-shadow: none;
    }

    #lx-eta-editor .ql-editor label:before {
      content: attr(data-rotulo) ' ';
    }

    #toast-msg {
      padding: 1em;
      font-size: 1.1em;
    }

    .lx-eta-dropbtn {
      background-color: #ffffff;
      color: #444444;
      width: 26px;
      font-weight: bold;
      vertical-align: middle;
      border: none;
      cursor: pointer;
      text-align: center;
    }

    .lx-eta-dropdown {
      position: relative;
      display: inline-block;
    }

    .lx-eta-dropdown-content {
      display: none;
      position: absolute;
      background-color: #f9f9f9;
      min-width: 160px;
      box-shadow: 0px 4px 4px 4px rgba(0, 0, 0, 0.25);
      z-index: 1;
    }

    .lx-eta-dropdown-content div {
      color: black;
      padding: 5px 16px;
      text-decoration: none;
      display: block;
      white-space: nowrap;
      font-weight: normal !important;
      text-align: left;
      cursor: pointer;
    }

    .lx-eta-dropdown-content div:hover {
      background-color: #e5e5e5;
    }

    .lx-eta-dropdown:hover .lx-eta-dropdown-content {
      display: block;
    }

    .lx-eta-dropdown:hover .lx-eta-dropbtn {
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
      margin: 0px 2px 0px 5px !important;
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

    .texto__rotulo {
      color: black;
      font-weight: 600;
      font-size: 1rem;
    }

    .texto__rotulo--agrupador {
      display: block;
    }

    .texto__rotulo--padrao {
      float: left;
      margin-right: 10px;
    }

    .Omissis {
      word-break: break-all;
      word-break: break-word;
      -webkit-hyphens: auto;
      -moz-hyphens: auto;
      -ms-hyphens: auto;
      hyphens: auto;
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
    }

    .mensagem {
      font-size: 0.8em;
      font-weight: 600;
    }

    .mensagem--info {
      color: green;
    }

    .mensagem--warning {
      color: #ff5733;
    }

    .mensagem--danger {
      color: red;
    }

    lexml-eta-help {
      float: right;
    }

    #lx-eta-buffer {
      display: none;
      height: 0px;
    }
  </style>
`;
