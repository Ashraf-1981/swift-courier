jest.mock('../dataLayer/deliveryTypesDat');
const deliveryTypesDat = require('../dataLayer/deliveryTypesDat');
const { suggestVehicle } = require('../servicesLayer/vehicleSer');

// fake vehicles with the real limits from the seed
const TYPES = {
    1: { id: 1, name: 'Bike', max_weight_kg: '10.00', max_length_cm: 40, max_width_cm: 30, max_height_cm: 30 },
    2: { id: 2, name: 'Car', max_weight_kg: '100.00', max_length_cm: 100, max_width_cm: 60, max_height_cm: 60 },
    3: { id: 3, name: 'Van', max_weight_kg: '1000.00', max_length_cm: 300, max_width_cm: 160, max_height_cm: 150 },
};

beforeEach(() => {
    deliveryTypesDat.getDeliveryTypeById.mockImplementation(async (id) => TYPES[id]);
});

const small = { lengthCm: 20, widthCm: 20, heightCm: 10 };

describe('suggestVehicle', () => {
    test('fits the chosen Bike → no upgrade', async () => {
        const r = await suggestVehicle({ deliveryTypeId: 1, weightKg: 5, ...small });
        expect(r).toEqual({ suggested: 'Bike', suggested_id: 1, upgraded: false });
    });
    test('too heavy for Bike → upgraded to Car', async () => {
        const r = await suggestVehicle({ deliveryTypeId: 1, weightKg: 30, ...small });
        expect(r.suggested).toBe('Car');
        expect(r.upgraded).toBe(true);
    });
    test('too long for Car → upgraded to Van', async () => {
        const r = await suggestVehicle({ deliveryTypeId: 2, weightKg: 30, lengthCm: 200, widthCm: 50, heightCm: 50 });
        expect(r.suggested).toBe('Van');
    });
    test('too big for any vehicle → error', async () => {
        await expect(suggestVehicle({ deliveryTypeId: 3, weightKg: 5000, ...small }))
            .rejects.toThrow('too big for any vehicle');
    });
    test('unknown vehicle id → error', async () => {
        await expect(suggestVehicle({ deliveryTypeId: 99, weightKg: 1, ...small }))
            .rejects.toThrow('Delivery type not found');
    });
});