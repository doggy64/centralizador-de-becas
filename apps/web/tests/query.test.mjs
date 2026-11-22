import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeFilters } from '../src/lib/api/query.ts';
import { uniqueScholarshipEditions } from '../src/lib/unique-scholarship-editions.ts';

test('conserva acentos y caracteres reservados sin introducir nuevos parámetros', () => {
  const query = encodeFilters({ q: ' Ingeniería & salud ', page: '2', ignored: 'valor' });
  assert.deepEqual(Object.fromEntries(new URLSearchParams(query)), { q: 'Ingeniería & salud', page: '2' });
});

test('usa el primer término de búsqueda y omite parámetros vacíos', () => {
  assert.equal(encodeFilters({ q: ['medicina', 'arte'], area: '   ' }), 'q=medicina');
  assert.equal(encodeFilters({}), '');
});

test('renderiza una tarjeta por edición sin ocultar ediciones distintas', () => {
  const unique = uniqueScholarshipEditions([
    { slug: 'programa-2027', id: 'a' },
    { slug: 'programa-2027', id: 'b' },
    { slug: 'programa-2028', id: 'c' }
  ]);

  assert.deepEqual(unique.map(item => item.id), ['a', 'c']);
});
