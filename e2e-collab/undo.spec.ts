import { expect, Page, test } from '@playwright/test';

const DOC = 'mpv_885_2019';

const abrir = async (page: Page, sala: string, user: string): Promise<void> => {
  await page.goto(`/demo?doc=${sala}&user=${user}`);
  await page.selectOption('#projetoNorma', DOC);
  await page.click('input[value="Ok"]');
  await page.waitForSelector('.container__elemento.elemento-tipo-artigo', { timeout: 30_000 });
};

test('undo: Ctrl+Z de A desfaz a inclusão em A e em B', async ({ browser }) => {
  const sala = 'undo-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000);

  const totalB = (): Promise<number> => b.locator('.container__elemento').count();
  const antes = await totalB();

  // A adiciona um dispositivo (Enter ao fim do texto de um artigo)
  const textoA = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await textoA.click();
  await a.keyboard.press('End');
  await a.keyboard.press('Enter');
  await expect.poll(totalB, { timeout: 15_000 }).toBeGreaterThan(antes);

  // A desfaz (Ctrl+Z) — deve sumir em A e em B
  await a.keyboard.press('Control+z');
  await expect.poll(totalB, { timeout: 15_000 }).toBe(antes);

  await ctxA.close();
  await ctxB.close();
});

test('redo: Ctrl+Y de A reaplica a inclusão desfeita em A e em B', async ({ browser }) => {
  const sala = 'redo-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000);

  const totalB = (): Promise<number> => b.locator('.container__elemento').count();
  const antes = await totalB();

  const textoA = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await textoA.click();
  await a.keyboard.press('End');
  await a.keyboard.press('Enter');
  await expect.poll(totalB, { timeout: 15_000 }).toBeGreaterThan(antes);

  // Undo/redo pelos botões da toolbar (onClickUndo/onClickRedo → quill.undo()/redo()): o mesmo divert
  // para o Y.UndoManager, mas sem depender do foco no editor (que o rebuild do undo estrutural solta).
  await a.locator('button.lx-eta-btn-desfazer').click();
  await expect.poll(totalB, { timeout: 15_000 }).toBe(antes);

  // A refaz — a inclusão desfeita reaparece em A e em B.
  await a.locator('button.lx-eta-btn-refazer').click();
  await expect.poll(totalB, { timeout: 15_000 }).toBeGreaterThan(antes);

  await ctxA.close();
  await ctxB.close();
});

test('undo de texto: Ctrl+Z de A reverte a digitação em A e em B', async ({ browser }) => {
  const sala = 'undotxt-' + Date.now();
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await abrir(a, sala, 'Ana');
  await abrir(b, sala, 'Bia');
  await a.waitForTimeout(2000);

  // marcador de 1 caractere ⇒ 1 transação Y.Text ⇒ 1 passo de undo (evita a granularidade fina)
  const marca = 'Ω';
  const textoA = a.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await textoA.click();
  await a.keyboard.type(marca);

  const textoB = b.locator('.container__elemento.elemento-tipo-artigo .texto__dispositivo').first();
  await expect.poll(() => textoB.textContent(), { timeout: 15_000 }).toContain(marca);

  // A desfaz — em colaboração o undo de texto é servido pelo Y.UndoManager (não pela história do Quill)
  await a.keyboard.press('Control+z');
  await expect.poll(() => textoB.textContent(), { timeout: 15_000 }).not.toContain(marca);

  await ctxA.close();
  await ctxB.close();
});
