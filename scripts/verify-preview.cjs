// Roteiro real de gestos no Chrome. Não mede desempenho nativo.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { grass3DPoint } = require('./grass3d-coordinates.cjs');
const output = join(tmpdir(), 'anxietics-preview');
const games = process.env.PREVIEW_GAMES
  ? process.env.PREVIEW_GAMES.split(',')
  : [
      'grass',
      'window',
      'sand',
      'wash',
      'paint',
      'flowers',
      'stones',
      'balls',
      'reveal',
      'water',
      'clay',
      'lights',
      'ink',
      'fruit',
    ];
const lights = [
  [70, 365],
  [95, 270],
  [75, 160],
  [160, 65],
  [245, 160],
  [225, 270],
  [160, 325],
  [145, 200],
];
const pots = [
  [85, 145],
  [235, 145],
  [85, 310],
  [235, 310],
];
(async () => {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.error('PAGE ERROR:', error.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('CONSOLE:', msg.text());
  });
  const percent = async () =>
    Number(await page.getByRole('progressbar', { includeHidden: true }).getAttribute('aria-valuenow'));
  const saved = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem('@anxietics/progress/v1')),
    );
  const screenshot = (name) =>
    page.screenshot({ path: join(output, `${name}.png`) });
  async function coords(point) {
    const b = await page.locator('canvas').boundingBox();
    assert.ok(b);
    if (await page.getByRole('img', { name: /Jardim 3D/ }).count())
      return grass3DPoint(b, point);
    return [
      b.x + (point[0] * b.width) / 320,
      b.y + (point[1] * b.height) / 448,
    ];
  }
  async function stroke(from, to, steps = 2) {
    await page.mouse.move(...(await coords(from)));
    await page.mouse.down();
    await page.mouse.move(...(await coords(to)), { steps });
    await page.mouse.up();
  }
  async function tap(point) {
    await page.mouse.click(...(await coords(point)));
  }
  async function back() {
    await page.getByRole('button', { name: '‹  Voltar', exact: true }).click();
  }
  async function openLab(game, variation = 0, free = false) {
    await page
      .getByRole('button', {
        name: 'Laboratório de desenvolvimento',
        exact: true,
      })
      .click();
    await page
      .getByRole('button', {
        name: free
          ? `Livre · ${game} · 2D original`
          : new RegExp(`^Comparar ${game} ·.*2D original$`),
      })
      .nth(free ? 0 : variation)
      .click();
    await expect(page.locator('canvas')).toBeVisible();
    if (!free)
      await expect(page.getByRole('progressbar', { includeHidden: true })).toHaveAttribute(
        'aria-valuenow',
        '0',
      );
  }
  async function water(from, index) {
    await page.mouse.move(...(await coords(from)));
    await page.mouse.down();
    await page.mouse.move(...(await coords(pots[index])), { steps: 3 });
    await expect
      // Teste funcional: tolera pausas do renderizador headless, sem alterar a regra de rega.
      .poll(percent, { timeout: 30000 })
      .toBeGreaterThanOrEqual((index + 1) * 25);
    await page.mouse.up();
  }
  async function partial(game) {
    if (['grass', 'window', 'wash', 'paint', 'reveal', 'clay'].includes(game))
      await stroke([1, 250], [319, 250]);
    if (game === 'sand') await stroke([20, 100], [300, 100]);
    if (game === 'flowers') await stroke([30, 112], [130, 112]);
    if (game === 'stones') await stroke([48, 365], [85, 92]);
    if (game === 'balls') await stroke([60, 280], [160, 125]);
    if (game === 'water') await water([160, 390], 0);
    if (game === 'lights') await tap(lights[0]);
    if (game === 'ink') await tap([100, 200]);
    if (game === 'fruit') await stroke([45, 95], [115, 95]);
    await expect.poll(percent).toBeGreaterThan(0);
  }
  async function finish(game) {
    if (['grass', 'window', 'wash', 'paint', 'reveal', 'clay'].includes(game)) {
      for (let y = 1; y <= 447 && (await percent()) < 100; y += 28)
        await stroke([1, y], [319, y]);
      if ((await percent()) < 100) await stroke([1, 447], [319, 447]);
      // O HUD responsivo muda a proporção do canvas. A câmera 3D se acomoda
      // nos primeiros quadros; complete a varredura com gestos verticais reais.
      if (game === 'grass' && (await percent()) < 100)
        for (let x = 1; x <= 319 && (await percent()) < 100; x += 24)
          await stroke([x, 1], [x, 447]);
    }
    if (game === 'sand')
      for (let i = 0; i < 4; i++)
        await stroke([20, 90 + i * 70], [300, 90 + i * 70]);
    if (game === 'flowers')
      for (const [x, y] of [
        [80, 112],
        [240, 112],
        [80, 322],
        [240, 322],
      ])
        for (const offset of [-20, 0, 20]) {
          if ((await percent()) < 100)
            await stroke([x - 45, y + offset], [x + 45, y + offset]);
        }
    if (game === 'stones')
      for (let i = 0; i < 4; i++)
        await stroke(
          [48 + 75 * i, 365],
          [
            [85, 92],
            [235, 92],
            [85, 215],
            [235, 215],
          ][i],
        );
    if (game === 'balls')
      for (let i = 0; i < 6; i++)
        await stroke(
          [60 + 100 * (i % 3), 280 + 95 * Math.floor(i / 3)],
          [58 + 102 * ((i + 1) % 3), 125],
        );
    if (game === 'water')
      for (let i = 0; i < 4; i++) await water(i ? pots[i - 1] : [160, 390], i);
    if (game === 'lights') for (const p of lights) await tap(p);
    if (game === 'ink')
      for (let c = 1; c <= 3; c++) {
        await page
          .getByRole('button', { name: `Cor ${c}`, exact: true })
          .click();
        for (let i = 0; i < 3; i++)
          await stroke(
            [60 + i * 75, 100 + c * 60],
            [100 + i * 65, 140 + c * 60],
          );
      }
    if (game === 'fruit')
      for (const y of [95, 223, 351]) await stroke([20, y], [300, y]);
    await expect(page.getByTestId('completion-card')).toBeVisible();
    await expect(page.getByTestId('completion-card')).toHaveCSS('opacity', '1');
    await expect(page.getByRole('progressbar', { includeHidden: true })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    assert.equal(await page.getByTestId('completion-card').count(), 1);
    await expect(
      page.getByText('Salvando no aparelho…', { exact: true }),
    ).toHaveCount(0);
  }
  try {
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:8081', {
      waitUntil: 'networkidle',
      timeout: 180000,
    });
    await expect(
      page.getByText('Seu jardim de pausas.', { exact: true }),
    ).toBeVisible({ timeout: 120000 });
    await screenshot('trilha');
    await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
    await page.getByRole('switch', { name: 'Menos movimento' }).click();
    await expect
      .poll(async () => (await saved()).preferences.reducedMotion)
      .toBe(true);
    await page
      .getByRole('button', { name: 'Voltar à trilha', exact: true })
      .click();
    const baseline = await saved();
    for (const game of games) {
      console.log(`Interação: ${game}`);
      await openLab(game);
      await screenshot(`${game}-inicio`);
      await partial(game);
      await screenshot(`${game}-gesto`);
      const before = await percent();
      if (
        ['grass', 'window', 'wash', 'paint', 'reveal', 'clay'].includes(game)
      ) {
        await stroke([1, 250], [319, 250]);
        assert.equal(await percent(), before, 'sobreposição');
      }
      await page.getByRole('button', { name: 'Pausar', exact: true }).click();
      await expect(
        page.getByText('Sua rodada está aqui.', { exact: true }),
      ).toBeVisible();
      assert.equal(await percent(), before);
      await page
        .getByRole('button', { name: 'Continuar', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Recomeçar', exact: true })
        .click();
      await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
      assert.equal(
        await percent(),
        before,
        'cancelar reinício preserva rodada',
      );
      await page
        .getByRole('button', { name: 'Recomeçar', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Sim, recomeçar', exact: true })
        .click();
      await expect(page.getByRole('progressbar', { includeHidden: true })).toHaveAttribute(
        'aria-valuenow',
        '0',
      );
      await finish(game);
      await screenshot(`${game}-conclusao`);
      assert.deepEqual(
        await saved(),
        baseline,
        'laboratório não altera progresso',
      );
      await back();
    }
    for (const game of ['sand', 'flowers', 'ink']) {
      await openLab(game, 0, true);
      for (let i = 0; i < 5; i++)
        await stroke([20, 90 + i * 60], [300, 90 + i * 60]);
      await expect(page.getByTestId('completion-card')).toHaveCount(0);
      await expect(page.getByRole('progressbar', { includeHidden: true })).toHaveCount(0);
      await page
        .getByRole('button', { name: 'Encerrar por aqui', exact: true })
        .click();
      await expect(page.getByTestId('completion-card')).toBeVisible();
      assert.deepEqual(await saved(), baseline);
      await back();
    }
    await openLab('paint');
    await partial('paint');
    const resizedPercent = await percent();
    for (const size of [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(size);
      await expect
        .poll(async () => {
          const field = await page.locator('canvas').boundingBox();
          const restart = await page
            .getByRole('button', { name: 'Recomeçar', exact: true })
            .boundingBox();
          return (
            field &&
            restart &&
            field.width > 0 &&
            field.height > 0 &&
            field.x >= 0 &&
            field.y >= 0 &&
            field.x + field.width <= size.width + 1 &&
            field.y + field.height < restart.y
          );
        })
        .toBeTruthy();
      assert.equal(await percent(), resizedPercent);
      await screenshot(`dimensoes-${size.width}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await back();
    await page
      .getByRole('button', { name: 'Cortar grama. Disponível', exact: true })
      .click();
    await finish('grass');
    await back();
    await page.reload({ waitUntil: 'networkidle' });
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
    assert.deepEqual((await saved()).completedStageIds, ['jardim']);
    await page
      .getByRole('button', {
        name: 'Cortar grama. Concluída, repetir',
        exact: true,
      })
      .click();
    await expect(page.getByText('MODO LIVRE', { exact: true })).toBeVisible();
    await finish('grass');
    await back();
    assert.deepEqual((await saved()).completedStageIds, ['jardim']);
    assert.equal(
      (await saved()).daily.tasks.filter((t) => t.completed).length,
      1,
    );
    for (let i = 1; i < 3; i++) {
      await page.getByRole('tab', { name: 'Hoje', exact: true }).click();
      await page
        .getByRole('button', { name: 'Jogar atividade', exact: true })
        .first()
        .click();
      await finish('grass');
      await back();
      assert.equal(
        (await saved()).daily.tasks.filter((t) => t.completed).length,
        i + 1,
      );
    }
    await page.getByRole('tab', { name: 'Hoje', exact: true }).click();
    await expect(
      page.getByText('Seu jardim recebeu os três cuidados de hoje.', {
        exact: true,
      }),
    ).toBeVisible();
    await screenshot('diarias-concluidas');
    await page.getByRole('tab', { name: 'Livre', exact: true }).click();
    await page.getByRole('button', { name: 'Jardim', exact: true }).click();
    await finish('grass');
    await back();
    assert.deepEqual((await saved()).completedStageIds, ['jardim']);
    await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
    await expect(
      page.getByRole('switch', { name: 'Menos movimento' }),
    ).toBeChecked();
    const preReset = await saved();
    await page
      .getByRole('button', { name: 'Apagar dados deste aparelho', exact: true })
      .click();
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    assert.deepEqual(await saved(), preReset);
    await page
      .getByRole('button', { name: 'Apagar dados deste aparelho', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Apagar e recomeçar', exact: true })
      .click();
    await expect
      .poll(async () => (await saved()).completedStageIds.length)
      .toBe(0);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal((await saved()).preferences.reducedMotion, false);
    assert.equal(
      (await saved()).daily.tasks.filter((t) => t.completed).length,
      0,
    );
    await expect(
      page.getByRole('button', {
        name: 'Janela embaçada. Bloqueada',
        exact: true,
      }),
    ).toBeDisabled();
    assert.deepEqual(errors, []);
    const result = {
      browser: `Chrome ${browser.version()}`,
      viewport: '390x844; 320x568; 768x1024; 844x390',
      games,
      checks:
        '14 conclusões, sobreposição, pausa, reinício, livre, dimensões, persistência web, desbloqueio, diárias, repetição, preferências, reset',
      nativeDevices: [],
      errors,
    };
    writeFileSync(
      join(output, 'resultado.json'),
      JSON.stringify(result, null, 2),
    );
    console.log(JSON.stringify(result, null, 2));
    console.log(`Capturas: ${output}`);
  } catch (error) {
    await screenshot('falha');
    console.error((await page.locator('body').innerText()).slice(0, 5000));
    throw error;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
