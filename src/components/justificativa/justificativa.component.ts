import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { negrito, sublinhado } from '../../../assets/icons/icons';
import { Observable } from '../../util/observable';
import { atualizaRevisaoJustificativa } from '../../redux/elemento/reducer/atualizaRevisaoJustificativa';
import { rootStore } from '../../redux/store';
@customElement('lexml-emenda-justificativa')
export class JustificativaEmendaComponent extends LitElement {
  @property({ type: String }) texto = '';

  onChange: Observable<string> = new Observable<string>();
  private timerOnChange?: any;

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

  private agendarEmissaoEventoOnChange(): void {
    clearTimeout(this.timerOnChange);
    this.timerOnChange = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('onchange', {
          bubbles: true,
          composed: true,
          detail: {
            origemEvento: 'justificativa',
          },
        })
      );
      this.onChange.notify('justificativa');
    }, 1000);
  }

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  createRenderRoot(): LitElement {
    return this;
  }

  render(): TemplateResult {
    return html`
      <style>
        #editor-justificativa {
          height: 375px;
        }
        #editor-justificativa p:not(.ql-align-rigth, .ql-align-center) {
          text-indent: 3em;
        }
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 8px;
        }
      </style>
      <div id="toolbar">
        <span class="ql-formats">
          <button type="button" class="ql-bold" title="Negrito (Ctrl+b)"></button>
          <button type="button" class="ql-italic" title="Itálico (Ctrl+i)"></button>
          <button type="button" class="ql-underline" title="Sublinhado (Ctrl+u)"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-list" value="ordered" title="Lista ordenada"></button>
          <button type="button" class="ql-list" value="bullet" title="Lista não ordenada"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-script" value="sub" title="Subscrito"></button>
          <button type="button" class="ql-script" value="super" title="Sobrescrito"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-blockquote" title="Bloco de citação"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-undo" title="Desfazer (Ctrl+z)"></button>
          <button type="button" class="ql-redo" title="Refazer (Ctrl+Shift+z)"></button>
        </span>
        <span class="ql-formats">
          <select class="ql-align" title="Alinhar">
            <option value=""></option>
            <option value="center"></option>
            <option value="right"></option>
            <option value="justify"></option>
          </select>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-clean" title="Limpar formatação"></button>
        </span>
        <sl-icon-button name="person-exclamation" label="Settings"></sl-icon-button>
      </div>
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
    this.icons['bold'] = negrito;
    this.icons['underline'] = sublinhado;
  }

  firstUpdated(): void {
    this.init();
  }

  init = (): void => {
    this.container = document.querySelector('#editor-justificativa');
    if (this.container) {
      this.quill = new Quill(this.container as HTMLElement, {
        formats: ['bold', 'italic', 'underline', 'align', 'list', 'script', 'blockquote'],
        modules: {
          toolbar: {
            container: '#toolbar',
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
    const texto = this.quill?.root.innerHTML
      ? this.quill?.root.innerHTML
          .replace(/ql-indent/g, 'indent')
          .replace(/ql-align-justify/g, 'align-justify')
          .replace(/ql-align-center/g, 'align-center')
          .replace(/ql-align-right/g, 'align-right')
      : '';
    this.texto = texto === '<p><br></p>' ? '' : texto;
    this.agendarEmissaoEventoOnChange();
    atualizaRevisaoJustificativa(rootStore.getState().elementoReducer);
  };

  undo = (): any => {
    return this.quill?.history.undo();
  };

  redo = (): any => {
    return this.quill?.history.redo();
  };
}
