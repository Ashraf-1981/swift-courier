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

module.exports = { validateBooking };