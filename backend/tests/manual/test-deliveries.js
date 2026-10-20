const deliveriesDat = require('../../dataLayer/deliveriesDat');

(async () => {
  const id = await deliveriesDat.createDelivery({
    tracking_no: 'TEST0001',
    customer_id: 3,          // Siti
    delivery_type_id: 1,
    pickup_zone_id: 1,
    dropoff_zone_id: 2,
    pickup_address: '10 Test Road',
    pickup_contact_name: 'Siti',
    pickup_contact_phone: '98887777',
    dropoff_address: '20 Test Street',
    dropoff_contact_name: 'Ahmad',
    dropoff_contact_phone: '91110000',
    weight_kg: 5,
    length_cm: 30,
    width_cm: 20,
    height_cm: 10,
    distance_km: 12.5,
    base_fee: 10,
    distance_fee: 7.5,
    stops_fee: 0,
    surcharge_total: 0,
    total_fee: 17.5,
    scheduled_pickup_at: new Date('2026-10-17 10:00:00'),
  });
  console.log('New id:', id);

  const d = await deliveriesDat.getDeliveryById(id);
  console.log(d.tracking_no, d.status, d.total_fee, d.allow_doorstep);

  console.log('Not found:', await deliveriesDat.getDeliveryById(9999));

  process.exit();
})();