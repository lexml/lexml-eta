// Eventos nativos de teclado e mouse por CDP (Chromium); usar dentro de cy.then. Ver docs/guia-cypress.md, seção 15.

export const TECLA_HOME = { key: 'Home', code: 'Home', windowsVirtualKeyCode: 36, nativeVirtualKeyCode: 36 };
export const TECLA_END = { key: 'End', code: 'End', windowsVirtualKeyCode: 35, nativeVirtualKeyCode: 35 };
export const TECLA_SETA_DIREITA = { key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 };
export const TECLA_SETA_ESQUERDA = { key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37, nativeVirtualKeyCode: 37 };
export const TECLA_SETA_ABAIXO = { key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40 };
export const TECLA_SETA_ACIMA = { key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38, nativeVirtualKeyCode: 38 };
export const TECLA_D = { key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68, nativeVirtualKeyCode: 68 };
export const TECLA_ENTER = { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 };
// Tecla que digita um caractere: o campo text faz o navegador inserir o texto.
export const TECLA_X = { key: 'x', code: 'KeyX', text: 'x', windowsVirtualKeyCode: 88, nativeVirtualKeyCode: 88 };

export const ALT = 1;
export const CTRL = 2;
export const SHIFT = 8;

const cdp = (command: string, params: Record<string, unknown>): Promise<unknown> => Cypress.automation('remote:debugger:protocol', { command, params });

export const teclaNativa = async (tecla: Record<string, unknown>, modifiers = 0): Promise<void> => {
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', modifiers, ...tecla });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', modifiers, ...tecla });
};

// Coordenadas do CDP são da janela do runner: converte pela posição e escala do iframe da aplicação.
const paraJanelaDoRunner = (win: Window, x: number, y: number): { x: number; y: number } => {
  const frame = (win.top!.document.querySelector('iframe.aut-iframe') as HTMLElement).getBoundingClientRect();
  const escala = frame.width / win.innerWidth;
  return { x: frame.left + x * escala, y: frame.top + y * escala };
};

export const cliqueNativo = async (win: Window, x: number, y: number): Promise<void> => {
  const params = { ...paraJanelaDoRunner(win, x, y), button: 'left', clickCount: 1 };
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...params });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...params });
};

// Duplo clique: o segundo mousePressed com clickCount 2 faz o navegador selecionar a palavra.
export const duploCliqueNativo = async (win: Window, x: number, y: number): Promise<void> => {
  const ponto = paraJanelaDoRunner(win, x, y);
  for (const clickCount of [1, 2]) {
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...ponto, button: 'left', clickCount });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...ponto, button: 'left', clickCount });
  }
};

// Arrasto com o botão esquerdo pressionado, em passos, de (x1, y1) até (x2, y2), em coordenadas da aplicação.
export const arrastoNativo = async (win: Window, x1: number, y1: number, x2: number, y2: number, passos = 5): Promise<void> => {
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...paraJanelaDoRunner(win, x1, y1), button: 'left', clickCount: 1 });
  for (let i = 1; i <= passos; i++) {
    const ponto = paraJanelaDoRunner(win, x1 + ((x2 - x1) * i) / passos, y1 + ((y2 - y1) * i) / passos);
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...ponto, button: 'left', buttons: 1 });
  }
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...paraJanelaDoRunner(win, x2, y2), button: 'left', clickCount: 1 });
};
