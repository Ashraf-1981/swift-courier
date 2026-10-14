const dat = require('./dataLayer/deliveryTypesDat');

(async () => {
  console.log(await dat.getAllDeliveryTypes());
  process.exit();
})();