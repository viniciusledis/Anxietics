// Verificação auxiliar no navegador. Não substitui testes nativos no celular.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');

(async () => {
  mkdirSync('/tmp/anxietics-preview', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('PAGE ERROR:', error.message); });
  page.on('console', message => { if (message.type() === 'error') console.error('CONSOLE:', message.text()); });
  const percentage = async () => Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('@anxietics/progress/v1')));
  const stroke = async (box, y) => {
    await page.mouse.move(box.x + 1, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 1, y, { steps: 2 });
    await page.mouse.up();
  };
  const finishField = async () => {
    const box = await page.locator('canvas').boundingBox();
    assert.ok(box);
    for (let y = 2; y < box.height && await percentage() < 100; y += box.height * 30 / 448) {
      await stroke(box, box.y + y);
    }
    await expect(page.getByText('Um campo renovado.', { exact: true })).toBeVisible();
    await expect(page.getByTestId('completion-card')).toHaveCSS('opacity', '1');
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    assert.equal(await page.getByText('Um campo renovado.', { exact: true }).count(), 1);
    await expect(page.getByText('Salvando no aparelho…', { exact: true })).toHaveCount(0);
  };
  try {
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 180000 });
    await page.getByText('Um pequeno', { exact: false }).waitFor({ timeout: 120000 });
    await page.screenshot({ path: '/tmp/anxietics-preview/trilha.png', fullPage: true });
    await page.getByRole('button', { name: /Jardim de início/ }).click();
    await page.getByRole('progressbar').waitFor();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    await page.screenshot({ path: '/tmp/anxietics-preview/campo.png' });
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas não encontrado.');
    await stroke(box, box.y + box.height / 2);
    await expect.poll(percentage).toBeGreaterThan(0);
    const firstCut = await percentage();
    await stroke(box, box.y + box.height / 2);
    assert.equal(await percentage(), firstCut, 'repetir a região não aumenta o progresso');
    await page.screenshot({ path: '/tmp/anxietics-preview/corte.png' });
    for (const size of [{ width: 320, height: 568 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(size);
      console.log('Verificando dimensões:', size);
      await expect.poll(async () => {
        const field = await page.locator('canvas').boundingBox();
        const restart = await page.getByRole('button', { name: 'Recomeçar campo' }).boundingBox();
        return field && restart && field.width > 0 && field.height > 0 && field.x >= 0 && field.y >= 0
          && field.x + field.width <= size.width + 1 && field.y + field.height < restart.y;
      }).toBeTruthy();
      assert.equal(await percentage(), firstCut, 'redimensionar preserva a rodada');
      await page.screenshot({ path: `/tmp/anxietics-preview/campo-${size.width}.png` });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await finishField();
    await page.screenshot({ path: '/tmp/anxietics-preview/conclusao.png' });
    assert.deepEqual((await saved()).completedStageIds, ['jardim']);
    await page.getByRole('button', { name: 'Jogar de novo', exact: true }).click();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    await finishField();
    assert.deepEqual((await saved()).completedStageIds, ['jardim']);
    assert.deepEqual((await saved()).daily.completedStageIds, ['jardim']);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: /Clareira dourada/ })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Cantinho do bosque/ })).toBeDisabled();
    await page.getByRole('button', { name: 'Abrir preferências e informações' }).click();
    await page.getByRole('switch', { name: 'Menos movimento' }).click();
    await expect.poll(async () => (await saved()).preferences.reducedMotion).toBe(true);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Abrir preferências e informações' }).click();
    await expect(page.getByRole('switch', { name: 'Menos movimento' })).toBeChecked();
    await page.getByRole('button', { name: /Voltar à trilha/ }).click();
    for (const [title, filename] of [['Clareira dourada', 'clareira'], ['Cantinho do bosque', 'bosque']]) {
      await page.getByRole('button', { name: new RegExp(title) }).click();
      await page.screenshot({ path: `/tmp/anxietics-preview/${filename}.png` });
      await finishField();
      await page.getByRole('button', { name: 'Voltar à trilha', exact: true }).click();
    }
    await expect(page.getByText('Seu trio de hoje está completo', { exact: true })).toBeVisible();
    assert.deepEqual((await saved()).completedStageIds, ['jardim', 'clareira', 'bosque']);
    await page.getByRole('button', { name: /Jardim de início/ }).click();
    await expect(page.getByText('MODO LIVRE', { exact: true })).toBeVisible();
    assert.deepEqual(errors, []);
    console.log('Prévia aprovada: gesto, sobreposição, redimensionamento, conclusão, repetição, recarga, preferências e modo livre.');
    console.log('Capturas salvas em /tmp/anxietics-preview');
  } catch (error) {
    await page.screenshot({ path: '/tmp/anxietics-preview/falha.png' });
    console.error('Geometria da falha:', {
      field: await page.locator('canvas').boundingBox().catch(() => null),
      restart: await page.getByRole('button', { name: 'Recomeçar campo' }).boundingBox().catch(() => null),
      viewport: page.viewportSize(),
    });
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
