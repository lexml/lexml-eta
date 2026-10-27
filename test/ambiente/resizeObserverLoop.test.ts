import { expect } from '@open-wc/testing';

const aguardarQuadros = (quantidade: number): Promise<void> =>
  new Promise(resolve => {
    const proximo = (restantes: number): void => {
      if (restantes === 0) {
        resolve();
      } else {
        requestAnimationFrame(() => proximo(restantes - 1));
      }
    };
    proximo(quantidade);
  });

describe('Ambiente de testes — aviso "ResizeObserver loop"', () => {
  it('não derruba o teste quando o navegador emite o aviso', async () => {
    window.dispatchEvent(new ErrorEvent('error', { message: 'ResizeObserver loop completed with undelivered notifications.' }));
    window.dispatchEvent(new ErrorEvent('error', { message: 'ResizeObserver loop limit exceeded' }));
    await aguardarQuadros(1);

    expect(true).to.be.true;
  });

  it('não derruba o teste quando um ResizeObserver real altera o próprio layout', async () => {
    const elemento = document.createElement('div');
    elemento.style.cssText = 'width: 100px; height: 10px';
    document.body.appendChild(elemento);

    let largura = 100;
    const observer = new ResizeObserver(() => {
      largura += 1;
      elemento.style.width = `${largura}px`;
    });
    observer.observe(elemento);

    try {
      await aguardarQuadros(5);
    } finally {
      observer.disconnect();
      elemento.remove();
    }

    expect(largura).to.be.greaterThan(100);
  });
});
