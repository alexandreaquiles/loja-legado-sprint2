import { describe, it, expect } from 'vitest';
import { freteGratis } from '../src/plugins/cupons';
import { frete } from '../src/misc/preco';

describe('frete grátis', () => {
  it('zera o frete com o cupom', async () => {
    const r = await freteGratis.execute({} as any, { price: 1000, priceWithTax: 1000 } as any, { code: 'T1' } as any, [], {} as any, {} as any);
    expect(r).toBe(-1000);
  });

  it('frete() também dá frete grátis com FRETEGRATIS', () => {
    expect(frete(15000, 'FRETEGRATIS')).toBe(0);
  });
});
