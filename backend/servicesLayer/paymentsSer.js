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
  if (d.payment_status === 'paid') {
    throw new Error('This delivery is already paid');
  }

  await deliveryPaymentsDat.markPaid(deliveryId);
  return { message: 'Payment successful', deliveryId };
}

module.exports = { payDelivery };