const ESTILOS_ID = 'remissao-popup-styles';

const ESTILOS_CSS = `
  #remissao-popup {
    position: fixed;
    z-index: 10000;
    background: var(--sl-color-neutral-0, #ffffff);
    border: 1px solid var(--sl-color-neutral-200, #e2e8f0);
    border-radius: var(--sl-border-radius-medium, 4px);
    box-shadow: var(--sl-shadow-medium, 0 4px 12px rgba(0, 0, 0, 0.15));
    padding: 5px 10px;
    display: none;
    flex-direction: row;
    align-items: center;
    gap: var(--sl-spacing-x-small, 8px);
    font-size: var(--sl-font-size-small, 13px);
    font-family: var(--sl-font-sans, system-ui, sans-serif);
    white-space: nowrap;
  }

  .remissao-popup__rotulo {
    font-weight: var(--sl-font-weight-semibold, 600);
    color: var(--sl-color-primary-600, #0066cc);
  }

  .remissao-popup__rotulo--navegavel {
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .remissao-popup__rotulo--navegavel:hover {
    color: var(--sl-color-primary-700, #0052a3);
  }

  .remissao-popup--invalido .remissao-popup__rotulo {
    color: var(--sl-color-danger-600, #dc2626);
    cursor: default;
    text-decoration: none;
  }

  .remissao-popup__previa {
    color: var(--sl-color-neutral-500, #64748b);
    font-style: italic;
  }

  .remissao-popup__acoes {
    display: flex;
    gap: 4px;
  }

  .remissao-popup__btn {
    background: none;
    border: 1px solid var(--sl-color-neutral-200, #e2e8f0);
    border-radius: var(--sl-border-radius-small, 3px);
    cursor: pointer;
    padding: 2px 8px;
    font-size: var(--sl-font-size-x-small, 12px);
    font-family: inherit;
    color: var(--sl-color-neutral-700, #334155);
    line-height: 1.4;
  }

  .remissao-popup__btn:hover:not(:disabled) {
    background: var(--sl-color-neutral-50, #f8fafc);
  }

  .remissao-popup__btn--excluir:hover:not(:disabled) {
    color: var(--sl-color-danger-600, #dc2626);
    border-color: var(--sl-color-danger-300, #fca5a5);
  }

  .remissao-popup__btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export interface BotaoPopup {
  titulo: string;
  acao: () => void;
  desabilitado?: boolean;
  classe?: string;
}

export interface ConfiguracaoPopup {
  rotulo: string;
  textoPrevia?: string;
  invalido?: boolean;
  acaoNavegacao?: () => void;
  botoes: BotaoPopup[];
}

function injetarEstilos(): void {
  if (document.getElementById(ESTILOS_ID)) return;
  const style = document.createElement('style');
  style.id = ESTILOS_ID;
  style.textContent = ESTILOS_CSS;
  document.head.appendChild(style);
}

export function criarPopup(): HTMLDivElement {
  injetarEstilos();

  const popup = document.createElement('div');
  popup.id = 'remissao-popup';
  popup.style.display = 'none';

  const rotuloEl = document.createElement('span');
  rotuloEl.className = 'remissao-popup__rotulo';

  const previaEl = document.createElement('span');
  previaEl.className = 'remissao-popup__previa';

  const acoes = document.createElement('div');
  acoes.className = 'remissao-popup__acoes';

  popup.appendChild(rotuloEl);
  popup.appendChild(previaEl);
  popup.appendChild(acoes);

  return popup;
}

export function mostrarPopup(popup: HTMLDivElement, anchorEl: HTMLElement, config: ConfiguracaoPopup): void {
  const rotuloEl = popup.querySelector('.remissao-popup__rotulo') as HTMLElement;
  const acoesEl = popup.querySelector('.remissao-popup__acoes') as HTMLElement;

  rotuloEl.textContent = config.rotulo;

  const previaEl = popup.querySelector('.remissao-popup__previa') as HTMLElement;
  if (config.textoPrevia) {
    previaEl.textContent = config.textoPrevia;
    previaEl.style.display = '';
  } else {
    previaEl.textContent = '';
    previaEl.style.display = 'none';
  }

  // Remove listeners antigos clonando o elemento
  const rotuloNovo = rotuloEl.cloneNode(true) as HTMLElement;
  rotuloEl.replaceWith(rotuloNovo);

  const navegavel = !!config.acaoNavegacao && !config.invalido;
  rotuloNovo.classList.toggle('remissao-popup__rotulo--navegavel', navegavel);

  if (navegavel) {
    rotuloNovo.addEventListener('mousedown', e => e.preventDefault());
    rotuloNovo.addEventListener('click', () => {
      config.acaoNavegacao!();
      esconderPopup(popup);
    });
  }

  popup.classList.toggle('remissao-popup--invalido', !!config.invalido);

  acoesEl.innerHTML = '';
  for (const botao of config.botoes) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = botao.titulo;
    btn.className = `remissao-popup__btn${botao.classe ? ' ' + botao.classe : ''}`;

    if (botao.desabilitado) {
      btn.disabled = true;
    } else {
      btn.addEventListener('mousedown', e => e.preventDefault());
      btn.addEventListener('click', () => {
        botao.acao();
        esconderPopup(popup);
      });
    }

    acoesEl.appendChild(btn);
  }

  posicionarPopup(popup, anchorEl);
}

export function esconderPopup(popup: HTMLDivElement): void {
  popup.style.display = 'none';
}

function posicionarPopup(popup: HTMLElement, anchorEl: HTMLElement): void {
  popup.style.visibility = 'hidden';
  popup.style.display = 'flex';

  const anchorRect = anchorEl.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();

  let top = anchorRect.bottom + 8;
  let left = anchorRect.left + anchorRect.width / 2 - popupRect.width / 2;

  if (top + popupRect.height > window.innerHeight - 8) top = anchorRect.top - popupRect.height - 8;
  left = Math.max(8, Math.min(left, window.innerWidth - popupRect.width - 8));

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
  popup.style.visibility = '';
}
