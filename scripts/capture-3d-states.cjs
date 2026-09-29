// Capturas de QA dos estados intermediários; não altera dados do usuário.
const { chromium, expect } = require('@playwright/test');
const { PerspectiveCamera, Vector3 } = require('three');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const cases = {
  fruit: { position: [3, 14, 11], fov: 50 },
  sand: { position: [3.2, 14, 11.5], fov: 51 },
  flowers: { position: [3, 14.5, 11], fov: 52 },
  ink: { position: [-1.8, 13.5, 10], fov: 51 },
  window: { position: [1.7, 13.3, 10.8], fov: 58 },
};
const output = mkdtempSync(join(tmpdir(), 'anxietics-3d-states-'));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let game;
  async function coord([x, y]) {
    const box = await page.locator('canvas').boundingBox();
    const config = cases[game];
    const camera = new PerspectiveCamera(config.fov, box.width / box.height, 0.1, 65);
    camera.position.set(...config.position);
    camera.lookAt(0, 0, 1);
    camera.updateMatrixWorld();
    const p = new Vector3((x - 160) / 50, 0, (y - 224) / 50).project(camera);
    return [box.x + (p.x + 1) * box.width / 2, box.y + (1 - p.y) * box.height / 2];
  }
  async function stroke(a, b) {
    await page.mouse.move(...(await coord(a)));
    await page.mouse.down();
    await page.mouse.move(...(await coord(b)), { steps: 8 });
    await page.mouse.up();
  }
  try {
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:8081', { waitUntil: 'networkidle', timeout: 180000 });
    await expect(page.getByText('Seu jardim de pausas.', { exact: true })).toBeVisible({ timeout: 120000 });
    for (game of Object.keys(cases)) {
      await page.getByRole('button', { name: 'Laboratório de desenvolvimento', exact: true }).click();
      await page.getByRole('button', { name: new RegExp(`^Testar ${game} ·.*3D$`) }).first().click();
      await expect(page.locator('canvas')).toBeVisible();
      if (game === 'fruit') await stroke([45, 95], [115, 95]);
      if (game === 'sand') await stroke([20, 160], [300, 160]);
      if (game === 'flowers') for (const y of [95, 112, 129]) await stroke([35, y], [125, y]);
      if (game === 'ink') for (const p of [[100, 180], [160, 220], [220, 260]]) await page.mouse.click(...(await coord(p)));
      if (game === 'window') for (const y of [95, 180, 265]) await stroke([1, y], [319, y]);
      await page.waitForTimeout(700);
      await page.screenshot({ path: join(output, `${game}-durante.png`) });
      await page.getByRole('button', { name: '‹  Voltar', exact: true }).click();
    }
    process.stdout.write(`Capturas de estados: ${output}\n`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
