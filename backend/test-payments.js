const pool = require('./db');
const deliveriesDat = require('./dataLayer/deliveriesDat');
const deliveryPaymentsDat = require('./dataLayer/deliveryPaymentsDat');

(async () => {
  const deliveryId = await deliveriesDat.createDelivery({
    tracking_no: 'TEST0002', customer_id: 3, delivery_type_id: 1,
    pickup_zone_id: 1, dropoff_zone_id: 2,
    pickup_address: '10 Test Road', pickup_contact_name: 'Siti', pickup_contact_phone: '98887777',
    dropoff_address: '20 Test Street', dropoff_contact_name: 'Ahmad', dropoff_contact_phone: '91110000',
    weight_kg: 5, length_cm: 30, width_cm: 20, height_cm: 10,
    distance_km: 3.1, base_fee: 8, distance_fee: 2.48, stops_fee: 0, surcharge_total: 0, total_fee: 10.48,
    scheduled_pickup_at: new Date('2026-10-20T10:00'),
  });
  console.log('Delivery id:', deliveryId);

  const paymentId = await deliveryPaymentsDat.createPayment({
    delivery_id: deliveryId,
    method: 'cod',
    amount: 10.48,
  });
  console.log('Payment id:', paymentId);

  const p = await deliveryPaymentsDat.getPaymentByDeliveryId(deliveryId);
  console.log(p.method, p.amount, p.status, p.return_status);

  // clean up: payment first, because it points to the delivery
  await pool.query('DELETE FROM delivery_payments WHERE delivery_id = ?', [deliveryId]);
  await pool.query('DELETE FROM deliveries WHERE id = ?', [deliveryId]);
  console.log('Cleaned up');

  process.exit();
})();