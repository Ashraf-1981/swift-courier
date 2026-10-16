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

module.exports = { validateBooking, applyOptions };