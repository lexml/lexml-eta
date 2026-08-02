import { Page, expect, test } from '@playwright/test';

const DOC = 'mpv_885_2019';

const abrir = async (page: Page, sala: string, user: string): Promise<void> => {
  await page.goto(`/demo?doc=${sala}&user=${user}`);
  await page.selectOption('#projetoNorma', DOC);
  await page.click('input[value="Ok"]');
  await page.waitForSelector('.container__elemento.elemento-tipo-artigo', { timeout: 30_000 });
};

// Sequência de tipos (classe elemento-tipo-*) na ordem de leitura — para comparar A e B.
const tipos = (page: Page): Promise<string> =>
  page
    .locator('.container__elemento')
    .evaluateAll(els => els.map(e => Array.from(e.classList).find(c => c.startsWith('elemento-tipo-'))))
    .then(a => JSON.stringify(a));

test('transform (Shift+TAB): promoção de tipo em A converge para B', async ({ browser }) => {
  const sala = 'tab-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000);

  const antes = await tipos(b);

  // A promove o primeiro inciso (Shift+Tab → tabAction), mudando o tipo. Foco direto no elemento
  // (sem Enter antes, que rebuildaria o DOM e soltaria o foco).
  const incisoA = a.locator('.container__elemento.elemento-tipo-inciso .texto__dispositivo').first();
  await incisoA.click();
  await a.keyboard.press('End');
  await a.keyboard.press('Shift+Tab');

  // B converge para a mesma sequência de tipos de A, diferente da inicial.
  await expect.poll(async () => (await tipos(b)) === (await tipos(a)) && (await tipos(b)) !== antes, { timeout: 15_000 }).toBe(true);

  await ctxA.close();
  await ctxB.close();
});
