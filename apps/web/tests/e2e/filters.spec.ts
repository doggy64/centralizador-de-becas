import { expect, test } from '@playwright/test';

const filters = [
  ['level', 'DOCTORATE', /Historia/],
  ['area', 'medicina', /Medicina/],
  ['country', 'BO', /Ingeniería/],
  ['modality', 'HYBRID', /Historia/],
  ['coverage', 'UNKNOWN', /Medicina/],
] as const;

for (const [key, value, expected] of filters) {
  test(`filtra por ${key}`, async ({ page }) => {
    await page.goto('/becas');
    const form = page.getByRole('form', { name: 'Filtros de becas' });
    await form.getByRole('combobox', { name: new RegExp(key === 'level' ? 'Nivel académico' : key === 'area' ? 'Área de estudio' : key === 'country' ? 'País de destino' : key === 'modality' ? 'Modalidad' : 'Cobertura') }).selectOption(value);
    await form.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(page).toHaveURL(new RegExp(`${key}=${value}`));
    await expect(page.locator('ul.cards li').getByRole('link', { name: expected })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('1');
  });
}

test('mantiene el texto al filtrar y no desborda a 360 px', async ({ page }, info) => {
  await page.goto('/becas?q=prueba');
  const form = page.getByRole('form', { name: 'Filtros de becas' });
  await form.getByRole('combobox', { name: 'Modalidad' }).selectOption('ONLINE');
  await form.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page).toHaveURL(/q=prueba&modality=ONLINE$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('filtros.png'), fullPage: true });
});
