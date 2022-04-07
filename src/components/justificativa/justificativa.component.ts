import { customElement, LitElement, property, PropertyValues } from 'lit-element';
import { html, TemplateResult } from 'lit-html';

@customElement('lexml-emenda-justificativa')
export class JustificativaEmendaComponent extends LitElement {
  @property({ type: String }) texto = '';

  quill?: Quill;
  container;

  toolbarOptions = [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    ['blockquote'],
    ['undo', 'redo'],
    [{ align: [] }],
    ['clean'],
  ];

  icons = Quill.import('ui/icons');

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  createRenderRoot(): LitElement {
    return this;
  }

  render(): TemplateResult {
    return html`
      <link rel="stylesheet" href="http://cdn.quilljs.com/1.3.6/quill.snow.css" />
      <style>
        #editor-justificativa {
          height: 375px;
        }
        #editor-justificativa p:not(.ql-align-rigth, .ql-align-center) {
          text-indent: 3em;
        }
      </style>
      <div id="editor-justificativa"></div>
    `;
  }

  constructor() {
    super();
    this.icons['undo'] = `<svg viewbox="0 0 18 18">
    <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
    <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
    </svg>`;
    this.icons['redo'] = `<svg viewbox="0 0 18 18">
    <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
    <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
    </svg>`;
  }

  firstUpdated(): void {
    this.init();
  }

  init = (): void => {
    this.container = document.querySelector('#editor-justificativa');
    if (this.container) {
      this.quill = new Quill(this.container as HTMLElement, {
        modules: {
          toolbar: {
            container: this.toolbarOptions,
            handlers: {
              undo: this.undo,
              redo: this.redo,
            },
          },
          history: {
            delay: 0,
            maxStack: 500,
            userOnly: true,
          },
          clipboard: {},
        },
        placeholder: '',
        theme: 'snow',
      });

      this.setContent(this.texto);

      this.quill?.on('text-change', this.updateTexto);
    }
  };

  setContent = (texto: string): void => {
    if (!this.quill) {
      return;
    }
    this.quill.root.innerHTML = texto
      .replace(/indent/g, 'ql-indent')
      .replace(/align-justify/g, 'ql-align-justify')
      .replace(/align-center/g, 'ql-align-center')
      .replace(/align-right/g, 'ql-align-right');
  };

  updateTexto = (): void => {
    this.texto = this.quill?.root.innerHTML
      ? this.quill?.root.innerHTML
          .replace(/ql-indent/g, 'indent')
          .replace(/ql-align-justify/g, 'align-justify')
          .replace(/ql-align-center/g, 'align-center')
          .replace(/ql-align-right/g, 'align-right')
      : '';
  };

  undo = (): any => {
    return this.quill?.history.undo();
  };

  redo = (): any => {
    return this.quill?.history.redo();
  };
}
