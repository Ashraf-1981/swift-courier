const feeSer = require('./feeSer');
const vehicleSer = require('./vehicleSer');
const deliveryTypesDat = require('../dataLayer/deliveryTypesDat');
const deliveriesDat = require('../dataLayer/deliveriesDat');
const deliveryPaymentsDat = require('../dataLayer/deliveryPaymentsDat');

const REQUIRED = [
  'deliveryTypeId', 'pickupZoneId', 'dropoffZoneId',
  'pickupAddress', 'pickupContactName', 'pickupContactPhone',
  'dropoffAddress', 'dropoffContactName', 'dropoffContactPhone',
  'weightKg', 'lengthCm', 'widthCm', 'heightCm',
  'scheduledPickupAt', 'paymentMethod',
];

const PAYMENT_METHODS = ['cod', 'paynow', 'credit_card'];

/**
 * Business rules: check the booking form
 * 1. All required fields must be filled
 * 2. Payment method must be cod, paynow or credit_card
 * 3. Pickup time must be a real date, and not in the past
 * 4. Maximum 5 extra stops
 */
function validateBooking(form) {
  for (const field of REQUIRED) {
    if (!form[field]) {
      throw new Error(`${field} is required`);
    }
  }

  if (!PAYMENT_METHODS.includes(form.paymentMethod)) {
    throw new Error('Payment method must be cod, paynow or credit_card');
  }

  if (Number(form.extraStops || 0) > 5) {
    throw new Error('Maximum 5 extra stops');
  }

  const pickup = new Date(form.scheduledPickupAt);
  if (isNaN(pickup)) {
    throw new Error('Pickup time is not a valid date');
  }
  if (pickup < new Date()) {
    throw new Error('Pickup time cannot be in the past');
  }
}

/**
 * Business rules: booking options
 * 1. COD blocks doorstep: the receiver must be there to pay, so allow_doorstep is forced off
 * 2. Collect-back needs a note saying what to collect
 * 3. Collect-back starts as 'pending'; not requested → 'not_requested'
 */
function applyOptions(form) {
  const isCod = form.paymentMethod === 'cod';
  const allowDoorstep = form.allowDoorstep === true && !isCod;
  const collectBack = form.collectBack === true;

  if (collectBack && !form.collectBackNote) {
    throw new Error('Please describe the item to collect back');
  }

  return {
    allowDoorstep,
    collectBack,
    collectBackStatus: collectBack ? 'pending' : 'not_requested',
    collectBackNote: collectBack ? form.collectBackNote : null,
  };
}

/**
 * Business rules: price the booking
 * 1. Vehicle first: the parcel's weight and size decide the vehicle (may upgrade, e.g. Bike → Car)
 * 2. Then the fee for THAT vehicle, not the one Siti picked
 * 3. The price is always worked out here on the server, never taken from the form
 * 4. Collect-back fee only if the options rule allowed it
 */
async function priceBooking(form, options) {
  const vehicle = await vehicleSer.suggestVehicle({
    deliveryTypeId: Number(form.deliveryTypeId),
    weightKg: Number(form.weightKg),
    lengthCm: Number(form.lengthCm),
    widthCm: Number(form.widthCm),
    heightCm: Number(form.heightCm),
  });

  const fee = await feeSer.calculateTotalFee({
    deliveryTypeId: vehicle.suggested_id,
    pickupZoneId: Number(form.pickupZoneId),
    dropoffZoneId: Number(form.dropoffZoneId),
    extraStops: Number(form.extraStops || 0),
    pickupTime: form.scheduledPickupAt,
    collectBack: options.collectBack,
  });

  return { vehicle, fee };
}

/**
 * Business rules: tracking number
 * 1. Format SC-YYYYMMDD-XXXXX: today's date (Singapore time) + 5 random letters/digits
 * 2. Capital letters and digits only, easy to read out on the phone
 * 3. tracking_no is UNIQUE in the database, so a rare duplicate is blocked there
 */
function makeTrackingNo() {
  const date = new Date()
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' }) // '2026-10-16'
    .replaceAll('-', '');                                         // '20261016'

  const random = Math.random().toString(36).slice(2, 7).toUpperCase(); // e.g. 'K7Q2M'

  return `SC-${date}-${random}`;
}

/**
 * Business rules: deadline
 * 1. Only types with delivery_window_hours (the 4-Hour types) get a deadline
 * 2. Deadline = scheduled pickup time + that many hours
 * 3. Uses the FINAL vehicle (after any upgrade), so a 4-Hour Car still gets 4 hours
 */
async function makeDeadline(deliveryTypeId, scheduledPickupAt) {
  const type = await deliveryTypesDat.getDeliveryTypeById(deliveryTypeId);

  if (!type.delivery_window_hours) {
    return null; // normal type: no deadline
  }

  const pickup = new Date(scheduledPickupAt);
  const hoursInMs = type.delivery_window_hours * 60 * 60 * 1000;
  return new Date(pickup.getTime() + hoursInMs);
}

/**
 * Create a delivery for the logged-in customer.
 * Runs the 5 rules in order, then saves the delivery and its payment row.
 */
async function createDelivery(customerId, form) {
  validateBooking(form);                                         // 1. check form
  const options = applyOptions(form);                            // 2. doorstep + collect-back
  const { vehicle, fee } = await priceBooking(form, options);    // 3. vehicle + price
  const trackingNo = makeTrackingNo();                           // 4. tracking no
  const deadline = await makeDeadline(vehicle.suggested_id, form.scheduledPickupAt); // 5. deadline

  const deliveryId = await deliveriesDat.createDelivery({
    tracking_no: trackingNo,
    customer_id: customerId,
    delivery_type_id: vehicle.suggested_id,
    pickup_zone_id: Number(form.pickupZoneId),
    dropoff_zone_id: Number(form.dropoffZoneId),
    pickup_address: form.pickupAddress,
    pickup_contact_name: form.pickupContactName,
    pickup_contact_phone: form.pickupContactPhone,
    dropoff_address: form.dropoffAddress,
    dropoff_contact_name: form.dropoffContactName,
    dropoff_contact_phone: form.dropoffContactPhone,
    instructions: form.instructions || null,
    allow_doorstep: options.allowDoorstep,
    collect_back: options.collectBack,
    collect_back_note: options.collectBackNote,
    collect_back_fee: fee.collect_back_fee,
    collect_back_status: options.collectBackStatus,
    weight_kg: Number(form.weightKg),
    length_cm: Number(form.lengthCm),
    width_cm: Number(form.widthCm),
    height_cm: Number(form.heightCm),
    extra_stops: Number(form.extraStops || 0),
    distance_km: fee.distance_km,
    base_fee: fee.base_fee,
    distance_fee: fee.distance_fee,
    stops_fee: fee.stops_fee,
    surcharge_total: fee.surcharge_total,
    total_fee: fee.total_fee,
    scheduled_pickup_at: new Date(form.scheduledPickupAt),
    deadline_at: deadline,
  });

  await deliveryPaymentsDat.createPayment({
    delivery_id: deliveryId,
    method: form.paymentMethod,
    amount: fee.total_fee, // collect-back fee NOT included, charged only after collection
  });

  return deliveriesDat.getDeliveryById(deliveryId);
}

/**
 * Business rules: my deliveries
 * 1. A customer only sees her own deliveries (id from the token, never the URL)
 * 2. Newest first
 */
async function getMyDeliveries(customerId) {
  return deliveriesDat.getDeliveriesByCustomer(customerId);
}

/**
 * Business rules: one delivery for the customer
 * 1. Only her own; someone else's answers "not found" (don't reveal it exists)
 * 2. Courier name shows once assigned
 * 3. Courier phone shows only while out for delivery
 */
async function getMyDeliveryById(customerId, deliveryId) {
  const d = await deliveriesDat.getDeliveryDetail(deliveryId);

  if (!d || d.customer_id !== customerId) {
    throw new Error('Delivery not found');
  }

  if (d.status !== 'out_for_delivery') {
    d.courier_phone = null;
  }

  return d;
}

module.exports = { validateBooking, applyOptions, priceBooking, makeTrackingNo, makeDeadline, createDelivery, getMyDeliveries, getMyDeliveryById };