import { expect, Page, test } from '@playwright/test';

const DOC = 'mpv_885_2019';

const abrir = async (page: Page, sala: string, user: string): Promise<void> => {
  await page.goto(`/demo?doc=${sala}&user=${user}`);
  await page.selectOption('#projetoNorma', DOC);
  await page.click('input[value="Ok"]');
  await page.waitForSelector('.container__elemento.elemento-tipo-artigo', { timeout: 30_000 });
};

const totalDispositivos = (page: Page): Promise<number> => page.locator('.container__elemento').count();

test('estrutura: dispositivo adicionado em A aparece em B (mesma sessão)', async ({ browser }) => {
  const sala = 'e2e-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');

  // dá tempo do WebsocketProvider conectar e sincronizar o seed compartilhado
  await a.waitForTimeout(2000);
  const antesB = await totalDispositivos(b);

  // A: foca o texto do primeiro artigo, vai ao fim e Enter (adiciona um dispositivo)
  const textoA = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await textoA.click();
  await a.keyboard.press('End');
  await a.keyboard.type('novo dispositivo colaborativo');
  await a.keyboard.press('Enter');

  await expect.poll(() => totalDispositivos(b), { timeout: 15_000 }).toBeGreaterThan(antesB);

  await ctxA.close();
  await ctxB.close();
});
