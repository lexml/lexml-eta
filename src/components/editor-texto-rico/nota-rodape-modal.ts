import { NOTA_RODAPE_INPUT_EVENT } from './notaRodape';

export class NotaRodapeModal {
  private modalElement: HTMLElement;
  private overlayElement: HTMLElement;
  private shadowRoot: ShadowRoot;
  private keydownListener: (event: KeyboardEvent) => void;

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
      </style>
      <div class="modal-header">
        <h1 id="modalTitle" class="modal-title">Editar nota de rodapé</h1>
        <button class="modal-close-button header-close-button" aria-label="Fechar" title="Fechar">&times;</button>
      </div>
      <div class="modal-body">
        <textarea class="modal-textarea" placeholder="Digite a nota de rodapé aqui..."></textarea>
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
  }

  open(): void {
    this.overlayElement.style.display = 'block';
    setTimeout(() => {
      this.overlayElement.style.opacity = '1';
      this.modalElement.style.opacity = '1';
      this.modalElement.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    const firstFocusableElement = this.getTextArea();
    if (firstFocusableElement) {
      firstFocusableElement.focus();
      firstFocusableElement.value = this.textoInicialNotaRodape ?? '';
    }
    const modalTitle = this.shadowRoot.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.innerHTML = this.tituloModal ?? modalTitle.innerHTML;
    }
  }

  getTextArea(): HTMLTextAreaElement {
    return this.shadowRoot.querySelector('.modal-textarea') as HTMLTextAreaElement;
  }

  close(fromSave = false): void {
    if (fromSave || this.shouldClose()) {
      this.modalElement.style.opacity = '0';
      this.overlayElement.style.opacity = '0';
      setTimeout(() => this.removeModal(), 300); // Tempo de transição
    }
  }

  private shouldClose(): boolean {
    const textarea = this.getTextArea();
    return !(textarea.value !== this.textoInicialNotaRodape && !confirm('Tem certeza que deseja fechar? As alterações não salvas serão perdidas.'));
  }

  private removeModal(): void {
    document.removeEventListener('keydown', this.keydownListener);
    this.modalElement.remove();
    this.overlayElement.remove();
  }

  save(): void {
    const textarea = this.getTextArea();
    if (textarea.value === this.textoInicialNotaRodape || !textarea.value) {
      this.close(true);
      return;
    }

    this.domNodeNotaRodape.dispatchEvent(new CustomEvent(NOTA_RODAPE_INPUT_EVENT, { detail: { id: this.idNotaRodape, texto: textarea.value } }));
    this.close(true);
  }
}
