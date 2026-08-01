import { expect, Page, test } from '@playwright/test';

const DOC = 'mpv_885_2019';

const abrir = async (page: Page, sala: string, user: string): Promise<void> => {
  await page.goto(`/demo?doc=${sala}&user=${user}`);
  await page.selectOption('#projetoNorma', DOC);
  await page.click('input[value="Ok"]');
  await page.waitForSelector('.container__elemento.elemento-tipo-artigo', { timeout: 30_000 });
};

test('texto: digitação em A converge no dispositivo de B', async ({ browser }) => {
  const sala = 'txt-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000); // conectar + sincronizar seed

  const marca = 'ZZZCOLAB';
  const textoA = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await textoA.click();
  await a.keyboard.type(marca);

  const textoB = b.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await expect.poll(() => textoB.textContent(), { timeout: 15_000 }).toContain(marca);

  await ctxA.close();
  await ctxB.close();
});
