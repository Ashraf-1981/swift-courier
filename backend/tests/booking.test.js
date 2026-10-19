const { validateBooking, applyOptions, makeTrackingNo } = require('../servicesLayer/deliveriesSer');

// a valid form; each test changes one thing. Mon 4 Jan 2027 10am (always in the future)
const GOOD = {
    deliveryTypeId: 1, pickupZoneId: 1, dropoffZoneId: 2,
    pickupAddress: '10 Test Road', pickupContactName: 'Siti', pickupContactPhone: '98887777',
    dropoffAddress: '20 Test Street', dropoffContactName: 'Ahmad', dropoffContactPhone: '91110000',
    weightKg: 2, lengthCm: 30, widthCm: 20, heightCm: 10,
    scheduledPickupAt: new Date(2027, 0, 4, 10, 0), paymentMethod: 'paynow',
};

describe('validateBooking', () => {
    test('valid form passes', () => {
        expect(() => validateBooking(GOOD)).not.toThrow();
    });
    test('missing field', () => {
        expect(() => validateBooking({ ...GOOD, pickupAddress: '' })).toThrow('pickupAddress is required');
    });
    test('unknown payment method', () => {
        expect(() => validateBooking({ ...GOOD, paymentMethod: 'bitcoin' })).toThrow('Payment method');
    });
    test('more than 5 extra stops', () => {
        expect(() => validateBooking({ ...GOOD, extraStops: 6 })).toThrow('Maximum 5 extra stops');
    });
    test('pickup in the past', () => {
        expect(() => validateBooking({ ...GOOD, scheduledPickupAt: new Date(2020, 0, 6, 10, 0) })).toThrow('past');
    });
    test('weekend pickup', () => {
        expect(() => validateBooking({ ...GOOD, scheduledPickupAt: new Date(2027, 0, 2, 10, 0) })).toThrow('weekdays');
    });
    test('before 8:30am', () => {
        expect(() => validateBooking({ ...GOOD, scheduledPickupAt: new Date(2027, 0, 4, 8, 0) })).toThrow('8:30am');
    });
    test('4-Hour after 1pm', () => {
        expect(() => validateBooking({ ...GOOD, deliveryTypeId: 4, scheduledPickupAt: new Date(2027, 0, 4, 14, 0) }))
            .toThrow('4-Hour pickups close at 1pm');
    });
});

describe('applyOptions', () => {
    test('COD forces doorstep off', () => {
        const o = applyOptions({ paymentMethod: 'cod', allowDoorstep: true });
        expect(o.allowDoorstep).toBe(false);
    });
    test('PayNow keeps doorstep on', () => {
        const o = applyOptions({ paymentMethod: 'paynow', allowDoorstep: true });
        expect(o.allowDoorstep).toBe(true);
    });
    test('collect back needs a note', () => {
        expect(() => applyOptions({ paymentMethod: 'paynow', collectBack: true })).toThrow('describe the item');
    });
    test('collect back with note → pending', () => {
        const o = applyOptions({ paymentMethod: 'paynow', collectBack: true, collectBackNote: 'Signed form' });
        expect(o.collectBackStatus).toBe('pending');
    });
});

describe('makeTrackingNo', () => {
    test('format SC-YYYYMMDD-XXXXX', () => {
        expect(makeTrackingNo()).toMatch(/^SC-\d{8}-[A-Z0-9]{5}$/);
    });
});