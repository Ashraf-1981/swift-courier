const adminSer = require('../../servicesLayer/adminSer');

(async () => {
  // 1. parcels at the warehouse
  const parcels = await adminSer.getWarehouseParcels();
  console.log(parcels);

  // 2. give a parcel to Ahmad (courier 9), done by admin 4
//   try {
//     console.log(await adminSer.assignParcel(4, 5, 9));
//   } catch (err) {
//     console.log('Error:', err.message);
//   }

//   // 3. same parcel again → should fail
//   try {
//     console.log(await adminSer.assignParcel(4, 5, 9));
//   } catch (err) {
//     console.log('Error:', err.message);
//   }

  process.exit();
})();