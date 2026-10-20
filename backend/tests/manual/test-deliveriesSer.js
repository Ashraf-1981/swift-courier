const deliveriesSer = require('../../servicesLayer/deliveriesSer');

const goodForm = {
    deliveryTypeId: 1, pickupZoneId: 1, dropoffZoneId: 2,
    pickupAddress: '10 Test Road', pickupContactName: 'Siti', pickupContactPhone: '98887777',
    dropoffAddress: '20 Test Street', dropoffContactName: 'Ahmad', dropoffContactPhone: '91110000',
    weightKg: 5, lengthCm: 30, widthCm: 20, heightCm: 10,
    scheduledPickupAt: '2026-10-20T10:00',
    paymentMethod: 'cod',
};

function tryIt(label, form) {
    try {
        deliveriesSer.validateBooking(form);
        console.log(label, '→ Form OK');
    } catch (err) {
        console.log(label, '→ Error:', err.message);
    }
}

tryIt('1. good form    ', goodForm);
tryIt('2. no drop-off  ', { ...goodForm, dropoffAddress: '' });
tryIt('3. paypal       ', { ...goodForm, paymentMethod: 'paypal' });
tryIt('4. past time    ', { ...goodForm, scheduledPickupAt: '2026-10-01T10:00' });
tryIt('5. not a date   ', { ...goodForm, scheduledPickupAt: 'tomorrow' });
tryIt('5b. 6 stops     ', { ...goodForm, extraStops: 6 });
tryIt('5c. 5 stops     ', { ...goodForm, extraStops: 5 });

console.log('--- options ---');
console.log('6. online + doorstep →', deliveriesSer.applyOptions({ ...goodForm, paymentMethod: 'paynow', allowDoorstep: true }));
console.log('7. COD + doorstep    →', deliveriesSer.applyOptions({ ...goodForm, allowDoorstep: true }));
console.log('8. collect + note    →', deliveriesSer.applyOptions({ ...goodForm, collectBack: true, collectBackNote: 'Old printer' }));

try {
    deliveriesSer.applyOptions({ ...goodForm, collectBack: true });
} catch (err) {
    console.log('9. collect, no note  → Error:', err.message);
}

(async () => {
    console.log('--- price ---');

    // 10. 5 kg on a Bike: fits, stays Bike
    const r10 = await deliveriesSer.priceBooking(goodForm, deliveriesSer.applyOptions(goodForm));
    console.log('10. vehicle →', r10.vehicle);
    console.log('10. fee     →', r10.fee);

    // 11. 15 kg on a Bike: too heavy, upgraded
    const heavy = { ...goodForm, weightKg: 15 };
    const r11 = await deliveriesSer.priceBooking(heavy, deliveriesSer.applyOptions(heavy));
    console.log('11. vehicle →', r11.vehicle);
    console.log('11. fee     →', r11.fee);

    console.log('--- tracking ---');
    console.log('12.', deliveriesSer.makeTrackingNo());
    console.log('12.', deliveriesSer.makeTrackingNo());
    console.log('12.', deliveriesSer.makeTrackingNo());

    console.log('--- deadline (pickup 20 Oct, 10:00 am) ---');
    for (const id of [1, 2, 3, 4, 5, 6]) {
        console.log('13. type', id, '→', await deliveriesSer.makeDeadline(id, '2026-10-20T10:00'));
    }

    process.exit();
})();