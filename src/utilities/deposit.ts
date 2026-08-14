export type DepositConfig = {
  depositAmount?: number | null;
  depositType?: 'full' | 'fixed' | 'percentage' | null;
};

/**
 * Amount that must be paid at booking time for a given total price.
 * Clamped to [0, totalPrice].
 */
export const calculateAmountDue = (totalPrice: number, deposit: DepositConfig): number => {
  const depositType = deposit.depositType || 'full';
  const depositAmount = deposit.depositAmount || 0;

  let amountDue: number;

  switch (depositType) {
    case 'fixed':
      amountDue = depositAmount;
      break;
    case 'percentage':
      amountDue = (totalPrice * depositAmount) / 100;
      break;
    default:
      amountDue = totalPrice;
  }

  return Math.min(Math.max(amountDue, 0), totalPrice);
};

/**
 * Payment status after a successful payment of `amountPaid` (cumulative)
 * against a booking with `amountDue` (due now) and `totalPrice` (full price).
 */
export const resolvePaymentStatus = (
  amountPaid: number,
  amountDue: number,
  totalPrice: number,
): 'deposit-paid' | 'paid' | 'pending' => {
  if (amountPaid >= totalPrice && totalPrice > 0) {
    return 'paid';
  }
  if (amountPaid >= amountDue && amountPaid > 0) {
    return 'deposit-paid';
  }
  return 'pending';
};
