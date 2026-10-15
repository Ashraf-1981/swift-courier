const feeSer = require('./servicesLayer/feeSer');

(async () => {
  // Delivery type, Pickup zone, Drop-off zone, 1 extra stop
  // Car (2), Changi Cargo (8) → Tuas (7), 1 extra stop
  console.log(await feeSer.calculateTotalFee(2, 8, 7, 1));
  process.exit();
})();