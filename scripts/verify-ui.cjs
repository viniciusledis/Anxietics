// Visual and interaction checks with local, disposable data. No real API calls.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { authenticatePreview } = require('./preview-fixture.cjs');
const url = process.env.PREVIEW_URL || 'http://localhost:8081';
const output = process.env.UI_OUTPUT || join(tmpdir(), 'anxietics-ui');
(async () => {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [],
    captures = [];
  async function capture(page, name) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const width = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(width.content <= width.viewport, `${name}: horizontal overflow`);
    await page.screenshot({ path: join(output, `${name}.png`) });
    captures.push(name);
  }
  const trackErrors = (page) =>
    page.on('pageerror', (e) => errors.push(e.message));
  try {
    for (const size of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
    ]) {
      const page = await browser.newPage({ viewport: size });
      trackErrors(page);
      await authenticatePreview(page);
      const button = (name) => page.getByRole('button', { name, exact: true });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 180000 });
      await expect(button('Loja')).toBeVisible({ timeout: 120000 });
      await capture(page, `${size.width}-home`);
      await expect(button('Cortar grama. Disponível')).toBeEnabled();
      await expect(button('Janela embaçada. Bloqueada')).toBeDisabled();
      for (const tab of ['Hoje', 'Livre']) {
        await page.getByRole('tab', { name: tab, exact: true }).click();
        await capture(page, `${size.width}-${tab.toLowerCase()}`);
      }
      await page.getByRole('tab', { name: 'Trilha', exact: true }).click();
      for (const [label, name] of [
        ['Loja', 'loja'],
        ['Inventário', 'inventario'],
        ['Meu jardim', 'jardim'],
        ['Conquistas', 'conquistas'],
        ['Ajustes', 'ajustes'],
      ]) {
        await button(label).click();
        await capture(page, `${size.width}-${name}`);
        if (label === 'Loja') {
          await button('Ver Fonte').click();
          await expect(
            button('Confirmar compra · 250 sementes'),
          ).toBeDisabled();
          await capture(page, `${size.width}-saldo-insuficiente`);
          await button('Voltar aos itens').click();
        }
        if (label === 'Ajustes') {
          await page.getByRole('switch', { name: 'Menos movimento' }).click();
          await button('Apagar dados deste aparelho').click();
          await expect(button('Cancelar')).toBeVisible();
          await capture(page, `${size.width}-confirmacao`);
          await button('Cancelar').click();
        }
        await button('Voltar à trilha').click();
      }
      await button('Cortar grama. Disponível').click();
      await expect(page.locator('canvas')).toBeVisible();
      await page.waitForTimeout(600);
      await capture(page, `${size.width}-jogo`);
      const gameBox = await page.locator('canvas').boundingBox();
      assert.ok(
        gameBox.width > 200 && gameBox.height > 150,
        'playable field remains visible',
      );
      await button('Pausar').click();
      await capture(page, `${size.width}-pausa`);
      await button('Continuar').click();
      await button('Recomeçar').click();
      await capture(page, `${size.width}-reiniciar`);
      await button('Cancelar').click();
      await button('‹  Voltar').click();
      await page.close();
    }
    const page = await browser.newPage({
      viewport: { width: 320, height: 568 },
    });
    trackErrors(page);
    const button = (name) => page.getByRole('button', { name, exact: true });
    await page.goto(url, { waitUntil: 'networkidle' });
    await expect(button('Entrar')).toBeVisible();
    await capture(page, '320-login');
    await button('Entrar').click();
    await expect(
      page.getByText('Informe seu e-mail.', { exact: true }),
    ).toBeVisible();
    await capture(page, '320-login-erros');
    await button('Ainda não tem conta? Criar conta').click();
    await capture(page, '320-cadastro');
    await button('Criar conta').click();
    await expect(
      page.getByText('Confirme sua senha.', { exact: true }),
    ).toBeVisible();
    await capture(page, '320-cadastro-erros');
    await page
      .getByLabel('Nome', { exact: true })
      .fill('Um nome bastante longo para verificar a digitação e o layout');
    await page
      .getByLabel('E-mail', { exact: true })
      .fill('pessoa.com.email.longo@example.test');
    await page.getByLabel('Senha', { exact: true }).fill('test-password');
    await page
      .getByLabel('Confirmar senha', { exact: true })
      .fill('test-password');
    await page.setViewportSize({ width: 320, height: 360 });
    await page.getByLabel('Confirmar senha', { exact: true }).focus();
    await page
      .getByLabel('Confirmar senha', { exact: true })
      .scrollIntoViewIfNeeded();
    await capture(page, '320-cadastro-area-reduzida');
    await page.setViewportSize({ width: 390, height: 844 });
    await button('Já tenho uma conta').click();
    await page
      .getByLabel('E-mail', { exact: true })
      .fill('pessoa@example.test');
    await page.getByLabel('Senha', { exact: true }).fill('test-password');
    let release;
    const hold = new Promise((resolve) => {
      release = resolve;
    });
    await page.route(
      'http://127.0.0.1:54321/auth/v1/token**',
      async (route) => {
        await hold;
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'invalid_credentials',
            message: 'Invalid login credentials',
          }),
        });
      },
    );
    await button('Entrar').click();
    await expect(button('Entrando…')).toBeDisabled();
    await capture(page, '390-login-loading');
    release();
    await expect(button('Entrar')).toBeEnabled();
    await capture(page, '390-login-falha');
    await page.close();
    assert.deepEqual(errors, []);
    writeFileSync(
      join(output, 'resultado.json'),
      JSON.stringify(
        {
          captures,
          errors,
          viewports: ['320×568', '390×844', '768×1024'],
          nativeDevices: [],
          notes:
            'Área reduzida simula espaço disponível; teclado e safe areas nativos requerem aparelho.',
        },
        null,
        2,
      ),
    );
    console.log(
      `${captures.length} capturas, sem overflow horizontal ou erros de runtime. ${output}`,
    );
  } catch (error) {
    for (const context of browser.contexts())
      for (const page of context.pages()) {
        await page
          .screenshot({ path: join(output, 'falha.png') })
          .catch(() => {});
        console.error((await page.locator('body').innerText()).slice(-3000));
      }
    throw error;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
