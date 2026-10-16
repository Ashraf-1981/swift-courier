const pool = require('./db');
const deliveriesSer = require('./servicesLayer/deliveriesSer');

(async () => {
  const d = await deliveriesSer.createDelivery(3, {
    deliveryTypeId: 1, pickupZoneId: 1, dropoffZoneId: 2,
    pickupAddress: '10 Test Road', pickupContactName: 'Siti', pickupContactPhone: '98887777',
    dropoffAddress: '20 Test Street', dropoffContactName: 'Ahmad', dropoffContactPhone: '91110000',
    weightKg: 15, lengthCm: 30, widthCm: 20, heightCm: 10,
    scheduledPickupAt: '2026-10-20T10:00',
    paymentMethod: 'cod',
    allowDoorstep: true,
  });

  console.log(d.tracking_no, '| type', d.delivery_type_id, '| $' + d.total_fee, '| doorstep', d.allow_doorstep, '|', d.status);

  await pool.query('DELETE FROM delivery_payments WHERE delivery_id = ?', [d.id]);
  await pool.query('DELETE FROM deliveries WHERE id = ?', [d.id]);
  console.log('Cleaned up');
  process.exit();
})();