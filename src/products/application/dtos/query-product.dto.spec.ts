import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SearchProductDto } from './query-product.dto';

/** Reproduce lo que hace el ValidationPipe global con los query params (que llegan como strings). */
function validate(query: Record<string, string>) {
  const dto = plainToInstance(SearchProductDto, query);
  return { dto, errors: validateSync(dto).map((error) => error.property) };
}

describe('SearchProductDto', () => {
  it('convierte los números que llegan como texto en la query string', () => {
    const { dto, errors } = validate({ minPrice: '100', maxPrice: '500', limit: '10', offset: '0' });

    expect(errors).toEqual([]);
    expect(dto).toMatchObject({ minPrice: 100, maxPrice: 500, limit: 10, offset: 0 });
  });

  it('acepta una búsqueda sin parámetros', () => {
    expect(validate({}).errors).toEqual([]);
  });

  it.each([
    ['minPrice negativo', { minPrice: '-1' }, 'minPrice'],
    ['limit en cero', { limit: '0' }, 'limit'],
    ['offset negativo', { offset: '-5' }, 'offset'],
    ['precio no numérico', { maxPrice: 'abc' }, 'maxPrice'],
    ['campo de orden desconocido', { sort: 'color' }, 'sort'],
    ['dirección de orden inválida', { order: 'up' }, 'order'],
  ])('rechaza %s', (_, query, property) => {
    expect(validate(query).errors).toContain(property);
  });
});
