jest.mock('../dataLayer/zonesDat');
jest.mock('../dataLayer/deliveryTypesDat');

const zonesDat = require('../dataLayer/zonesDat');
const deliveryTypesDat = require('../dataLayer/deliveryTypesDat');
const feeSer = require('../servicesLayer/feeSer');

// one fake zone: outskirt $3 always, ERP $2 only at peak
const ZONE = { id: 1, center_lat: 1.30, center_lng: 103.85, outskirt_surcharge: '3.00', restricted_surcharge: '0.00', erp_surcharge: '2.00' };
const BIKE = { id: 1, name: 'Bike', is_active: 1, base_fee: '8.00', per_km_rate: '0.50', extra_stop_fee: '3.00', collect_back_fee: '5.00' };

// Mon 19 Oct 2026 and Sat 24 Oct 2026 (month 9 = October)
const MON_10AM = new Date(2026, 9, 19, 10, 0);
const MON_8AM = new Date(2026, 9, 19, 8, 0);
const MON_6PM = new Date(2026, 9, 19, 18, 0);
const SAT_8AM = new Date(2026, 9, 24, 8, 0);

beforeEach(() => {
    zonesDat.getZoneById.mockResolvedValue(ZONE);
    deliveryTypesDat.getDeliveryTypeById.mockResolvedValue(BIKE);
});

describe('surcharge (pickup zone + drop-off zone)', () => {
    test('weekday off-peak: no ERP', async () => {
        expect(await feeSer.calculateSurcharge(1, 1, MON_10AM)).toBe(6);
    });
    test('weekday morning peak: ERP added', async () => {
        expect(await feeSer.calculateSurcharge(1, 1, MON_8AM)).toBe(10);
    });
    test('weekday evening peak: ERP added', async () => {
        expect(await feeSer.calculateSurcharge(1, 1, MON_6PM)).toBe(10);
    });
    test('weekend peak time: no ERP', async () => {
        expect(await feeSer.calculateSurcharge(1, 1, SAT_8AM)).toBe(6);
    });
    test('unknown zone → error', async () => {
        zonesDat.getZoneById.mockResolvedValue(undefined);
        await expect(feeSer.calculateSurcharge(1, 99, MON_10AM)).rejects.toThrow('Zone not found');
    });
});

describe('total fee', () => {
    test('base + stops + surcharge (same zone, 0 km)', async () => {
        const fee = await feeSer.calculateTotalFee({
            deliveryTypeId: 1, pickupZoneId: 1, dropoffZoneId: 1, extraStops: 2, pickupTime: MON_10AM,
        });
        expect(fee.distance_km).toBe(0);
        expect(fee.total_fee).toBe(20); // 8 + 0 + 2×3 + 6
    });

    test('collect-back fee shown, but NOT in the total', async () => {
        const fee = await feeSer.calculateTotalFee({
            deliveryTypeId: 1, pickupZoneId: 1, dropoffZoneId: 1, pickupTime: MON_10AM, collectBack: true,
        });
        expect(fee.collect_back_fee).toBe(5);
        expect(fee.total_fee).toBe(14); // 8 + 6
    });

    test('inactive vehicle → error', async () => {
        deliveryTypesDat.getDeliveryTypeById.mockResolvedValue({ ...BIKE, is_active: 0 });
        await expect(feeSer.calculateTotalFee({ deliveryTypeId: 1, pickupZoneId: 1, dropoffZoneId: 1 }))
            .rejects.toThrow('Delivery type not found');
    });
});