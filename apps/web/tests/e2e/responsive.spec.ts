import { expect, test } from '@playwright/test';

test('las vistas públicas y de operadores caben en la pantalla', async ({ page }, info) => {
  test.setTimeout(120000);
  const widths = info.project.name === 'mobile' ? [390] : [768, 1440];
  const paths = ['/', '/becas', '/becas/demo-ingenieria-2027', '/operadores', '/operadores/seguimiento',
    '/operadores/editorial/fuentes', '/operadores/editorial/ingesta', '/operadores/editorial/revision'];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1')).toBeVisible();
      const measured = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(measured, path + ' a ' + width + 'px').toBeLessThanOrEqual(width);
    }
  }
});
