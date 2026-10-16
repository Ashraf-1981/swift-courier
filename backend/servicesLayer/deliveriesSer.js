const feeSer = require('./feeSer');
const vehicleSer = require('./vehicleSer');

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

module.exports = { validateBooking, applyOptions, priceBooking };