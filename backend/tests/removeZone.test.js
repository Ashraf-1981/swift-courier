// For admin remove zone from courier

// fake data layer: no database needed
jest.mock('../dataLayer/couriersDat');
jest.mock('../servicesLayer/aiSer');

const couriersDat = require('../dataLayer/couriersDat');
const adminSer = require('../servicesLayer/adminSer');

// Business rule: only a courier's own zone can be removed
describe('adminSer.removeCourierZone', () => {
    test('courier has the zone → removed', async () => {
        couriersDat.getCourierById.mockResolvedValue({ id: 9, name: 'Ahmad' });
        couriersDat.removeCourierZone.mockResolvedValue(1);
        const res = await adminSer.removeCourierZone(9, 3);
        expect(res.message).toBe('Zone removed');
    });

    test('not a courier → error', async () => {
        couriersDat.getCourierById.mockResolvedValue(undefined);
        await expect(adminSer.removeCourierZone(4, 3)).rejects.toThrow('Courier not found');
    });

    test('courier does not have the zone → error', async () => {
        couriersDat.getCourierById.mockResolvedValue({ id: 9, name: 'Ahmad' });
        couriersDat.removeCourierZone.mockResolvedValue(0);
        await expect(adminSer.removeCourierZone(9, 99)).rejects.toThrow('Courier does not cover this zone');
    });
});