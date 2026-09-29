// Regressão de gesto nas cenas R3F no Chrome. GPU/FPS nativo exigem aparelho.
const { chromium, expect } = require('@playwright/test');
const { PerspectiveCamera, Vector3 } = require('three');
const { mkdtempSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const captures = process.env.CAPTURE_VISUAL ? mkdtempSync(join(tmpdir(), 'anxietics-premium-states-')) : null;

const configs = {
  fruit: [[3, 14, 11], 50], lights: [[-2.4, 13, 12], 51],
  stones: [[-2.8, 14.5, 11], 52], balls: [[1.7, 14, 11.5], 52],
  sand: [[3.2, 14, 11.5], 51], flowers: [[3, 14.5, 11], 52],
  ink: [[-1.8, 13.5, 10], 51], water: [[2.3, 13.5, 11.5], 51],
  window: [[1.7, 13.3, 10.8], 58], reveal: [[-2, 12.5, 10], 58],
  wash: [[2.2, 12.5, 10.5], 58], clay: [[-2.3, 12.6, 10.4], 58],
  paint: [[1.4, 12.6, 10.2], 58],
};
const lights = [[70, 365], [95, 270], [75, 160], [160, 65], [245, 160], [225, 270], [160, 325], [145, 200]];
const pots = [[85, 145], [235, 145], [85, 310], [235, 310]];
const games = process.env.PREVIEW_GAMES ? process.env.PREVIEW_GAMES.split(',') : Object.keys(configs);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const percent = async () => Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
  let game;
  const captured = new Set();
  async function captureDuring() {
    if (!captures || captured.has(game)) return;
    if (!(await page.getByRole('progressbar').count())) return; // Free modes deliberately have no HUD progress.
    const value = await percent();
    if (value >= 30 && value < 100) { captured.add(game); await page.screenshot({ path: join(captures, `${game}-durante.png`) }); }
  }
  async function coord([x, y]) {
    const box = await page.locator('canvas').boundingBox();
    if (!box) throw new Error('Canvas ausente');
    const [position, fov] = configs[game];
    const camera = new PerspectiveCamera(fov, box.width / box.height, 0.1, 65);
    camera.position.set(...position);
    camera.lookAt(0, 0, 1);
    camera.updateMatrixWorld();
    const projected = new Vector3((x - 160) / 50, 0, (y - 224) / 50).project(camera);
    return [box.x + (projected.x + 1) * box.width / 2, box.y + (1 - projected.y) * box.height / 2];
  }
  async function stroke(a, b) {
    await page.mouse.move(...(await coord(a)));
    await page.mouse.down();
    await page.mouse.move(...(await coord(b)), { steps: 8 });
    await page.mouse.up();
    await captureDuring();
  }
  async function tap(point) { await page.mouse.click(...(await coord(point))); await captureDuring(); }
  try {
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:8081', { waitUntil: 'networkidle', timeout: 180000 });
    await expect(page.getByText('Seu jardim de pausas.', { exact: true })).toBeVisible({ timeout: 120000 });
    for (game of games) {
      await page.getByRole('button', { name: 'Laboratório de desenvolvimento', exact: true }).click();
      await page.getByRole('button', { name: new RegExp(`^Testar ${game} ·.*3D$`) }).first().click();
      await expect(page.locator('canvas')).toBeVisible();
      if (game === 'fruit') for (const y of [95, 223, 351]) await stroke([20, y], [300, y]);
      else if (game === 'lights') for (const point of lights) await tap(point);
      else if (game === 'stones') for (let i = 0; i < 4; i++) await stroke([48 + i * 75, 365], [[85, 92], [235, 92], [85, 215], [235, 215]][i]);
      else if (game === 'balls') for (let i = 0; i < 6; i++) await stroke([60 + 100 * (i % 3), 280 + 95 * Math.floor(i / 3)], [[58, 125], [160, 125], [262, 125]][(i + 1) % 3]);
      else if (game === 'sand') for (let i = 0; i < 4; i++) await stroke([20, 90 + i * 70], [300, 90 + i * 70]);
      else if (game === 'flowers') for (const [x, y] of [[80, 112], [240, 112], [80, 322], [240, 322]]) for (const offset of [-20, 0, 20]) { if ((await percent()) < 100) await stroke([x - 45, y + offset], [x + 45, y + offset]); }
      else if (game === 'ink') for (let c = 1; c <= 3; c++) {
        await page.getByRole('button', { name: `Cor ${c}`, exact: true }).click();
        for (let i = 0; i < 3; i++) await tap([60 + i * 80, 100 + c * 60]);
      }
      else if (game === 'water') for (let i = 0; i < 4; i++) {
        const start = i ? pots[i - 1] : [160, 390];
        await page.mouse.move(...(await coord(start)));
        await page.mouse.down();
        await page.mouse.move(...(await coord(pots[i])), { steps: 5 });
        await expect.poll(percent, { timeout: 30000 }).toBeGreaterThanOrEqual((i + 1) * 25);
        await page.mouse.up();
        await captureDuring();
      }
      else for (let y = 1; y <= 447 && (await percent()) < 100; y += game === 'wash' ? 20 : 27) await stroke([1, y], [319, y]);
      if (captures) await page.screenshot({ path: join(captures, `${game}-final.png`) });
      await expect(page.getByTestId('completion-card')).toBeVisible({ timeout: 12000 });
      // Additional scene-only QA image. The normal, unmodified UI capture above is retained.
      if (captures) await page.screenshot({ path: join(captures, `${game}-scene.png`), style: '[data-testid="completion-card"] { visibility: hidden !important; }' });
      await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
      if (errors.length) throw new Error(`${game}: ${errors.join(' | ')}`);
      process.stdout.write(`${game} 100% OK\n`);
      await page.getByRole('button', { name: '‹  Voltar', exact: true }).click();
    }
    if (captures) process.stdout.write(`Capturas de polish: ${captures}\n`);
    for (game of ['sand', 'flowers', 'ink']) {
      await page.getByRole('button', { name: 'Laboratório de desenvolvimento', exact: true }).click();
      await page.getByRole('button', { name: `Livre · ${game} · 3D`, exact: true }).click();
      await expect(page.locator('canvas')).toBeVisible();
      if (game === 'sand') for (let i = 0; i < 4; i++) await stroke([20, 90 + i * 70], [300, 90 + i * 70]);
      if (game === 'flowers') for (const [x, y] of [[80, 112], [240, 112], [80, 322], [240, 322]]) for (const offset of [-20, 0, 20]) await stroke([x - 45, y + offset], [x + 45, y + offset]);
      if (game === 'ink') for (let c = 1; c <= 3; c++) {
        await page.getByRole('button', { name: `Cor ${c}`, exact: true }).click();
        for (let i = 0; i < 3; i++) await tap([60 + i * 80, 100 + c * 60]);
      }
      await expect(page.getByRole('progressbar')).toHaveCount(0);
      await expect(page.getByTestId('completion-card')).toHaveCount(0);
      await page.getByRole('button', { name: 'Encerrar por aqui', exact: true }).click();
      await expect(page.getByTestId('completion-card')).toBeVisible();
      await page.getByRole('button', { name: '‹  Voltar', exact: true }).click();
      process.stdout.write(`${game} livre OK\n`);
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(`Falha em ${games.join(', ')}:`, error); process.exitCode = 1; });
