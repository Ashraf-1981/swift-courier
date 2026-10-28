const deliveriesDat = require('../dataLayer/deliveriesDat');
const deliveryPaymentsDat = require('../dataLayer/deliveryPaymentsDat');

/**
 * Business rules: customer pays for a delivery (simulated, no Stripe)
 * 1. Only her own delivery
 * 2. COD can't be paid online (receiver pays the courier in cash)
 * 3. Can't pay twice
 */
async function payDelivery(customerId, deliveryId) {
  const d = await deliveriesDat.getDeliveryDetail(deliveryId);

  if (!d || d.customer_id !== customerId) {
    throw new Error('Delivery not found');
  }
  if (d.payment_method === 'cod') {
    throw new Error('Cash on delivery is paid to the courier');
  }
  /* 4. Can't pay a cancelled order*/
  if (d.status === 'cancelled') {
    throw new Error('This order is cancelled');
  }
  if (d.payment_status === 'paid') {
    throw new Error('This delivery is already paid');
  }

  await deliveryPaymentsDat.markPaid(deliveryId);
  return { message: 'Payment successful', deliveryId };
}

const RETURN_METHODS = ['cash', 'paynow', 'credit_card'];

/**
 * Business rules: sender pays the return fee (simulated)
 * 1. Only her own delivery
 * 2. Only after the parcel is back (status 'returned')
 * 3. Any method she picks: cash, paynow or credit_card
 * 4. Can't pay twice
 */
async function payReturnFee(customerId, deliveryId, method) {
  const d = await deliveriesDat.getDeliveryDetail(deliveryId);

  if (!d || d.customer_id !== customerId) {
    throw new Error('Delivery not found');
  }
  if (d.status !== 'returned') {
    throw new Error('Return fee can only be paid after the return is complete');
  }
  if (!RETURN_METHODS.includes(method)) {
    throw new Error('Payment method must be cash, paynow or credit_card');
  }

  const changed = await deliveryPaymentsDat.markReturnPaid(deliveryId, method);
  if (changed === 0) {
    throw new Error('Return fee is already paid');
  }
  return { message: 'Return fee paid', deliveryId, method };
}

module.exports = { payDelivery, payReturnFee };