// Fluxo completo em perfil temporário: usa jogos reais, sem injetar saldo.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
(async () => {
  const output = join(tmpdir(), 'anxietics-economy');
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.error(e.message);
  });
  const button = (name) => page.getByRole('button', { name, exact: true });
  const saved = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem('@anxietics/progress/v1')),
    );
  const percent = async () =>
    Number(
      await page
        .getByRole('progressbar', { name: 'Progresso da atividade' })
        .getAttribute('aria-valuenow'),
    );
  const screenshot = async (name) => {
    if (await page.getByTestId('completion-card').count())
      await expect(page.getByTestId('completion-card')).toHaveCSS(
        'opacity',
        '1',
      );
    return page.screenshot({
      path: join(output, `${name}.png`),
      fullPage: true,
    });
  };
  async function stroke(a, b) {
    const box = await page.locator('canvas').boundingBox();
    assert.ok(box);
    const point = (p) => [
      box.x + (p[0] * box.width) / 320,
      box.y + (p[1] * box.height) / 448,
    ];
    await page.mouse.move(...point(a));
    await page.mouse.down();
    await page.mouse.move(...point(b), { steps: 2 });
    await page.mouse.up();
  }
  async function finish(game, fail = false) {
    if (['grass', 'window', 'wash', 'paint'].includes(game)) {
      for (let y = 1; y < 448 && (await percent()) < 100; y += 28)
        await stroke([1, y], [319, y]);
    }
    if (game === 'sand')
      for (let i = 0; i < 4; i++)
        await stroke([20, 80 + i * 80], [300, 80 + i * 80]);
    if (game === 'flowers')
      for (const [x, y] of [
        [80, 112],
        [240, 112],
        [80, 322],
        [240, 322],
      ])
        for (const dy of [-20, 0, 20])
          if ((await percent()) < 100)
            await stroke([x - 45, y + dy], [x + 45, y + dy]);
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
    await expect(page.getByTestId('completion-card')).toBeVisible();
    if (!fail) await expect(button('Continuar trilha')).toBeEnabled();
  }
  async function buy(name, price) {
    await button(`Ver ${name}`).click();
    await button(`Confirmar compra · ${price} sementes`).click();
    await expect(
      page.getByText('Compra salva. O item agora é seu.', { exact: true }),
    ).toBeVisible();
  }
  async function backFromShop() {
    await button('Voltar aos itens').click();
    await button('Voltar à trilha').click();
  }
  async function stage(name) {
    await button(`${name}. Disponível`).click();
  }
  async function failWrites(value) {
    await page.evaluate((flag) => {
      if (!window.anxieticsOriginalSetItem) {
        window.anxieticsOriginalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) {
          if (window.anxieticsFailWrites && k === '@anxietics/progress/v1')
            throw new Error('Falha de disco simulada pelo teste');
          return window.anxieticsOriginalSetItem.call(this, k, v);
        };
      }
      window.anxieticsFailWrites = flag;
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
    assert.equal((await saved()).economy.seeds, 50);
    await screenshot('inicio');
    // Falha na conclusão: nada é anunciado como recebido até a gravação confirmar.
    await stage('Cortar grama');
    await failWrites(true);
    await finish('grass', true);
    await expect(button('Tentar salvar conclusão')).toBeVisible();
    await expect(button('Continuar trilha')).toBeDisabled();
    assert.equal((await saved()).economy.seeds, 50);
    await expect(page.getByTestId('rewards-total')).toHaveCount(0);
    await failWrites(false);
    await button('Tentar salvar conclusão').click();
    await expect(page.getByTestId('rewards-total')).toHaveText(
      'Recebido: 45 sementes · 50 XP',
    );
    assert.equal((await saved()).economy.seeds, 95);
    await screenshot('recompensas');
    await button('Visitar loja').click();
    await buy('Cortador azul', 30);
    await button('Equipar item').click();
    await expect(
      page.getByText('Item equipado e salvo.', { exact: true }),
    ).toBeVisible();
    await screenshot('aparencia-adquirida');
    await backFromShop();
    await button('Cortar grama. Concluída, repetir').click();
    await expect(page.getByTestId('grass-loadout')).toHaveText(
      'Cortador padrão · azul',
    );
    await stroke([1, 250], [319, 250]);
    const standard = await percent();
    await screenshot('cortador-azul-padrao');
    await button('‹  Voltar').click();
    for (let i = 0; i < 2; i++) {
      await page.getByRole('tab', { name: 'Hoje', exact: true }).click();
      await button('Jogar atividade').first().click();
      await finish('grass');
      await button('Voltar à trilha').click();
    }
    assert.equal((await saved()).economy.seeds, 110);
    assert.equal((await saved()).economy.xp, 90);
    await stage('Janela embaçada');
    await finish('window');
    await expect(
      page.getByText('Novo nível: 2', { exact: true }),
    ).toBeVisible();
    await button('Continuar trilha').click();
    await finish('sand');
    await expect(
      page.getByText('Explorador: +25 sementes · +0 XP', { exact: true }),
    ).toBeVisible();
    assert.equal((await saved()).economy.seeds, 175);
    await button('Visitar loja').click();
    await buy('Cortador largo', 150);
    await button('Equipar item').click();
    await backFromShop();
    await button('Cortar grama. Concluída, repetir').click();
    await expect(page.getByTestId('grass-loadout')).toHaveText(
      'Cortador largo · azul',
    );
    await stroke([1, 250], [319, 250]);
    const wide = await percent();
    assert.ok(wide > standard);
    await stroke([1, 250], [319, 250]);
    assert.equal(await percent(), wide);
    await screenshot('cortador-azul-largo');
    await finish('grass');
    assert.equal((await saved()).economy.seeds, 25);
    assert.equal((await saved()).economy.xp, 150);
    await button('Voltar à trilha').click();
    await stage('Lavar objetos');
    await finish('wash');
    await button('Continuar trilha').click();
    await finish('paint');
    assert.equal((await saved()).economy.seeds, 65);
    await button('Visitar loja').click();
    await buy('Vaso de flores', 60);
    await button('Usar no jardim').click();
    await button('Colocar Vaso de flores').click();
    await expect.poll(async () => (await saved()).economy.seeds).toBe(15);
    await button('Posição Fundo direito').click();
    await button('Colocar Vaso de flores').click();
    await expect
      .poll(async () => (await saved()).economy.garden['back-right'])
      .toBe('garden-pot');
    assert.equal((await saved()).economy.garden['back-left'], null);
    await button('Remover desta posição').click();
    await button('Posição Entrada').click();
    await button('Colocar Vaso de flores').click();
    await expect
      .poll(async () => (await saved()).economy.garden.entrance)
      .toBe('garden-pot');
    assert.equal((await saved()).economy.seeds, 15);
    await screenshot('jardim-decorado');
    await button('Visitar loja').click();
    await button('Ver Fonte').click();
    await expect(
      page.getByText('Saldo insuficiente. Faltam 235 sementes.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(button('Confirmar compra · 250 sementes')).toBeDisabled();
    await screenshot('saldo-insuficiente');
    await backFromShop();
    await button('Inventário').click();
    await button('Usar cortador padrão').click();
    await expect(button('Cortador padrão em uso')).toBeDisabled();
    assert.equal(
      (await saved()).economy.equipped.grassAppearance,
      'mower-blue',
    );
    await button('Usar aparência padrão').click();
    await expect(button('Aparência padrão em uso')).toBeDisabled();
    await button('Ferramentas').click();
    await expect(button('Ver Cortador azul')).toHaveCount(0);
    await button('Ver Cortador largo').click();
    await button('Equipar item').click();
    await button('Voltar aos itens').click();
    await button('Visuais').click();
    await button('Ver Cortador azul').click();
    await button('Equipar item').click();
    await backFromShop();
    await button('Conquistas').click();
    await screenshot('conquistas');
    await button('Voltar à trilha').click();
    // Ganhar sementes jogando para testar também uma compra que falha na gravação.
    await stage('Tapete de flores');
    await finish('flowers');
    await button('Continuar trilha').click();
    await finish('stones');
    assert.equal((await saved()).economy.seeds, 55);
    await button('Visitar loja').click();
    await button('Ver Cortador coral').click();
    await failWrites(true);
    await button('Confirmar compra · 40 sementes').click();
    await expect(
      page.getByText(
        'Não foi possível salvar. A alteração não foi confirmada. Tente novamente antes de sair.',
        { exact: true },
      ),
    ).toBeVisible();
    assert.equal((await saved()).economy.seeds, 55);
    assert.ok(!(await saved()).economy.ownedItemIds.includes('mower-coral'));
    await failWrites(false);
    await button('Confirmar compra · 40 sementes').click();
    await expect(
      page.getByText('Compra salva. O item agora é seu.', { exact: true }),
    ).toBeVisible();
    assert.equal((await saved()).economy.seeds, 15);
    await backFromShop();
    const snapshot = await saved();
    await page.reload({ waitUntil: 'networkidle' });
    assert.deepEqual(await saved(), snapshot);
    await button('Meu jardim').click();
    await screenshot('jardim-reaberto');
    await button('Voltar à trilha').click();
    await button('Cortar grama. Concluída, repetir').click();
    await expect(page.getByTestId('grass-loadout')).toHaveText(
      'Cortador largo · azul',
    );
    await button('‹  Voltar').click();
    assert.deepEqual(errors, []);
    const result = {
      browser: browser.version(),
      platform: 'macOS / Chrome headless; mouse',
      nativeDevices: [],
      standardCoverage: standard,
      wideCoverage: wide,
      seeds: snapshot.economy.seeds,
      xp: snapshot.economy.xp,
      checks:
        'recompensas compostas, falha/retry, compras, equipamento real, jardim, conquistas, recarga',
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
    console.error((await page.locator('body').innerText()).slice(0, 6000));
    throw error;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
