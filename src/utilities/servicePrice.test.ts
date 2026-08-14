import { describe, expect, it } from 'vitest';

import { getServicePrice } from './servicePrice';

describe('getServicePrice', () => {
  it('returns 0 for free services', () => {
    expect(getServicePrice({ paidService: false, price: 50 })).toBe(0);
    expect(getServicePrice({ paidService: true, price: 0 })).toBe(0);
    expect(getServicePrice({})).toBe(0);
  });

  it('returns the flat price for fixed pricing (and by default)', () => {
    expect(getServicePrice({ paidService: true, price: 80, pricingType: 'fixed' })).toBe(80);
    expect(getServicePrice({ duration: 90, paidService: true, price: 80 })).toBe(80);
  });

  it('prorates hourly pricing over the duration', () => {
    expect(
      getServicePrice({ duration: 90, paidService: true, price: 60, pricingType: 'hourly' }),
    ).toBe(90);
    expect(
      getServicePrice({ duration: 30, paidService: true, price: 60, pricingType: 'hourly' }),
    ).toBe(30);
    expect(
      getServicePrice({ duration: 45, paidService: true, price: 50, pricingType: 'hourly' }),
    ).toBe(37.5);
  });

  it('rounds hourly prices to 2 decimal places', () => {
    expect(
      getServicePrice({ duration: 20, paidService: true, price: 50, pricingType: 'hourly' }),
    ).toBe(16.67);
  });

  it('charges nothing for hourly services with no duration', () => {
    expect(getServicePrice({ paidService: true, price: 60, pricingType: 'hourly' })).toBe(0);
  });
});
