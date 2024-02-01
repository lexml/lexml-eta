import { quillSnowStyles } from '../../assets/css/quill.snow.css';
import { EstiloTextoClass } from './estilos-texto';
import { MarginBottomClass } from './margin-bottom';
import { NOTA_RODAPE_INPUT_EVENT } from './notaRodape';
import { NoIndentClass } from './text-indent';
import { getRange } from 'shadow-selection-polyfill';

const DefaultKeyboardModule = Quill.import('modules/keyboard');
const DefaultClipboardModule = Quill.import('modules/clipboard');

export class NotaRodapeModal {
  private modalElement: HTMLElement;
  private overlayElement: HTMLElement;
  private shadowRoot: ShadowRoot;
  private keydownListener: (event: KeyboardEvent) => void;

  quill: any;
  idNotaRodape?: string;
  textoInicialNotaRodape: string;
  domNodeNotaRodape: HTMLElement;
  tituloModal?: string;

  constructor(options: { domNodeNotaRodape: HTMLElement; idNotaRodape?: string; textoInicialNotaRodape?: string; tituloModal?: string }) {
    this.idNotaRodape = options.idNotaRodape;
    this.textoInicialNotaRodape = options.textoInicialNotaRodape ?? '';
    this.domNodeNotaRodape = options.domNodeNotaRodape;
    this.tituloModal = options.tituloModal;

    this.modalElement = document.createElement('div');
    this.modalElement.classList.add('modal');
    this.shadowRoot = this.modalElement.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      ${quillSnowStyles.strings.join('')}
      <style>

        :host {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 400px;
          max-width: 640px;
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 1010;
          display: flex;
          flex-direction: column;
          gap: 20px;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.95);
          transition: opacity 0.3s, transform 0.3s;
        }

        .modal-body .ql-editor {
          min-height: 400px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 20px;
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .modal-textarea {
          width: 100%;
          height: 100px;
          margin-bottom: 15px;
          font-family: inherit;
          font-size: inherit;
          padding: 10px;
          box-sizing: border-box;
        }

        .modal-close-button {
          cursor: pointer;
          background-color: #eee;
          padding: 5px 10px;
          border-radius: 5px;
          transition: background-color 0.3s;
          border: none;
        }

        .header-close-button {
          background-color: transparent;
          font-size: 30px;
        }

        .modal-save-button {
          cursor: pointer;
          background-color: #0284c7;
          color: white;
          padding: 9px 14px;
          border-radius: 5px;
          border: none;
        }

        .modal-save-button:hover {
          background-color: #0ea5e9;
        }

        .modal-close-button: hover {
          background-color: #ddd;
        }

        @media (max-width: 600px) {
          :host {
            width: 80%;
            min-width: 0;
          }
        }
        .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
          content: 'Salvar';
        }
        .ql-snow .ql-tooltip a.ql-action::after {
          display: inline;
          content: 'Editar';
        }

        .ql-snow .ql-tooltip a.ql-remove::before {
          display: inline;
          content: 'Remover';
        }

        .ql-snow .ql-tooltip[data-mode='link']::before  {
          content: 'Insira o link:';
        }

        .ql-snow .ql-tooltip::before {
          content: 'Visite a URL:';
        }
      </style>
      <div class="modal-header">
        <h1 id="modalTitle" class="modal-title">Editar nota de rodapé</h1>
        <button class="modal-close-button header-close-button" aria-label="Fechar" title="Fechar">&times;</button>
      </div>
      <div class="modal-body">
        <div id="editor-nota-rodape-container"></div>
      </div>
      <div class="modal-footer">
        <button class="modal-save-button" aria-label="Salvar">Salvar</button>
        <button class="modal-close-button" aria-label="Fechar">Fechar</button>
      </div>
    `;

    this.overlayElement = document.createElement('div');
    this.overlayElement.classList.add('overlay');
    this.overlayElement.style.opacity = '0';
    this.overlayElement.style.transition = 'opacity 0.3s';
    this.overlayElement.style.position = 'fixed';
    this.overlayElement.style.top = '0';
    this.overlayElement.style.left = '0';
    this.overlayElement.style.width = '100%';
    this.overlayElement.style.height = '100%';
    this.overlayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    this.overlayElement.style.zIndex = '1000';

    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.modalElement);

    this.keydownListener = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        this.close();
      }
    };

    document.addEventListener('keydown', this.keydownListener);

    Array.from(this.shadowRoot.querySelectorAll('.modal-close-button')).forEach(element => element.addEventListener('click', () => this.close()));

    this.shadowRoot.querySelector('.modal-save-button')?.addEventListener('click', this.save.bind(this));

    const quillContainer = this.shadowRoot.querySelector('#editor-nota-rodape-container') as HTMLElement;
    Quill.register('modules/keyboard', DefaultKeyboardModule, true);
    Quill.register('modules/clipboard', DefaultClipboardModule, true);
    Quill.register('formats/estilo-texto', EstiloTextoClass, true);
    Quill.register('formats/text-indent', NoIndentClass, true);
    Quill.register('formats/margin-bottom', MarginBottomClass, true);

    this.quill = new Quill(quillContainer, {
      formats: ['bold', 'italic', 'underline', 'link'],
      modules: {
        toolbar: {
          container: [['bold', 'italic', 'underline'], ['link']],
        },
      },
      placeholder: 'Digite a nota de rodapé aqui...',
      theme: 'snow',
    });

    const normalizeNative = nativeRange => {
      // document.getSelection model has properties startContainer and endContainer
      // shadow.getSelection model has baseNode and focusNode
      // Unify formats to always look like document.getSelection

      if (nativeRange) {
        const range = nativeRange;

        if (range.baseNode) {
          range.startContainer = nativeRange.baseNode;
          range.endContainer = nativeRange.focusNode;
          range.startOffset = nativeRange.baseOffset;
          range.endOffset = nativeRange.focusOffset;

          if (range.endOffset < range.startOffset) {
            range.startContainer = nativeRange.focusNode;
            range.endContainer = nativeRange.baseNode;
            range.startOffset = nativeRange.focusOffset;
            range.endOffset = nativeRange.baseOffset;
          }
        }

        if (range.startContainer) {
          return {
            start: { node: range.startContainer, offset: range.startOffset },
            end: { node: range.endContainer, offset: range.endOffset },
            native: range,
          };
        }
      }
      // console.log('asd', nativeRange);
      return null;
    };

    // Hack Quill and replace document.getSelection with shadow.getSelection
    this.quill.selection.getNativeRange = () => {
      const dom = this.quill.root.getRootNode();
      // const selection = dom.getSelection instanceof Function ? dom.getSelection() : document.getSelection();
      const selection = getRange(dom);
      const range = normalizeNative(selection);

      return range;
    };

    // Subscribe to selection change separately,
    // because emitter in Quill doesn't catch this event in Shadow DOM

    document.addEventListener('selectionchange', () => {
      // Update selection and some other properties
      this.quill.selection.update();
    });
  }

  ajustaHtml = (html = ''): string => {
    return html
      .replace(/ql-indent/g, 'indent')
      .replace(/ql-align-justify/g, 'align-justify')
      .replace(/ql-align-center/g, 'align-center')
      .replace(/ql-align-right/g, 'align-right');
  };

  open(): void {
    this.overlayElement.style.display = 'block';
    setTimeout(() => {
      this.overlayElement.style.opacity = '1';
      this.modalElement.style.opacity = '1';
      this.modalElement.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    this.quill.root.innerHTML = this.textoInicialNotaRodape ?? '';
    this.quill.root.focus();

    const modalTitle = this.shadowRoot.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.innerHTML = this.tituloModal ?? modalTitle.innerHTML;
    }
  }

  close(fromSave = false): void {
    if (fromSave || this.shouldClose()) {
      this.modalElement.style.opacity = '0';
      this.overlayElement.style.opacity = '0';
      setTimeout(() => this.removeModal(), 300); // Tempo de transição
    }
  }

  private shouldClose(): boolean {
    const texto = this.quill.root.innerHTML;
    console.log(texto, this.textoInicialNotaRodape);
    if (texto !== this.textoInicialNotaRodape) {
      return confirm('Tem certeza que deseja fechar? As alterações não salvas serão perdidas.');
    }
    return true;
  }

  private removeModal(): void {
    document.removeEventListener('keydown', this.keydownListener);
    this.modalElement.remove();
    this.overlayElement.remove();
  }

  save(): void {
    const texto = this.quill.root.innerHTML;
    if (texto === this.textoInicialNotaRodape || !texto) {
      this.close(true);
      return;
    }

    this.domNodeNotaRodape.dispatchEvent(new CustomEvent(NOTA_RODAPE_INPUT_EVENT, { detail: { id: this.idNotaRodape, texto: this.quill.root.innerHTML } }));
    this.close(true);
  }
}
