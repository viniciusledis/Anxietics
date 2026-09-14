// Inspeção do catálogo com saldo de fixture. O teste verify-economy ganha seu saldo jogando.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
(async () => {
  const output = join(tmpdir(), 'anxietics-catalog');
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const button = (name) => page.getByRole('button', { name, exact: true });
  const saved = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem('@anxietics/progress/v1')),
    );
  try {
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:8081', {
      waitUntil: 'networkidle',
      timeout: 180000,
    });
    await expect(button('Loja')).toBeVisible({ timeout: 120000 });
    // Fixture exclusiva deste perfil temporário para inspecionar todos os itens, sem espera por dias.
    await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem('@anxietics/progress/v1'));
      p.economy.seeds = 1000;
      localStorage.setItem('@anxietics/progress/v1', JSON.stringify(p));
    });
    await page.reload({ waitUntil: 'networkidle' });
    const items = [
      ['Cortador azul', 30],
      ['Cortador coral', 40],
      ['Cortador largo', 150],
      ['Vaso de flores', 60, 'Fundo esquerdo'],
      ['Pedras decorativas', 80, 'Fundo direito'],
      ['Banco', 100, 'Lado esquerdo'],
      ['Árvore ornamental', 150, 'Lado direito'],
      ['Fonte', 250, 'Entrada'],
    ];
    for (let index = 0; index < items.length; index++) {
      const [name, price, slot] = items[index];
      await button('Loja').click();
      await button(`Ver ${name}`).click();
      await page.screenshot({ path: join(output, `item-${index}.png`) });
      await button(`Confirmar compra · ${price} sementes`).click();
      await expect(
        page.getByText('Compra salva. O item agora é seu.', { exact: true }),
      ).toBeVisible();
      if (slot) {
        await button('Usar no jardim').click();
        await button(`Posição ${slot}`).click();
        await button(`Colocar ${name}`).click();
        await expect(
          page.getByText(new RegExp(`^Atual: ${name}$`)),
        ).toBeVisible();
        await button('Voltar à trilha').click();
      } else {
        await button('Equipar item').click();
        await expect(
          page.getByText('Item equipado e salvo.', { exact: true }),
        ).toBeVisible();
        await button('Voltar aos itens').click();
        await button('Voltar à trilha').click();
      }
    }
    const before = await saved();
    assert.equal(before.economy.ownedItemIds.length, 8);
    assert.equal(before.economy.seeds, 150);
    assert.equal(before.economy.xp, 0);
    assert.equal(new Set(Object.values(before.economy.garden)).size, 5);
    await page.reload({ waitUntil: 'networkidle' });
    assert.deepEqual(await saved(), before);
    await button('Meu jardim').click();
    await page.screenshot({ path: join(output, 'jardim-completo.png') });
    await page.setViewportSize({ width: 320, height: 568 });
    for (const [, , slot] of items.filter((i) => i[2])) {
      await button(`Posição ${slot}`).scrollIntoViewIfNeeded();
      const box = await button(`Posição ${slot}`).boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= 320 && box.height >= 44);
    }
    await page
      .getByText('Meu jardim', { exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(output, 'jardim-320.png') });
    assert.deepEqual(errors, []);
    writeFileSync(
      join(output, 'resultado.json'),
      JSON.stringify(
        {
          browser: browser.version(),
          fixtureSeeds: 1000,
          items: 8,
          decorations: 5,
          viewports: ['390x844', '320x568'],
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      `Catálogo aprovado: oito compras/efeitos, cinco decorações únicas e recarga; saldo de fixture identificado. Capturas: ${output}`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
