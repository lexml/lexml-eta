export class NotaRodapeModal {
  private modalElement: HTMLElement;
  private overlayElement: HTMLElement;

  constructor() {
    this.modalElement = document.createElement('div');
    this.modalElement.classList.add('modal');
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.setAttribute('aria-labelledby', 'modalTitle');
    this.modalElement.innerHTML = `
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

    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.modalElement);

    Array.from(this.modalElement.getElementsByClassName('modal-close-button')).forEach(element => element.addEventListener('click', () => this.close()));
  }

  // tranforma parametro content em opcional no metodo open

  open(content?: string): void {
    setTimeout(() => {
      const firstFocusableElement = this.modalElement.querySelector('.modal-textarea') as HTMLTextAreaElement;
      if (firstFocusableElement) firstFocusableElement.focus();
    }, 0);
    const modalTitle = this.modalElement.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.innerHTML = content ? content : modalTitle.innerHTML;
    }
    this.modalElement.style.display = 'flex';
    this.overlayElement.style.display = 'block';
  }

  close(): void {
    this.modalElement.style.display = 'none';
    this.overlayElement.style.display = 'none';
  }
}

const styles = `
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    display: none;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 400px;
    max-width: 640px;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1010;
    display: none;
    flex-direction: column;
    gap: 20px;
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
    .modal {
      width: 80%;
      min-width: 0;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
