// const feeSer = require('../../servicesLayer/feeSer');

// (async () => {
//   // Delivery type, Pickup zone, Drop-off zone, 1 extra stop
//   // Car (2), Changi Cargo (8) → Tuas (7), 1 extra stop
//   console.log(await feeSer.calculateTotalFee(2, 8, 7, 1));
//   process.exit();
// })();


// This test with the collection back the item
const feeSer = require('../../servicesLayer/feeSer');

(async () => {
  const carNo = await feeSer.calculateTotalFee({
    deliveryTypeId: 2, pickupZoneId: 1, dropoffZoneId: 2,
    pickupTime: '2026-10-16T23:00', collectBack: false,
  });

  const carYes = await feeSer.calculateTotalFee({
    deliveryTypeId: 2, pickupZoneId: 1, dropoffZoneId: 2,
    pickupTime: '2026-10-16T23:00', collectBack: true,
  });

  const fourCar = await feeSer.calculateTotalFee({
    deliveryTypeId: 5, pickupZoneId: 1, dropoffZoneId: 2,
    pickupTime: '2026-10-16T23:00', collectBack: true,
  });

  console.log('Car, no collect:    ', carNo.total_fee, carNo.collect_back_fee);
  console.log('Car, collect:       ', carYes.total_fee, carYes.collect_back_fee);
  console.log('4-Hour Car, collect:', fourCar.total_fee, fourCar.collect_back_fee);
  process.exit();
})();