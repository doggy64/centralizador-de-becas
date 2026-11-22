import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeFilters } from '../src/lib/api/query.ts';

test('conserva acentos y caracteres reservados sin introducir nuevos parámetros', () => {
  const query = encodeFilters({ q: ' Ingeniería & salud ', page: '2', ignored: 'valor' });
  assert.deepEqual(Object.fromEntries(new URLSearchParams(query)), { q: 'Ingeniería & salud', page: '2' });
});

test('usa el primer término de búsqueda y omite parámetros vacíos', () => {
  assert.equal(encodeFilters({ q: ['medicina', 'arte'], area: '   ' }), 'q=medicina');
  assert.equal(encodeFilters({}), '');
});
