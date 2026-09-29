// Smoke visual web das cenas novas; não substitui testes Android/iOS em aparelho.
const { chromium, expect } = require('@playwright/test');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const games = process.env.GAMES ? process.env.GAMES.split(',') : ['fruit', 'lights', 'stones', 'balls', 'sand', 'flowers', 'ink', 'water', 'window', 'reveal', 'wash', 'clay', 'paint'];
const output = mkdtempSync(join(tmpdir(), 'anxietics-3d-'));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:8081', { waitUntil: 'networkidle', timeout: 180000 });
    await expect(page.getByText('Seu jardim de pausas.', { exact: true })).toBeVisible({ timeout: 120000 });
    for (const game of games) {
      await page.getByRole('button', { name: 'Laboratório de desenvolvimento', exact: true }).click();
      await page.getByRole('button', { name: new RegExp(`^Testar ${game} ·.*3D$`) }).first().click();
      await expect(page.locator('canvas')).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(output, `${game}.png`) });
      if (errors.length) throw new Error(`${game}: ${errors.join(' | ')}`);
      await page.getByRole('button', { name: '‹  Voltar', exact: true }).click();
      process.stdout.write(`${game} OK\n`);
    }
    process.stdout.write(`Capturas 3D: ${output}\n`);
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
