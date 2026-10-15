// const feeSer = require('./servicesLayer/feeSer');

// (async () => {
//   // Delivery type, Pickup zone, Drop-off zone, 1 extra stop
//   // Car (2), Changi Cargo (8) → Tuas (7), 1 extra stop
//   console.log(await feeSer.calculateTotalFee(2, 8, 7, 1));
//   process.exit();
// })();

const feeSer = require('./servicesLayer/feeSer');

(async () => {
  const peak = await feeSer.calculateTotalFee(2, 1, 2, 0, '2026-10-16T08:30');    // Friday 8:30am
  const night = await feeSer.calculateTotalFee(2, 1, 2, 0, '2026-10-16T23:00');   // Friday 11pm
  const sunday = await feeSer.calculateTotalFee(2, 1, 2, 0, '2026-10-18T08:30');  // Sunday 8:30am

  console.log('Friday 8:30am:', peak.surcharge_total, peak.total_fee);
  console.log('Friday 11pm:  ', night.surcharge_total, night.total_fee);
  console.log('Sunday 8:30am:', sunday.surcharge_total, sunday.total_fee);
  process.exit();
})();