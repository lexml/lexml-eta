import { Page, expect, test } from '@playwright/test';

const DOC = 'mpv_885_2019';

const abrir = async (page: Page, sala: string, user: string): Promise<void> => {
  await page.goto(`/demo?doc=${sala}&user=${user}`);
  await page.selectOption('#projetoNorma', DOC);
  await page.click('input[value="Ok"]');
  await page.waitForSelector('.container__elemento.elemento-tipo-artigo', { timeout: 30_000 });
};

test('remissão: link digitado em A é re-detectado e renderizado em B pela co-edição', async ({ browser }) => {
  const sala = 'remissao-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000);

  const linksB = (): Promise<number> => b.locator('a.lexml-remissao-interna').count();
  const antes = await linksB();

  // A digita uma remissão ao art. 2º no primeiro artigo; a co-edição sincroniza o texto para B,
  // que re-detecta o link localmente (sem B interagir).
  const textoA = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await textoA.click();
  await a.keyboard.press('End');
  await a.keyboard.type(' vide o art. 2º');

  await expect.poll(linksB, { timeout: 15_000 }).toBeGreaterThan(antes);

  await ctxA.close();
  await ctxB.close();
});

test('remissão tombstone: link removido manualmente em A some em B (e não recria)', async ({ browser }) => {
  const sala = 'tombstone-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000);

  const linksB = (): Promise<number> => b.locator('a.lexml-remissao-interna').count();
  const antes = await linksB();

  // A cria a remissão e sai da linha (detecção em A); B re-detecta pela co-edição (A2.a).
  const art1A = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await art1A.click();
  await a.keyboard.press('End');
  await a.keyboard.type(' vide o art. 2º');
  await a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').nth(1).click(); // blur
  await expect.poll(linksB, { timeout: 15_000 }).toBeGreaterThan(antes);

  // A abre o popup do link (no 1º artigo) e clica em Excluir → tombstone, que sincroniza para B.
  await a.locator('.container__elemento.elemento-tipo-artigo').first().locator('a.lexml-remissao-interna').first().click();
  await a.locator('.remissao-popup__btn--excluir').click();

  // B perde o link (tombstone) e a re-detecção não o recria.
  await expect.poll(linksB, { timeout: 15_000 }).toBe(antes);

  await ctxA.close();
  await ctxB.close();
});
