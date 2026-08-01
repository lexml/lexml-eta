import { expect, Page, test } from '@playwright/test';

const DOC = 'mpv_885_2019';

const abrir = async (page: Page, sala: string, user: string): Promise<void> => {
  await page.goto(`/demo?doc=${sala}&user=${user}`);
  await page.selectOption('#projetoNorma', DOC);
  await page.click('input[value="Ok"]');
  await page.waitForSelector('.container__elemento.elemento-tipo-artigo', { timeout: 30_000 });
};

test('cursores: seleção de A aparece como cursor remoto em B', async ({ browser }) => {
  const sala = 'cur-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000); // conectar

  // A posiciona o cursor num dispositivo (foca o texto e digita para gerar seleção estável)
  const textoA = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await textoA.click();
  await a.keyboard.type('x');

  // B deve renderizar um cursor remoto (quill-cursors) com o nome de A
  await expect.poll(() => b.locator('.ql-cursor').count(), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect(b.locator('.ql-cursor-flag')).toContainText('Ana', { timeout: 5_000 });

  await ctxA.close();
  await ctxB.close();
});
