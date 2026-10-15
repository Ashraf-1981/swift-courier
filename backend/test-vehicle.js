// These test with weight

// const vehicleSer = require('./servicesLayer/vehicleSer');

// (async () => {
//   // Bike, small parcel → fits
//   console.log(await vehicleSer.suggestVehicle({ deliveryTypeId: 1, weightKg: 5, lengthCm: 30, widthCm: 20, heightCm: 10 }));

//   // Bike, 15 kg → too heavy → Car
//   console.log(await vehicleSer.suggestVehicle({ deliveryTypeId: 1, weightKg: 15, lengthCm: 30, widthCm: 20, heightCm: 10 }));

//   // Car, 150 kg → too heavy → Van
//   console.log(await vehicleSer.suggestVehicle({ deliveryTypeId: 2, weightKg: 150, lengthCm: 80, widthCm: 50, heightCm: 50 }));

//   // 4-Hour Bike, 15 kg → 4-Hour Car (stays fast)
//   console.log(await vehicleSer.suggestVehicle({ deliveryTypeId: 4, weightKg: 15, lengthCm: 30, widthCm: 20, heightCm: 10 }));

//   // Van, 1500 kg → nothing fits
//   try {
//     await vehicleSer.suggestVehicle({ deliveryTypeId: 3, weightKg: 1500, lengthCm: 100, widthCm: 100, heightCm: 100 });
//   } catch (err) {
//     console.log('Error:', err.message);
//   }
//     process.exit();
// })();


// These test with size
const vehicleSer = require('./servicesLayer/vehicleSer');

(async () => {
  // Bike, 40×30×30 → exactly at Bike's limit → stays Bike
  console.log(await vehicleSer.suggestVehicle({ deliveryTypeId: 1, weightKg: 5, lengthCm: 40, widthCm: 30, heightCm: 30 }));

  // Bike, 60 cm long (poster) → too big → Car
  console.log(await vehicleSer.suggestVehicle({ deliveryTypeId: 1, weightKg: 5, lengthCm: 60, widthCm: 20, heightCm: 10 }));

  // Car, 150 cm long (shelf) → too big → Van
  console.log(await vehicleSer.suggestVehicle({ deliveryTypeId: 2, weightKg: 20, lengthCm: 150, widthCm: 50, heightCm: 50 }));

  // Van, 350 cm long → longer than Van's 300 cm → nothing fits
  try {
    await vehicleSer.suggestVehicle({ deliveryTypeId: 3, weightKg: 50, lengthCm: 350, widthCm: 50, heightCm: 50 });
  } catch (err) {
    console.log('Error:', err.message);
  }

  process.exit();
})();