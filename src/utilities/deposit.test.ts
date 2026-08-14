import { describe, expect, it } from 'vitest';

import { calculateAmountDue, resolvePaymentStatus } from './deposit';

describe('calculateAmountDue', () => {
  it('charges the full price by default', () => {
    expect(calculateAmountDue(100, {})).toBe(100);
    expect(calculateAmountDue(100, { depositType: 'full' })).toBe(100);
  });

  it('charges a fixed deposit', () => {
    expect(calculateAmountDue(100, { depositType: 'fixed', depositAmount: 25 })).toBe(25);
  });

  it('clamps a fixed deposit larger than the total', () => {
    expect(calculateAmountDue(100, { depositType: 'fixed', depositAmount: 150 })).toBe(100);
  });

  it('charges a percentage deposit', () => {
    expect(calculateAmountDue(200, { depositType: 'percentage', depositAmount: 25 })).toBe(50);
  });

  it('never goes negative', () => {
    expect(calculateAmountDue(100, { depositType: 'fixed', depositAmount: -5 })).toBe(0);
  });
});

describe('resolvePaymentStatus', () => {
  it('is paid once the full price is covered', () => {
    expect(resolvePaymentStatus(100, 25, 100)).toBe('paid');
    expect(resolvePaymentStatus(120, 25, 100)).toBe('paid');
  });

  it('is deposit-paid once the deposit is covered', () => {
    expect(resolvePaymentStatus(25, 25, 100)).toBe('deposit-paid');
    expect(resolvePaymentStatus(50, 25, 100)).toBe('deposit-paid');
  });

  it('is pending before the deposit is covered', () => {
    expect(resolvePaymentStatus(0, 25, 100)).toBe('pending');
    expect(resolvePaymentStatus(10, 25, 100)).toBe('pending');
  });
});
