// Verificações complementares no navegador: animações, pausa e migração.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const canvas = page.locator('canvas');
  const percent = async () =>
    Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
  const saved = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem('@anxietics/progress/v1')),
    );
  const back = () =>
    page.getByRole('button', { name: '‹  Voltar', exact: true }).click();
  async function open(game, variation = 0) {
    await page
      .getByRole('button', {
        name: 'Laboratório de desenvolvimento',
        exact: true,
      })
      .click();
    await page
      .getByRole('button', { name: new RegExp(`^Comparar ${game} ·.*2D original$`) })
      .nth(variation)
      .click();
    await expect(canvas).toBeVisible();
  }
  async function move(x, y) {
    const box = await canvas.boundingBox();
    assert.ok(box);
    await page.mouse.move(
      box.x + (x * box.width) / 320,
      box.y + (y * box.height) / 448,
    );
  }
  async function stroke(x1, y1, x2, y2) {
    await move(x1, y1);
    await page.mouse.down();
    await move(x2, y2);
    await page.mouse.up();
  }
  async function visibility(value) {
    await page.evaluate((state) => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    }, value);
  }
  try {
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:8081', {
      waitUntil: 'networkidle',
      timeout: 180000,
    });
    await expect(
      page.getByText('Seu jardim de pausas.', { exact: true }),
    ).toBeVisible({ timeout: 120000 });
    const baseline = await saved();
    await open('ink');
    await move(35, 35);
    await page.mouse.down();
    await page.mouse.up();
    const small = await canvas.screenshot();
    await page.waitForTimeout(350);
    const larger = await canvas.screenshot();
    assert.equal(
      small.equals(larger),
      false,
      'tinta expande com animações habilitadas',
    );
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    const paused = await canvas.screenshot();
    await page.waitForTimeout(500);
    assert.ok(
      paused.equals(await canvas.screenshot()),
      'tinta deixa de expandir durante pausa',
    );
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await back();
    await page.waitForTimeout(300);
    assert.deepEqual(await saved(), baseline);

    await open('stones');
    await page.waitForTimeout(300);
    const initial = await canvas.screenshot();
    await stroke(48, 365, 280, 320);
    assert.equal(await percent(), 0);
    await page.waitForTimeout(350);
    assert.ok(
      initial.equals(await canvas.screenshot()),
      'pedra retorna ao lugar depois de soltura fora',
    );
    await back();

    await open('water');
    await move(160, 390);
    await page.mouse.down();
    await move(85, 145);
    await expect.poll(percent).toBeGreaterThan(3);
    await visibility('hidden');
    await expect(
      page.getByRole('button', { name: 'Continuar', exact: true }),
    ).toBeDisabled();
    const before = await percent();
    await page.waitForTimeout(600);
    assert.equal(
      await percent(),
      before,
      'segundo plano simulado interrompe a rega',
    );
    await visibility('visible');
    await page.mouse.up();
    await expect(
      page.getByText('Sua rodada está aqui.', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page.waitForTimeout(300);
    assert.equal(
      await percent(),
      before,
      'retomar não acumula água sem novo gesto',
    );
    await back();
    await page.waitForTimeout(300);
    assert.deepEqual(await saved(), baseline);

    const shapes = [
      [
        [35, 340],
        [85, 205],
        [125, 260],
        [185, 100],
        [285, 340],
        [210, 370],
        [130, 370],
      ],
      [
        [55, 280],
        [135, 280],
        [135, 100],
        [250, 255],
        [285, 280],
        [245, 345],
        [95, 345],
      ],
    ];
    for (let i = 0; i < 2; i++) {
      await open('lights', i + 1);
      for (const [x, y] of shapes[i]) {
        await move(x, y);
        await page.mouse.down();
        await page.mouse.up();
      }
      await expect(page.getByTestId('completion-card')).toHaveCSS(
        'opacity',
        '1',
      );
      assert.equal(await percent(), 100);
      await back();
      await open('fruit', i + 1);
      for (const y of [95, 223, 351]) await stroke(20, y, 300, y);
      await expect(page.getByTestId('completion-card')).toHaveCSS(
        'opacity',
        '1',
      );
      assert.equal(await percent(), 100);
      await back();
    }
    const old = {
      version: 1,
      completedStageIds: ['jardim', 'clareira', 'bosque'],
      daily: {
        date: baseline.daily.date,
        completedStageIds: ['jardim', 'clareira'],
      },
      preferences: { reducedMotion: true },
    };
    await page.evaluate(
      (value) =>
        localStorage.setItem('@anxietics/progress/v1', JSON.stringify(value)),
      old,
    );
    await page.reload({ waitUntil: 'networkidle' });
    await expect(
      page.getByText(
        '2 conquistas da primeira versão também estão preservadas.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect.poll(async () => (await saved()).version).toBe(3);
    assert.deepEqual((await saved()).completedStageIds, old.completedStageIds);
    assert.equal(
      (await saved()).daily.tasks.filter((t) => t.completed).length,
      2,
    );
    await expect(
      page.getByRole('button', {
        name: 'Janela embaçada. Disponível',
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      page.getByRole('button', {
        name: 'Jardim de areia. Bloqueada',
        exact: true,
      }),
    ).toBeDisabled();
    assert.deepEqual(errors, []);
    console.log(
      'Ciclo de vida web aprovado: tinta animada/pausada, retorno de pedra, rega em segundo plano simulado, saída, variações de luzes/frutas e migração v1→v3.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
