const paymentsDat = require('../../dataLayer/deliveryPaymentsDat');

(async () => {
  console.log('Before:', await paymentsDat.getPaymentByDeliveryId(5));
  console.log('Changed:', await paymentsDat.markCodCollected(5, 9));
  console.log('After:', await paymentsDat.getPaymentByDeliveryId(5));
  process.exit();
})();